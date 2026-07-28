import { useEffect, useRef } from 'react'
import { marqueeWords } from '../data/content'
import { scrollState } from '../lib/scroll'

/** Scrolls on its own; scroll velocity shoves it faster and can flip it. */
export default function Marquee({ speed = 46 }) {
  const inner = useRef(null)

  useEffect(() => {
    let raf
    let x = 0
    let last = performance.now()
    let half = 0

    const measure = () => {
      if (inner.current) half = inner.current.scrollWidth / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (inner.current) ro.observe(inner.current)

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const boost = scrollState.velocity * 2.4
      x -= (speed + boost) * dt
      if (half) {
        if (x <= -half) x += half
        if (x > 0) x -= half
      }
      if (inner.current) inner.current.style.transform = `translate3d(${x}px,0,0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [speed])

  const row = [...marqueeWords, ...marqueeWords]

  return (
    <div className="marquee">
      <div className="marquee-inner" ref={inner}>
        {row.map((w, i) => (
          <span className="marquee-item" key={i}>
            {w}
            <em>✦</em>
          </span>
        ))}
      </div>
    </div>
  )
}
