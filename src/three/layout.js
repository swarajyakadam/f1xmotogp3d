/**
 * Where the two machines are parked, in metres.
 *
 * The camera keyframes in CameraRig are authored against these numbers, so a
 * machine can be nudged here without every shot having to be re-tuned.
 */
export const GARAGE = {
  /** The F1 car keeps the origin — the shot list was written around it. */
  f1: { x: 0 },
  /** The bike sits down the pit lane, far enough that a tight shot on one
   *  never accidentally catches the other. */
  gp: { x: 9.4, length: 2.15 },
}

/**
 * The word standing behind the bike, as a real object in the scene rather than
 * a layer of HTML over it — so it takes the studio light, catches the fog,
 * reflects in the floor and is occluded by the bike in front of it.
 *
 * Placed down the axis the MotoGP shot looks along, and turned back toward
 * that camera. Only the MotoGP chapter fades it up (`word` in shots.js).
 */
export const WORDMARK = {
  /**
   * The chapter's own section head, standing in the scene: the eyebrow set
   * small and tracked out, the heading set solid underneath it. Mirrors
   * `motogp.eyebrow` and `motogp.heading` in data/content.js.
   *
   * The heading is broken by hand — on one line it would have to run three
   * times as wide to stay legible, and would end up under the copy.
   */
  lines: [
    { text: 'Chapter 02 — Two wheels', style: 'label' },
    { text: 'The MotoGP', style: 'display' },
    { text: 'Prototype', style: 'display' },
  ],
  x: GARAGE.gp.x - 3.52,
  z: -1.72,
  /** Sits on the floor, with a small gap so the reflection reads. */
  base: 0.06,
  rotY: 0.7,
  width: 3.8,
  /** Eyebrow plus two lines of Anton. Measured exactly at runtime; this is the
   *  figure the framing tool works from. */
  aspect: 2.28,
}
