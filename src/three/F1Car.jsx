import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { rig } from './CameraRig'
import { F1_URL } from '../lib/loader'
import { GARAGE } from './layout'
import { spin } from '../lib/spin'
import { lerp } from '../lib/scroll'

/**
 * The model ships from Sketchfab with a few export quirks:
 *  - every material is alphaMode BLEND, which wrecks depth sorting
 *  - emissive is set to full white with a texture, which flattens the car
 *  - it is not centred on its own origin
 * All three are corrected here, once, on load.
 */
export default function F1Car({ onIn }) {
  const { scene } = useGLTF(F1_URL)
  const group = useRef()
  const inner = useRef()

  const model = useMemo(() => {
    const root = scene.clone(true)

    root.traverse((o) => {
      if (!o.isMesh) return
      o.frustumCulled = false

      const mats = Array.isArray(o.material) ? o.material : [o.material]
      o.material = mats.map((src) => {
        const m = src.clone()
        const name = (m.name || '').toLowerCase()

        if (name.includes('decal')) {
          // keep the cut-out shape, drop the blending that sorted them wrong
          m.transparent = false
          m.alphaTest = 0.5
          m.depthWrite = true
          m.polygonOffset = true
          m.polygonOffsetFactor = -2
        } else {
          m.transparent = false
          m.alphaTest = 0
          m.depthWrite = true
        }

        // tame the exporter's full-white emissive
        m.emissive = new THREE.Color('#ffffff')
        m.emissiveIntensity = 0.06

        m.envMapIntensity = name.includes('tire') ? 0.35 : 1.5
        m.side = THREE.FrontSide

        if (name.includes('tire')) {
          m.roughness = 0.95
          m.metalness = 0.0
        }

        for (const key of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap']) {
          if (m[key]) m[key].anisotropy = 8
        }
        m.needsUpdate = true
        return m
      })
      if (o.material.length === 1) o.material = o.material[0]
    })

    // centre on origin, keep the wheels planted on y = 0
    const box = new THREE.Box3().setFromObject(root)
    const centre = box.getCenter(new THREE.Vector3())
    root.position.set(-centre.x, -box.min.y, -centre.z)

    return root
  }, [scene])

  // report once the car is parsed and a frame has actually gone out
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onIn?.()))
    return () => cancelAnimationFrame(id)
  }, [onIn])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const d = Math.min(delta, 1 / 30)

    // Hand-spin: carries on turning after the pointer lets go, and unwinds
    // back to the authored heading as the hero scrolls away — so the shots
    // further down the page still frame the car the way they were composed.
    if (!spin.dragging) {
      spin.angle += spin.velocity
      spin.velocity *= Math.pow(0.015, d)
    }
    spin.angle = lerp(spin.angle, 0, (1 - rig.f1Spin) * (1 - Math.pow(0.08, d)))

    if (group.current) {
      group.current.visible = rig.f1Vis
      if (!rig.f1Vis) return
      // scroll drives the heading, the pointer adds to it, idle motion keeps
      // it breathing
      group.current.rotation.y = rig.f1RotY + spin.angle + Math.sin(t * 0.28) * 0.022
    }
    if (inner.current) {
      inner.current.position.y = Math.sin(t * 0.62) * 0.018
      inner.current.rotation.z = Math.sin(t * 0.44) * 0.006
      inner.current.rotation.x = Math.sin(t * 0.35 + 1.2) * 0.005
    }
  })

  return (
    <group ref={group} position={[GARAGE.f1.x, 0.02, 0]}>
      <group ref={inner}>
        <primitive object={model} />
      </group>
    </group>
  )
}
