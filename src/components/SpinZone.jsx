import { useEffect, useRef, useState } from 'react'
import { spin, SENSITIVITY } from '../lib/spin'

/**
 * The grab handle for the hero car.
 *
 * A DOM element rather than pointer events on the canvas, for two reasons: the
 * canvas is `pointer-events: none` so the copy over it stays selectable, and a
 * real element can declare `touch-action: pan-y` — which lets a phone keep
 * vertical scrolling while a sideways drag spins the car.
 */
export default function SpinZone() {
  const el = useRef(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const node = el.current
    if (!node) return

    let pointer = null
    let lastX = 0

    const down = (e) => {
      pointer = e.pointerId
      node.setPointerCapture(pointer)
      node.dataset.grabbing = 'true'
      lastX = e.clientX
      spin.dragging = true
      spin.velocity = 0
    }

    const move = (e) => {
      if (!spin.dragging || e.pointerId !== pointer) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      spin.angle += dx * SENSITIVITY
      // one event ≈ one frame, so this doubles as the throw-off velocity
      spin.velocity = dx * SENSITIVITY
      if (!spin.touched) {
        spin.touched = true
        setTouched(true)
      }
    }

    const up = (e) => {
      if (e.pointerId !== pointer) return
      spin.dragging = false
      delete node.dataset.grabbing
      if (node.hasPointerCapture?.(pointer)) node.releasePointerCapture(pointer)
      pointer = null
    }

    node.addEventListener('pointerdown', down)
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerup', up)
    node.addEventListener('pointercancel', up)
    return () => {
      node.removeEventListener('pointerdown', down)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerup', up)
      node.removeEventListener('pointercancel', up)
      spin.dragging = false
    }
  }, [])

  return (
    <div className="spin-zone" ref={el} data-cursor="drag" aria-hidden="true">
      <span className={`spin-hint mono${touched ? ' gone' : ''}`}>
        <i />
        Hold and drag to rotate
        <i />
      </span>
    </div>
  )
}
