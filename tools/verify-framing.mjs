/**
 * Replays every CameraRig keyframe against the real bounding boxes of both
 * models and reports where each machine lands on screen. A GPU-free way to
 * answer "is the thing actually in frame, and is it on the opposite side from
 * the copy?" — the two questions a screenshot would answer.
 *
 *   node tools/verify-framing.mjs [aspect]
 */
import fs from 'node:fs'
import * as THREE from '../node_modules/three/build/three.module.js'
import { KEYS } from '../src/three/shots.js'
import { GARAGE, WORDMARK } from '../src/three/layout.js'

const ASPECT = Number(process.argv[2]) || 16 / 9

/* ── bounding boxes, straight out of the glb accessors ────────── */
function modelBox(path) {
  const buf = fs.readFileSync(path)
  const jsonLen = buf.readUInt32LE(12)
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))

  const box = new THREE.Box3()
  const v = new THREE.Vector3()

  const walk = (nodeIndex, parent) => {
    const node = json.nodes[nodeIndex]
    const local = new THREE.Matrix4()
    if (node.matrix) local.fromArray(node.matrix)
    else {
      local.compose(
        new THREE.Vector3().fromArray(node.translation || [0, 0, 0]),
        new THREE.Quaternion().fromArray(node.rotation || [0, 0, 0, 1]),
        new THREE.Vector3().fromArray(node.scale || [1, 1, 1])
      )
    }
    const world = new THREE.Matrix4().multiplyMatrices(parent, local)

    if (node.mesh != null) {
      for (const p of json.meshes[node.mesh].primitives) {
        const a = json.accessors[p.attributes.POSITION]
        for (let i = 0; i < 8; i++) {
          v.set(
            i & 1 ? a.max[0] : a.min[0],
            i & 2 ? a.max[1] : a.min[1],
            i & 4 ? a.max[2] : a.min[2]
          ).applyMatrix4(world)
          box.expandByPoint(v)
        }
      }
    }
    for (const c of node.children || []) walk(c, world)
  }

  for (const n of json.scenes[json.scene || 0].nodes) walk(n, new THREE.Matrix4())
  return box
}

const carRaw = modelBox('public/models/ferrari_f1_2019.glb')
const bikeRaw = modelBox('public/models/ducati_motogp.glb')

/** Both components centre on x/z and drop the wheels onto y = 0. */
function place(raw, { x = 0, scale = 1, rotY = 0 } = {}) {
  const size = raw.getSize(new THREE.Vector3())
  const s = new THREE.Vector3(size.x, size.y, size.z).multiplyScalar(scale)
  if (rotY) {
    const w = s.x
    s.x = s.z
    s.z = w
  }
  return new THREE.Box3(
    new THREE.Vector3(x - s.x / 2, 0, -s.z / 2),
    new THREE.Vector3(x + s.x / 2, s.y, s.z / 2)
  )
}

const GP_X = GARAGE.gp.x
const bikeSize = bikeRaw.getSize(new THREE.Vector3())
const bikeScale = 2.15 / Math.max(bikeSize.z, bikeSize.x)

const car = place(carRaw, { x: 0 })
const bike = place(bikeRaw, { x: GP_X, scale: bikeScale, rotY: Math.PI / 2 })

/** The wordmark plane, turned about Y and swept into an axis-aligned box. */
const wordH = WORDMARK.width / WORDMARK.aspect
const wordHalf = (WORDMARK.width / 2) * Math.cos(WORDMARK.rotY)
const wordDepth = (WORDMARK.width / 2) * Math.sin(WORDMARK.rotY)
const word = new THREE.Box3(
  new THREE.Vector3(WORDMARK.x - wordHalf, WORDMARK.base, WORDMARK.z - wordDepth),
  new THREE.Vector3(WORDMARK.x + wordHalf, WORDMARK.base + wordH, WORDMARK.z + wordDepth)
)

console.log('car  size', carRaw.getSize(new THREE.Vector3()).toArray().map((n) => +n.toFixed(2)))
console.log('bike size', bike.getSize(new THREE.Vector3()).toArray().map((n) => +n.toFixed(2)))
console.log('aspect', +ASPECT.toFixed(2), '\n')

const corner = new THREE.Vector3()

/** Screen box of a set of world boxes, for a given camera. */
function project(cam, boxes) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let behind = 0
  for (const box of boxes) {
    for (let i = 0; i < 8; i++) {
      corner
        .set(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z
        )
        .applyMatrix4(cam.matrixWorldInverse)
      if (corner.z > -0.1) behind++
      corner.applyMatrix4(cam.projectionMatrix)
      const sx = (corner.x + 1) / 2
      const sy = (1 - corner.y) / 2
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy)
      maxY = Math.max(maxY, sy)
    }
  }
  return { minX, maxX, minY, maxY, behind }
}

const REF_ASPECT = 16 / 9
/** Stand-in for the viewport width, so the stacked-layout rule can be replayed. */
const WIDTH = ASPECT < 1.2 ? 375 : 1440

/** Mirrors what CameraRig does to a keyframe every frame. */
function build(k, dolly = 1, bias = k.bias) {
  const cam = new THREE.PerspectiveCamera(k.fov, ASPECT, 0.1, 200)
  const tgt = new THREE.Vector3().fromArray(k.tgt)
  cam.position
    .fromArray(k.pos)
    .sub(tgt)
    .multiplyScalar(dolly * (ASPECT < REF_ASPECT ? Math.pow(REF_ASPECT / ASPECT, 0.8) : 1))
    .add(tgt)
  cam.lookAt(tgt)

  let [bx, by] = bias
  if (WIDTH < 900) {
    bx *= 0.25
    by = 0.22
  }
  const dist = cam.position.distanceTo(tgt)
  const halfY = Math.tan((k.fov * Math.PI) / 360) * dist
  cam.translateX(-bx * 2 * halfY * ASPECT)
  cam.translateY(-by * 2 * halfY)
  cam.updateMatrixWorld(true)
  cam.updateProjectionMatrix()
  return cam
}

/**
 * Solves for a dolly distance and screen bias that put the machine in the half
 * of the frame the copy does not use. Bias is a pure screen translation by
 * construction, so the correction is simply the distance to the wanted centre.
 */
if (process.argv.includes('--tune')) {
  console.log('suggested:')
  for (const k of KEYS) {
    const boxes = k.show.map((s) => (s === 'f1' ? car : bike))
    const wantW = k.side === 'full' ? 0.42 : 0.4
    const wantCx = k.side === 'left' ? 0.78 : k.side === 'right' ? 0.22 : 0.5
    const wantCy = k.side === 'full' ? 0.26 : 0.44

    let dolly = 1
    for (let i = 0; i < 40; i++) {
      const b = project(build(k, dolly), boxes)
      const w = b.maxX - b.minX
      if (Math.abs(w - wantW) < 0.005) break
      dolly *= w / wantW
    }
    let bias = [...k.bias]
    for (let i = 0; i < 30; i++) {
      const b = project(build(k, dolly, bias), boxes)
      const dx = wantCx - (b.minX + b.maxX) / 2
      const dy = wantCy - (b.minY + b.maxY) / 2
      if (Math.abs(dx) < 0.004 && Math.abs(dy) < 0.004) break
      bias = [bias[0] + dx, bias[1] - dy]
    }
    const tgt = new THREE.Vector3().fromArray(k.tgt)
    const pos = new THREE.Vector3()
      .fromArray(k.pos)
      .sub(tgt)
      .multiplyScalar(dolly)
      .add(tgt)
    const r = (v) => +v.toFixed(2)
    console.log(
      `${k.id.padEnd(9)} pos: [${r(pos.x)}, ${r(pos.y)}, ${r(pos.z)}]  bias: [${r(bias[0])}, ${r(bias[1])}]  (dolly ×${dolly.toFixed(2)})`
    )
  }
  console.log()
}

for (const k of KEYS) {
  const cam = build(k)
  const report = []
  for (const [name, box] of [['f1', car], ['gp', bike], ['word', word]]) {
    if (name === 'word' ? !k.word : !k.show.includes(name)) continue
    const b = project(cam, [box])
    const pc = (v) => Math.round(v * 100) + '%'
    const onScreen = b.maxX > 0 && b.minX < 1 && b.maxY > 0 && b.minY < 1 && b.behind < 8
    report.push(`${name}: x ${pc(b.minX)}..${pc(b.maxX)}  y ${pc(b.minY)}..${pc(b.maxY)}` + (b.behind ? `  [${b.behind}/8 behind camera]` : '') + (onScreen ? '' : '  x OFF SCREEN'))
  }
  const copy = WIDTH < 900 ? 'full width, below' : k.side === 'left' ? '0..~60%' : k.side === 'right' ? '~40..100%' : 'centred panel'
  console.log(`${k.id.padEnd(9)} copy ${copy.padEnd(17)} ${report.join('   ')}`)
}
