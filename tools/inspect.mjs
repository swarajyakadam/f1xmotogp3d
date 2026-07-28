import fs from 'node:fs'

const buf = fs.readFileSync(process.argv[2])
const jsonLen = buf.readUInt32LE(12)
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))

const prims = (json.meshes || []).reduce((n, m) => n + m.primitives.length, 0)
let tri = 0
for (const m of json.meshes || []) {
  for (const p of m.primitives) {
    const acc = p.indices != null ? json.accessors[p.indices] : json.accessors[p.attributes.POSITION]
    tri += acc.count / 3
  }
}
const bufBytes = (json.buffers || []).reduce((n, b) => n + b.byteLength, 0)
let imgBytes = 0
for (const im of json.images || []) {
  if (im.bufferView != null) imgBytes += json.bufferViews[im.bufferView].byteLength
}

console.log({
  meshes: (json.meshes || []).length,
  primitives: prims,
  triangles: Math.round(tri),
  materials: (json.materials || []).length,
  images: (json.images || []).length,
  nodes: (json.nodes || []).length,
  accessors: (json.accessors || []).length,
  bufferMB: +(bufBytes / 1048576).toFixed(2),
  imageMB: +(imgBytes / 1048576).toFixed(2),
  extensions: json.extensionsUsed,
  indexed: (json.meshes || [])[0]?.primitives?.[0]?.indices != null,
})
console.log('materials:', (json.materials || []).map((m) => m.name).join(', ').slice(0, 900))
