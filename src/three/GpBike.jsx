import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { rig } from './CameraRig'
import { GP_URL } from '../lib/loader'
import { GARAGE } from './layout'

/**
 * A SketchUp export, so it arrives in centimetres, nose pointing down +X, and
 * with flat Kd-only materials. It gets metric, turned to face the same way as
 * the car (+Z), and given plausible PBR values by material name.
 */
export default function GpBike({ onIn }) {
  const { scene } = useGLTF(GP_URL)
  const group = useRef()
  const inner = useRef()

  const model = useMemo(() => {
    const root = scene.clone(true)

    root.traverse((o) => {
      if (!o.isMesh) return

      const mats = Array.isArray(o.material) ? o.material : [o.material]
      o.material = mats.map((src) => {
        const m = src.clone()
        const name = (m.name || '').toLowerCase()

        // SketchUp geometry has unreliable winding — better a doubled draw than
        // holes through the fairing.
        m.side = THREE.DoubleSide
        m.envMapIntensity = 1.35
        m.metalness = 0.35
        m.roughness = 0.5

        if (/velg|metal|alumin|brushed|bolt|silver|coolgray/.test(name)) {
          m.metalness = 0.92
          m.roughness = 0.26
        } else if (/concrete|carpet|fencing/.test(name)) {
          // the tyres and the seat, oddly named by the original modeller
          m.metalness = 0
          m.roughness = 0.94
          m.envMapIntensity = 0.4
        } else if (/carbon|charcoal|powder|black/.test(name)) {
          m.metalness = 0.45
          m.roughness = 0.42
        } else if (/glass|translucent/.test(name)) {
          m.transparent = true
          m.opacity = 0.32
          m.metalness = 0
          m.roughness = 0.08
          m.depthWrite = false
        } else if (/red|_11|m_0020/.test(name)) {
          // Ducati rosso: keep it saturated rather than let the env wash it out
          m.metalness = 0.2
          m.roughness = 0.3
        }

        if (m.map) {
          m.map.anisotropy = 8
          // textured panels carry their own shading already
          m.metalness = Math.min(m.metalness, 0.25)
          m.roughness = 0.55
        }

        m.needsUpdate = true
        return m
      })
      if (o.material.length === 1) o.material = o.material[0]
    })

    // centimetres → metres, nose to +Z, wheels on the floor, centred on x/z
    root.rotation.y = -Math.PI / 2
    root.updateMatrixWorld(true)

    const raw = new THREE.Box3().setFromObject(root)
    const size = raw.getSize(new THREE.Vector3())
    const scale = GARAGE.gp.length / Math.max(size.x, size.z)
    root.scale.setScalar(scale)
    root.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(root)
    const centre = box.getCenter(new THREE.Vector3())
    root.position.set(-centre.x, -box.min.y, -centre.z)

    return root
  }, [scene])

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onIn?.()))
    return () => cancelAnimationFrame(id)
  }, [onIn])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.visible = rig.gpVis
      if (!rig.gpVis) return
      group.current.rotation.y = rig.gpRotY + Math.sin(t * 0.24 + 1.1) * 0.02
    }
    if (inner.current) {
      // a bike is never quite upright: a slow lean keeps it alive on its stand
      inner.current.rotation.z = -0.07 + Math.sin(t * 0.5) * 0.016
      inner.current.position.y = Math.sin(t * 0.7) * 0.012
    }
  })

  return (
    <group ref={group} position={[GARAGE.gp.x, 0.02, 0]}>
      <group ref={inner}>
        <primitive object={model} />
      </group>
    </group>
  )
}
