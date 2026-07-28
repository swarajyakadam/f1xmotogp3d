import { useRef } from 'react'
import { compare } from '../data/content'
import { useGsap, baseReveal } from '../hooks/useReveal'

/** Two bars per row, one per series, both scaled against the same ceiling. */
export default function Compare() {
  const root = useRef(null)

  useGsap(root, (gsap) => {
    baseReveal(root.current)

    gsap.utils.toArray('.vs-bar', root.current).forEach((bar, i) => {
      const fill = bar.querySelector('i')
      const out = bar.parentElement.querySelector('u')
      const value = parseFloat(bar.dataset.value)
      const ratio = parseFloat(bar.dataset.ratio)
      // count out to whatever precision the figure was written with, so 1.6 g
      // does not read as 1.60 g next to a flat 6 g
      const decimals = (String(value).split('.')[1] || '').length
      const obj = { v: 0 }

      gsap.to(obj, {
        v: 1,
        duration: 1.4,
        delay: (i % 4) * 0.07,
        ease: 'power3.out',
        onUpdate: () => {
          fill.style.transform = `scaleX(${obj.v * ratio})`
          out.textContent = (obj.v * value).toFixed(decimals)
        },
        scrollTrigger: { trigger: bar, start: 'top 94%', once: true },
      })
    })
  })

  return (
    <section data-section="compare" data-side="full" id="compare" ref={root}>
      <div className="sec wrap">
        <div className="sec-head sec-head-center">
          <span className="eyebrow rv">{compare.eyebrow}</span>
          <h2 className="section-heading rv-line">
            <span>{compare.heading}</span>
          </h2>
        </div>

        <div className="panel vs rv">
          <div className="vs-legend mono">
            <span>
              <s className="key-f1" /> Formula 1
            </span>
            <span>
              <s className="key-gp" /> MotoGP
            </span>
          </div>

          {compare.rows.map((r) => (
            <div className="vs-row" key={r.label}>
              <div className="vs-label">
                {r.label}
                <em>{r.unit}</em>
              </div>

              {['f1', 'gp'].map((k) => (
                <div className={`vs-side vs-${k}`} key={k}>
                  <u>0</u>
                  <div
                    className="vs-bar"
                    data-value={r[k]}
                    data-ratio={Math.min(1, r[k] / r.max)}
                  >
                    <i />
                  </div>
                </div>
              ))}
            </div>
          ))}

          <p className="vs-note mono">{compare.note}</p>
        </div>

        <div className="takeaways">
          {compare.headline.map((h, i) => (
            <article className="takeaway rv" key={h.k} data-delay={0.06 * i}>
              <h3>{h.k}</h3>
              <p>{h.v}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
