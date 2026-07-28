# APEX — Formula 1 & MotoGP, explained

An information site about the two premier classes of circuit racing, built
around two 3D machines. One persistent WebGL canvas sits behind the whole
document: an F1 car and a MotoGP prototype are parked in the same virtual
garage, and scrolling flies the camera between them through eight framed shots
while the copy reveals over the top.

```bash
npm install
npm run dev
```

## Where to change things

| I want to change…            | File                                                    |
| ---------------------------- | ------------------------------------------------------- |
| Every word on the site       | `src/data/content.js`                                   |
| Camera shots per section     | `src/three/CameraRig.jsx` → `KEYS`                       |
| Where each machine is parked | `src/three/layout.js` → `GARAGE`                         |
| Lighting / floor / bloom     | `src/three/Stage.jsx`                                    |
| Colours, type, spacing       | `src/styles/global.css` → `:root`                        |
| Scroll feel                  | `src/lib/scroll.js` → the Lenis options                  |

## Keeping the copy readable over a 3D scene

Type on top of a lit carbon panel is unreadable, so legibility is built into
the layout rather than left to chance. Three things cooperate:

1. **Every section declares a side.** `data-side="left" | "right" | "full"` on
   the `<section>` picks which half of the screen the copy occupies.
2. **A scrim matches it.** `section[data-section]::before` lays a gradient over
   the canvas on that side — near-opaque under the text, clear on the other
   half. Below 900px there is no second half, so the gradient turns vertical:
   the machine reads through the top of the section, the copy sits on black
   underneath.
3. **The camera pans to the opposite half.** Each keyframe carries a
   `bias: [x, y]` in *screen* fractions. After the camera has aimed, the rig
   slides it sideways so the machine moves across the frame without turning
   away from it.

Dense blocks — spec tables, the weekend schedule, the glossary — also sit on a
`.panel` surface, which does not rely on the gradient at all.

### Tuning a camera shot

`KEYS` in `src/three/shots.js` holds one entry per section, anchored to that
section's vertical centre and eased between with a plateau so the shot settles
while you read. It is a plain module with no React in it, so the verification
tool reads the same list the site runs.

```js
{
  pos: [4.0, 1.15, 6.1],   // camera position, metres
  tgt: [0.15, 0.6, 0.1],   // the point it looks at — lands at screen centre
  f1: -0.32, gp: -0.5,     // each machine's heading, radians
  fov: 34,                 // vertical field of view; lower = longer lens
  bias: [0.24, 0.08],      // screen-space pan: +x right, +y up
  show: ['f1'],            // which machines are drawn at all
}
```

Both machines are centred on their parking space with wheels at `y = 0` and
**noses pointing +Z**. The car is 7.08 m long and lives at `x = 0`; the bike is
2.15 m long and lives at `x = 9.4` (`GARAGE` in `src/three/layout.js`). Aim
`tgt` *below* a machine's mid-height to push it higher in frame.

Do not eyeball these. Both models are far larger in frame than they feel while
authoring, and a shot that seems fine is usually sitting on the copy:

```bash
node tools/verify-framing.mjs 1.78          # where each machine lands, in %
node tools/verify-framing.mjs 0.46          # the same, on a portrait phone
node tools/verify-framing.mjs 1.78 --tune   # re-solve pos and bias
```

It projects the real bounding boxes through the real keyframes and prints the
screen rectangle each machine occupies, which is the part a screenshot would
have told you. `--tune` solves for the distance and bias that put a machine in
the half the copy does not use.

## Notes on the models

`public/models/ferrari_f1_2019.glb` (27.8 MB) is the Sketchfab export,
unmodified. Three of its quirks are corrected at load time in
`src/three/F1Car.jsx`: every material ships as `alphaMode: BLEND` which breaks
depth sorting, `emissiveFactor` is full white which flattens the car under
studio light, and the mesh is not centred on its own origin.

`public/models/ducati_motogp.glb` (9.7 MB) is converted from the OBJ in
`source/`, which is a SketchUp export in centimetres with 1152 material groups
and flat `Kd`-only materials. The pipeline that produced it:

```bash
npx obj2gltf -i bike.obj -o bike.glb --metallicRoughness
node tools/merge.mjs bike.glb ducati_motogp.glb --quantize
```

`tools/merge.mjs` welds and merges every primitive that shares a material —
**873 draw calls down to 54** — and quantises positions to `int16` and normals
to `int8` under `KHR_mesh_quantization`, which three's `GLTFLoader` reads
natively. That is 14.4 MB → 9.7 MB with no visible change. PBR values are then
inferred from material names at load time in `src/three/GpBike.jsx`.

`tools/verify-bike.mjs` parses the shipped file with the real `GLTFLoader` and
runs the same transform the component applies, printing the final bounding box
— a headless check that the bike is the right size, sitting on the floor and
facing the right way.

### Loading

The car blocks the preloader; the bike does not. `src/lib/loader.js` downloads
the car with real byte progress, and the bike only starts once the page is
interactive (`requestIdleCallback`), appearing when it arrives. Both warm
`THREE.Cache`, so `GLTFLoader` parses from memory instead of fetching twice.
Compressing the car the same way the bike was compressed is the obvious next
step before deploying.

## Graceful degradation

- WebGL is probed once up front in `src/lib/webgl.js`, before anything is
  downloaded. If it cannot start, the notice quotes the browser's **own** reason
  string — which is normally specific enough to fix — and the 38 MB of models is
  never requested. If `high-performance` is refused, which hybrid-graphics
  laptops do, it retries on the integrated GPU rather than giving up.
- A browser with WebGL 1 but not WebGL 2 is named as such: three.js dropped
  WebGL 1 in r160, so that is a browser-age problem, not a page problem.
- A **lost** context (two detailed models is enough to push a tired GPU over
  its limit) is caught in `Stage`, which lets the browser hand the context back
  and rebuilds the canvas. After three losses it gives up and stays 2D rather
  than flickering.
- Post-processing is the most driver-sensitive part of the scene, so it has its
  own boundary — a bloom failure costs you the bloom, not the machines. Add
  `?nofx` to the URL to switch it off.
- `prefers-reduced-motion` disables the reveal transforms and looping
  animations.
