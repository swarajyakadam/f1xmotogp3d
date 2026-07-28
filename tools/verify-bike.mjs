/**
 * Parses the shipped bike GLB with the real three.js GLTFLoader and runs the
 * same transform GpBike applies, so the placement can be checked without a GPU.
 * Textures are stripped first — Node has no ImageBitmap, and their bytes are
 * copied verbatim from obj2gltf anyway.
 */
import fs from 'node:fs'
import * as THREE from '../node_modules/three/build/three.module.js'
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const src = fs.readFileSync(process.argv[2])
const jsonLen = src.readUInt32LE(12)
const json = JSON.parse(src.subarray(20, 20 + jsonLen).toString('utf8'))
const binLen = src.readUInt32LE(20 + jsonLen)
const bin = src.subarray(20 + jsonLen + 8, 20 + jsonLen + 8 + binLen)

delete json.images
delete json.textures
delete json.samplers
json.materials = json.materials.map((m) => ({ name: m.name }))

const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8')
const jsonPad = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)])
const header = Buffer.alloc(12)
header.write('glTF', 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + jsonPad.length + 8 + bin.length, 8)
const jh = Buffer.alloc(8)
jh.writeUInt32LE(jsonPad.length, 0)
jh.writeUInt32LE(0x4e4f534a, 4)
const bh = Buffer.alloc(8)
bh.writeUInt32LE(bin.length, 0)
bh.writeUInt32LE(0x004e4942, 4)
const glb = Buffer.concat([header, jh, jsonPad, bh, bin])

const ab = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength)

new GLTFLoader().parse(
  ab,
  '',
  (gltf) => {
    const root = gltf.scene

    // ── exactly what GpBike does ──────────────────────────────
    const LENGTH = 2.15
    root.rotation.y = -Math.PI / 2
    root.updateMatrixWorld(true)

    const raw = new THREE.Box3().setFromObject(root)
    const size = raw.getSize(new THREE.Vector3())
    const scale = LENGTH / Math.max(size.x, size.z)
    root.scale.setScalar(scale)
    root.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(root)
    const centre = box.getCenter(new THREE.Vector3())
    root.position.set(-centre.x, -box.min.y, -centre.z)
    root.updateMatrixWorld(true)

    const final = new THREE.Box3().setFromObject(root)
    const f = final.getSize(new THREE.Vector3())

    let meshes = 0
    let tris = 0
    root.traverse((o) => {
      if (!o.isMesh) return
      meshes++
      tris += o.geometry.index.count / 3
    })

    const fmt = (v) => +v.toFixed(3)
    console.log({
      parsed: true,
      meshes,
      triangles: tris,
      rawSizeCm: [size.x, size.y, size.z].map((v) => Math.round(v)),
      scale: +scale.toFixed(5),
      finalSizeM: { width: fmt(f.x), height: fmt(f.y), length: fmt(f.z) },
      finalBounds: {
        x: [fmt(final.min.x), fmt(final.max.x)],
        y: [fmt(final.min.y), fmt(final.max.y)],
        z: [fmt(final.min.z), fmt(final.max.z)],
      },
    })

    // Which end is the nose? The windscreen material sat at max local X, and
    // the -90° turn should have swung that to +Z.
    const glassNames = ['Translucent_Glass_Blue', 'Translucent_Glass_Gray']
    root.traverse((o) => {
      if (!o.isMesh || !glassNames.includes(o.material?.name)) return
      const b = new THREE.Box3().setFromObject(o)
      console.log(`  ${o.material.name}: z ${fmt(b.min.z)}..${fmt(b.max.z)}, y ${fmt(b.min.y)}..${fmt(b.max.y)}`)
    })
  },
  (err) => {
    console.error('PARSE FAILED:', err)
    process.exitCode = 1
  }
)
