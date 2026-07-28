import { GARAGE } from './layout.js'

const GP = GARAGE.gp.x
/** Halfway between the two machines: the anchor for the shots showing both. */
const MID = (GARAGE.f1.x + GP) / 2

/**
 * One keyframe per section, anchored to that section's vertical centre.
 *
 * pos / tgt — camera position and the point it looks at, in world metres
 * f1 / gp   — each machine's heading at that moment, radians
 * bias      — screen-space pan, as a fraction of the viewport.
 *             +x pushes the machine right (so the text column sits left),
 *             +y pushes it up (so the text can sit underneath).
 * side      — which half the copy occupies; documentation for the shot, and
 *             what tools/verify-framing.mjs checks the composition against
 * show      — which machines need to be drawn at all
 * word      — opacity of the MOTOGP wordmark standing behind the bike, so it
 *             fades up with its chapter instead of hanging about in the scene
 * spin      — how much of the car's heading the visitor owns here. 1 keeps a
 *             hand-spin; scrolling away winds it back to the authored angle
 *
 * Distances and biases here were solved rather than eyeballed: run
 * `node tools/verify-framing.mjs 1.78` to print where each machine actually
 * lands on screen, and `--tune` to re-solve them after moving a machine.
 * Both models are much larger in frame than they feel while authoring.
 */
export const KEYS = [
  // 00 · index — the car, three-quarter front, filling the space beside the title
  {
    id: 'hero',
    side: 'left',
    pos: [5.7, 1.42, 8.85],
    tgt: [0.15, 0.6, 0.1],
    f1: -0.32,
    gp: -0.5,
    fov: 34,
    bias: [0.31, 0.05],
    show: ['f1'],
    spin: 1,
  },
  // 01 · the car — long side profile, broadside to the reader
  {
    id: 'f1',
    side: 'left',
    pos: [18.69, 1.97, -1.8],
    tgt: [0.0, 0.72, -0.3],
    f1: 0.34,
    gp: -0.5,
    fov: 32,
    bias: [0.28, 0.07],
    show: ['f1'],
  },
  // 02 · the bike — down the pit lane, three-quarter front from the other side
  {
    id: 'motogp',
    side: 'right',
    pos: [GP + 3.3, 1.06, 4.01],
    tgt: [GP - 0.05, 0.62, 0.05],
    f1: 0.34,
    gp: -0.55,
    fov: 34,
    bias: [-0.27, 0.11],
    show: ['gp'],
    word: 1,
  },
  // 03 · head to head — both machines in one frame, the table underneath
  {
    id: 'compare',
    side: 'full',
    pos: [MID, 5.09, 24.86],
    tgt: [MID, 0.85, 0.0],
    f1: -0.1,
    gp: -0.1,
    fov: 36,
    bias: [0.03, 0.25],
    show: ['f1', 'gp'],
  },
  // 04 · the weekend — the car from above, laid out like a schedule
  {
    id: 'weekend',
    side: 'right',
    pos: [-5.1, 10.34, 6.11],
    tgt: [0.0, 0.25, 0.2],
    f1: -0.42,
    gp: -0.2,
    fov: 38,
    bias: [-0.27, 0.06],
    show: ['f1'],
  },
  // 05 · circuits — down on the deck beside the bike
  {
    id: 'circuits',
    side: 'left',
    pos: [GP + 2.82, 0.42, 3.23],
    tgt: [GP, 0.55, -0.1],
    f1: -0.42,
    gp: -0.9,
    fov: 30,
    bias: [0.32, 0.05],
    show: ['gp'],
  },
  // 06 · history — rear three-quarter of the car, diffuser and wing
  {
    id: 'eras',
    side: 'right',
    pos: [-10.56, 5.1, -12.64],
    tgt: [0.0, 0.7, -1.2],
    f1: 1.05,
    gp: -0.9,
    fov: 34,
    bias: [-0.31, 0.07],
    show: ['f1'],
  },
  // 07 · glossary — pull back, both machines parked small beside the type
  {
    id: 'glossary',
    side: 'left',
    pos: [MID, 3.53, 26.65],
    tgt: [MID, 0.8, 0.0],
    f1: 0.18,
    gp: 0.3,
    fov: 34,
    bias: [0.29, 0.07],
    show: ['f1', 'gp'],
  },
]
