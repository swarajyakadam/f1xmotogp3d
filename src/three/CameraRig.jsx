import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anchors, measureAnchors, scrollState, clamp, lerp, plateau } from '../lib/scroll'
import { KEYS } from './shots'

/**
 * Written to every frame, read by the two models. Avoids a React round-trip.
 * `*Vis` lets a machine switch itself off entirely while the shot is nowhere
 * near it — a hidden group costs nothing to draw.
 */
export const rig = {
  f1RotY: -0.3,
  gpRotY: -0.5,
  f1Vis: true,
  gpVis: false,
  gpWord: 0,
  f1Spin: 0,
}

/** The window shape every shot in shots.js was composed for. */
export const REF_ASPECT = 16 / 9
/** Below this width the copy has the full column, so the machine only lifts. */
export const STACKED_WIDTH = 900

const vPos = new THREE.Vector3()
const vTgt = new THREE.Vector3()
const vAway = new THREE.Vector3()
const cur = new THREE.Vector3()
const curTgt = new THREE.Vector3()
const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
  })
}

export default function CameraRig() {
  const { camera, size } = useThree()
  const started = useRef(false)

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 30)

    // Self-sufficient on purpose: if smooth scroll never initialised, the
    // camera still has to follow the page rather than freeze on the hero.
    if (!anchors.list.length) measureAnchors()
    const list = anchors.list
    if (!list.length) return

    // Lenis drives the real window scroll, so window.scrollY is the smoothed
    // truth — reading it directly keeps the rig working even if Lenis is gone.
    const y = window.scrollY || scrollState.y || 0
    const mid = y + window.innerHeight / 2
    let i = 0
    for (let k = 0; k < list.length - 1; k++) {
      if (mid >= list[k].center) i = k
    }
    const a = list[i]
    const b = list[Math.min(i + 1, list.length - 1)]
    const span = Math.max(1, b.center - a.center)
    const raw = clamp((mid - a.center) / span)
    const t = plateau(raw)

    const kA = KEYS[Math.min(i, KEYS.length - 1)]
    const kB = KEYS[Math.min(i + 1, KEYS.length - 1)]

    // anything either end of the blend needs is drawn for the whole blend
    rig.f1Vis = kA.show.includes('f1') || kB.show.includes('f1')
    rig.gpVis = kA.show.includes('gp') || kB.show.includes('gp')

    vPos.set(
      lerp(kA.pos[0], kB.pos[0], t),
      lerp(kA.pos[1], kB.pos[1], t),
      lerp(kA.pos[2], kB.pos[2], t)
    )
    vTgt.set(
      lerp(kA.tgt[0], kB.tgt[0], t),
      lerp(kA.tgt[1], kB.tgt[1], t),
      lerp(kA.tgt[2], kB.tgt[2], t)
    )

    // The shots are framed for a 16:9 window. Anything narrower sees less of
    // the world at the same distance, so the camera backs off — fully
    // compensating would leave a 7 m car the size of a thumbnail on a phone,
    // hence the exponent rather than a straight ratio.
    const aspect = size.width / size.height
    vAway.copy(vPos).sub(vTgt)
    if (aspect < REF_ASPECT) vAway.multiplyScalar(Math.pow(REF_ASPECT / aspect, 0.8))
    vPos.copy(vTgt).add(vAway)

    rig.f1RotY = lerp(kA.f1, kB.f1, t)
    rig.gpRotY = lerp(kA.gp, kB.gp, t)
    rig.gpWord = lerp(kA.word || 0, kB.word || 0, t)
    rig.f1Spin = lerp(kA.spin || 0, kB.spin || 0, t)

    // pointer parallax, damped so it feels like weight rather than jitter
    mouse.x = lerp(mouse.x, mouse.tx, 1 - Math.pow(0.001, d))
    mouse.y = lerp(mouse.y, mouse.ty, 1 - Math.pow(0.001, d))
    vPos.x += mouse.x * 0.55
    vPos.y += -mouse.y * 0.34

    // a shove of camera shake proportional to scroll velocity
    const kick = clamp(Math.abs(scrollState.velocity) / 55) * 0.06
    vPos.y += Math.sin(performance.now() * 0.02) * kick
    vPos.x += Math.cos(performance.now() * 0.017) * kick

    if (!started.current) {
      cur.copy(vPos)
      curTgt.copy(vTgt)
      started.current = true
    }

    const s = 1 - Math.pow(0.0012, d)
    cur.lerp(vPos, s)
    curTgt.lerp(vTgt, s)

    camera.position.copy(cur)
    camera.lookAt(curTgt)

    const fov = lerp(kA.fov, kB.fov, t)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = lerp(camera.fov, fov, s)
      camera.updateProjectionMatrix()
    }

    // Screen-space pan. Sliding the camera sideways after it has aimed moves
    // the machine across the frame without turning away from it, which is what
    // keeps the copy on clean black instead of on top of a lit carbon panel.
    const dist = cur.distanceTo(curTgt)
    const halfY = Math.tan((camera.fov * Math.PI) / 360) * dist
    const halfX = halfY * aspect
    let bx = lerp(kA.bias[0], kB.bias[0], t)
    let by = lerp(kA.bias[1], kB.bias[1], t)
    if (size.width < STACKED_WIDTH) {
      // stacked layout: no room to sit beside the machine, so lift it clear
      bx *= 0.25
      by = 0.22
    }
    camera.translateX(-bx * 2 * halfX)
    camera.translateY(-by * 2 * halfY)
  })

  return null
}
