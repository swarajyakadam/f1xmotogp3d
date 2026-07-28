/**
 * Merge every primitive that shares a material into one, so the Ducati draws in
 * ~50 calls instead of 873. Optionally quantises positions and normals
 * (KHR_mesh_quantization, which three's GLTFLoader understands) to cut bytes.
 *
 *   node merge.mjs in.glb out.glb [--quantize]
 */
import fs from 'node:fs'

const [inPath, outPath] = process.argv.slice(2)
const QUANT = process.argv.includes('--quantize')

/* ── read ─────────────────────────────────────────────────────── */
const glb = fs.readFileSync(inPath)
const jsonLen = glb.readUInt32LE(12)
const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'))
const binStart = 20 + jsonLen + 8
const bin = glb.subarray(binStart, binStart + glb.readUInt32LE(20 + jsonLen))

const COMP = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const NUM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

function read(accIndex) {
  const a = json.accessors[accIndex]
  const v = json.bufferViews[a.bufferView]
  const n = NUM[a.type]
  const stride = v.byteStride || COMP[a.componentType] * n
  const base = (v.byteOffset || 0) + (a.byteOffset || 0)
  const out =
    a.componentType === 5126 ? new Float32Array(a.count * n) : new Uint32Array(a.count * n)
  for (let i = 0; i < a.count; i++) {
    const o = base + i * stride
    for (let c = 0; c < n; c++) {
      const p = o + c * COMP[a.componentType]
      out[i * n + c] =
        a.componentType === 5126
          ? bin.readFloatLE(p)
          : a.componentType === 5123
            ? bin.readUInt16LE(p)
            : a.componentType === 5125
              ? bin.readUInt32LE(p)
              : bin.readUInt8(p)
    }
  }
  return out
}

/* ── group primitives by material ─────────────────────────────── */
const groups = new Map()
for (const node of json.nodes) {
  if (node.mesh == null) continue
  for (const p of json.meshes[node.mesh].primitives) {
    const key = p.material ?? -1
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  }
}

const merged = []
let totalVerts = 0
let totalTris = 0

for (const [material, prims] of groups) {
  const pos = []
  const nor = []
  const uv = []
  const idx = []
  const seen = new Map()

  for (const p of prims) {
    const P = read(p.attributes.POSITION)
    const N = read(p.attributes.NORMAL)
    const T = p.attributes.TEXCOORD_0 != null ? read(p.attributes.TEXCOORD_0) : null
    const I = read(p.indices)
    const remap = new Int32Array(P.length / 3).fill(-1)

    for (let k = 0; k < I.length; k++) {
      const i = I[k]
      let dst = remap[i]
      if (dst < 0) {
        // weld across the primitives that are about to become one
        const key =
          `${P[i * 3].toFixed(4)},${P[i * 3 + 1].toFixed(4)},${P[i * 3 + 2].toFixed(4)}|` +
          `${N[i * 3].toFixed(3)},${N[i * 3 + 1].toFixed(3)},${N[i * 3 + 2].toFixed(3)}|` +
          (T ? `${T[i * 2].toFixed(4)},${T[i * 2 + 1].toFixed(4)}` : '')
        const hit = seen.get(key)
        if (hit !== undefined) {
          dst = hit
        } else {
          dst = pos.length / 3
          pos.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])
          nor.push(N[i * 3], N[i * 3 + 1], N[i * 3 + 2])
          uv.push(T ? T[i * 2] : 0, T ? T[i * 2 + 1] : 0)
          seen.set(key, dst)
        }
        remap[i] = dst
      }
      idx.push(dst)
    }
  }

  totalVerts += pos.length / 3
  totalTris += idx.length / 3
  merged.push({ material, pos, nor, uv, idx })
}

/* ── global bounds, for position quantisation ─────────────────── */
const lo = [Infinity, Infinity, Infinity]
const hi = [-Infinity, -Infinity, -Infinity]
for (const m of merged) {
  for (let i = 0; i < m.pos.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      if (m.pos[i + c] < lo[c]) lo[c] = m.pos[i + c]
      if (m.pos[i + c] > hi[c]) hi[c] = m.pos[i + c]
    }
  }
}
const centre = lo.map((v, c) => (v + hi[c]) / 2)
const half = Math.max(...hi.map((v, c) => Math.max(v - centre[c], centre[c] - lo[c]))) || 1
const posScale = half / 32767

/* ── write ────────────────────────────────────────────────────── */
const chunks = []
let offset = 0
const bufferViews = []

function pushView(buf, extra = {}) {
  while (offset % 4) {
    chunks.push(Buffer.alloc(1))
    offset++
  }
  const view = { buffer: 0, byteOffset: offset, byteLength: buf.length, ...extra }
  chunks.push(buf)
  offset += buf.length
  bufferViews.push(view)
  return bufferViews.length - 1
}

const accessors = []
function pushAccessor(a) {
  accessors.push(a)
  return accessors.length - 1
}

const primitives = []

for (const m of merged) {
  const count = m.pos.length / 3
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]

  let posView, posAcc
  if (QUANT) {
    const q = new Int16Array(count * 3)
    for (let i = 0; i < count; i++) {
      for (let c = 0; c < 3; c++) {
        const v = Math.round((m.pos[i * 3 + c] - centre[c]) / posScale)
        q[i * 3 + c] = Math.max(-32768, Math.min(32767, v))
        if (q[i * 3 + c] < min[c]) min[c] = q[i * 3 + c]
        if (q[i * 3 + c] > max[c]) max[c] = q[i * 3 + c]
      }
    }
    // VEC3 of SHORT is 6 bytes; glTF wants element alignment of 4, hence the pad
    const padded = Buffer.alloc(count * 8)
    for (let i = 0; i < count; i++) {
      padded.writeInt16LE(q[i * 3], i * 8)
      padded.writeInt16LE(q[i * 3 + 1], i * 8 + 2)
      padded.writeInt16LE(q[i * 3 + 2], i * 8 + 4)
    }
    posView = pushView(padded, { target: 34962, byteStride: 8 })
    posAcc = pushAccessor({
      bufferView: posView,
      componentType: 5122,
      count,
      type: 'VEC3',
      min,
      max,
    })
  } else {
    const f = Float32Array.from(m.pos)
    for (let i = 0; i < count; i++) {
      for (let c = 0; c < 3; c++) {
        const v = f[i * 3 + c]
        if (v < min[c]) min[c] = v
        if (v > max[c]) max[c] = v
      }
    }
    posView = pushView(Buffer.from(f.buffer, f.byteOffset, f.byteLength), {
      target: 34962,
      byteStride: 12,
    })
    posAcc = pushAccessor({
      bufferView: posView,
      componentType: 5126,
      count,
      type: 'VEC3',
      min,
      max,
    })
  }

  let norAcc
  if (QUANT) {
    const padded = Buffer.alloc(count * 4)
    for (let i = 0; i < count; i++) {
      for (let c = 0; c < 3; c++) {
        const v = Math.max(-1, Math.min(1, m.nor[i * 3 + c]))
        padded.writeInt8(Math.round(v * 127), i * 4 + c)
      }
    }
    const view = pushView(padded, { target: 34962, byteStride: 4 })
    norAcc = pushAccessor({
      bufferView: view,
      componentType: 5120,
      normalized: true,
      count,
      type: 'VEC3',
    })
  } else {
    const f = Float32Array.from(m.nor)
    const view = pushView(Buffer.from(f.buffer, f.byteOffset, f.byteLength), {
      target: 34962,
      byteStride: 12,
    })
    norAcc = pushAccessor({ bufferView: view, componentType: 5126, count, type: 'VEC3' })
  }

  const uvF = Float32Array.from(m.uv)
  const uvView = pushView(Buffer.from(uvF.buffer, uvF.byteOffset, uvF.byteLength), {
    target: 34962,
    byteStride: 8,
  })
  const uvAcc = pushAccessor({ bufferView: uvView, componentType: 5126, count, type: 'VEC2' })

  const wide = count > 65535
  const iArr = wide ? Uint32Array.from(m.idx) : Uint16Array.from(m.idx)
  const iView = pushView(Buffer.from(iArr.buffer, iArr.byteOffset, iArr.byteLength), {
    target: 34963,
  })
  const iAcc = pushAccessor({
    bufferView: iView,
    componentType: wide ? 5125 : 5123,
    count: m.idx.length,
    type: 'SCALAR',
  })

  const prim = {
    attributes: { POSITION: posAcc, NORMAL: norAcc, TEXCOORD_0: uvAcc },
    indices: iAcc,
    mode: 4,
  }
  if (m.material >= 0) prim.material = m.material
  primitives.push(prim)
}

/* images keep their bytes, copied across into the new buffer */
const images = (json.images || []).map((im) => {
  const v = json.bufferViews[im.bufferView]
  const view = pushView(
    Buffer.from(bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength))
  )
  return { mimeType: im.mimeType, bufferView: view, name: im.name }
})

const binOut = Buffer.concat(chunks)

const node = { mesh: 0, name: 'ducati' }
if (QUANT) {
  node.translation = centre
  node.scale = [posScale, posScale, posScale]
}

const out = {
  asset: { version: '2.0', generator: 'merge.mjs' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [node],
  meshes: [{ name: 'ducati', primitives }],
  materials: json.materials,
  textures: json.textures,
  samplers: json.samplers,
  images,
  accessors,
  bufferViews,
  buffers: [{ byteLength: binOut.length }],
}
if (QUANT) {
  out.extensionsUsed = ['KHR_mesh_quantization']
  out.extensionsRequired = ['KHR_mesh_quantization']
}

const jsonBuf = Buffer.from(JSON.stringify(out), 'utf8')
const jsonPad = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)])
const binPad = Buffer.concat([binOut, Buffer.alloc((4 - (binOut.length % 4)) % 4)])

const header = Buffer.alloc(12)
header.write('glTF', 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + jsonPad.length + 8 + binPad.length, 8)

const jsonHead = Buffer.alloc(8)
jsonHead.writeUInt32LE(jsonPad.length, 0)
jsonHead.writeUInt32LE(0x4e4f534a, 4)

const binHead = Buffer.alloc(8)
binHead.writeUInt32LE(binPad.length, 0)
binHead.writeUInt32LE(0x004e4942, 4)

fs.writeFileSync(outPath, Buffer.concat([header, jsonHead, jsonPad, binHead, binPad]))

console.log({
  primitives: primitives.length,
  vertices: totalVerts,
  triangles: totalTris,
  quantized: QUANT,
  sizeMB: +(fs.statSync(outPath).size / 1048576).toFixed(2),
})
