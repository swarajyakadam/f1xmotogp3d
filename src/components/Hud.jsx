import { useEffect, useRef, useState } from 'react'
import { nav } from '../data/content'
import { onSection, scrollState, scrollToSection } from '../lib/scroll'

/**
 * Right-hand telemetry rail: section ticks plus a speedometer wired to
 * scroll velocity, because a scrollbar is a wasted opportunity.
 */
export default function Hud() {
  const [active, setActive] = useState(scrollState.section)
  const speedEl = useRef(null)
  const meter = useRef(null)

  useEffect(() => onSection(setActive), [])

  useEffect(() => {
    let raf
    let smooth = 0
    const tick = () => {
      const raw = Math.min(1, Math.abs(scrollState.velocity) / 48)
      smooth += (raw - smooth) * (raw > smooth ? 0.28 : 0.055)
      const kmh = Math.round(smooth * 347)
      if (speedEl.current) speedEl.current.textContent = String(kmh).padStart(3, '0')
      if (meter.current) meter.current.style.transform = `scaleX(${smooth})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <aside className="hud" aria-hidden="true">
      <div className="hud-track">
        {nav.map((n, i) => (
          <button
            key={n.id}
            className={`hud-tick${i === active ? ' on' : ''}`}
            onClick={() => scrollToSection(n.id)}
            style={{ pointerEvents: 'auto' }}
            tabIndex={-1}
          >
            <b>{n.label}</b>
            <span>{n.code}</span>
            <s />
          </button>
        ))}
      </div>

      <div className="hud-speed">
        <em ref={speedEl}>000</em>
        <span>km/h · scroll</span>
        <div className="hud-meter">
          <i ref={meter} />
        </div>
      </div>
    </aside>
  )
}
