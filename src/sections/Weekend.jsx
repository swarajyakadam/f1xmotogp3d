import { useRef } from 'react'
import { weekend } from '../data/content'
import { useGsap, baseReveal } from '../hooks/useReveal'

export default function Weekend() {
  const root = useRef(null)
  useGsap(root, () => baseReveal(root.current))

  return (
    <section data-section="weekend" data-side="right" id="weekend" ref={root}>
      <div className="sec wrap">
        <div className="col col-wide">
          <div className="sec-head">
            <span className="eyebrow rv">{weekend.eyebrow}</span>
            <h2 className="section-heading rv-line">
              <span>{weekend.heading}</span>
            </h2>
          </div>

          <div className="week-grid">
            {weekend.columns.map((c, ci) => (
              <div className={`panel week rv tone-${c.tone}`} key={c.series} data-delay={ci * 0.08}>
                <h3 className="panel-title">
                  {c.series} <span>{ci === 0 ? '4 wheels' : '2 wheels'}</span>
                </h3>

                <ol className="week-days">
                  {c.schedule.map((d) => (
                    <li key={d.day}>
                      <b>{d.day}</b>
                      <div>
                        {d.items.map((it) => (
                          <span key={it}>{it}</span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="week-note">
                  <b>Qualifying</b>
                  <p>{c.qualifying}</p>
                </div>
                <div className="week-note">
                  <b>Sprint</b>
                  <p>{c.sprint}</p>
                </div>

                <div className="week-points">
                  {c.points.map((p) => (
                    <div key={p.pos}>
                      <b>{p.pos}</b>
                      <span>{p.list}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flags panel rv" data-delay="0.12">
            <h3 className="panel-title">
              Flags <span>marshalling</span>
            </h3>
            <ul>
              {weekend.flags.map((f) => (
                <li key={f.flag}>
                  <b data-flag={f.flag.toLowerCase()}>{f.flag}</b>
                  <span>{f.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
