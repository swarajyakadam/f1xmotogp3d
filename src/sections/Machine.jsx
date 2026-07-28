import { useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGsap, baseReveal } from '../hooks/useReveal'

/** Words light up one at a time as the paragraph crosses the viewport. */
function LitParagraph({ text }) {
  const parts = text.split(/(\s+)/)
  return (
    <p className="rw">
      {parts.map((chunk, i) => (/^\s+$/.test(chunk) ? chunk : <span key={i}>{chunk}</span>))}
    </p>
  )
}

/**
 * One machine, explained: the prose on the left or right of the model, a spec
 * table, and the four parts worth knowing by name.
 *
 * Used twice — once for the car, once for the bike — from the same shape of
 * data, so the two chapters stay comparable as you scroll between them.
 */
export default function Machine({ data, side = 'left', tone = 'f1' }) {
  const root = useRef(null)

  useGsap(root, (gsap) => {
    baseReveal(root.current)

    gsap.utils.toArray('.rw', root.current).forEach((p) => {
      const words = p.querySelectorAll('span')
      ScrollTrigger.create({
        trigger: p,
        start: 'top 84%',
        end: 'bottom 55%',
        scrub: true,
        onUpdate: (self) => {
          const cut = Math.round(self.progress * words.length)
          words.forEach((w, i) => w.classList.toggle('lit', i < cut))
        },
      })
    })
  })

  return (
    <section data-section={data.id} data-side={side} data-tone={tone} id={data.id} ref={root}>
      <div className="sec wrap">
        <div className="col">
          <div className="sec-head">
            <span className="eyebrow rv">{data.eyebrow}</span>
            <h2 className="section-heading rv-line">
              <span>{data.heading}</span>
            </h2>
            <p className="lede rv" data-delay="0.05">
              {data.lede}
            </p>
          </div>

          <div className="machine-body">
            {data.body.map((t, i) => (
              <LitParagraph key={i} text={t} />
            ))}
          </div>

          <div className="panel spec rv" data-delay="0.08">
            <h3 className="panel-title">
              Specification <span>2026</span>
            </h3>
            <dl>
              {data.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="anatomy">
            {data.anatomy.map((a, i) => (
              <div className="anat rv" key={a.part} data-delay={0.04 * i}>
                <b>
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  {a.part}
                </b>
                <p>{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
