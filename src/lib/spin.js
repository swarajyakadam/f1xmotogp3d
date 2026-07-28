/**
 * Hand-spin state for the hero car.
 *
 * Mutable and shared, in the same spirit as scrollState: the pointer writes to
 * it, the render loop reads it every frame, and React never has to hear about
 * it. Rotating a car at 60 fps is not a state update.
 */
export const spin = { angle: 0, velocity: 0, dragging: false, touched: false }

/** Radians of car per pixel of drag. A full turn is roughly a screen-width. */
export const SENSITIVITY = 0.0062
