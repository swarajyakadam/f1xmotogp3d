import { useRef } from 'react'
import { circuits } from '../data/content'
import { useGsap, baseReveal } from '../hooks/useReveal'

export default function Circuits() {
  const root = useRef(null)

  useGsap(root, (gsap) => {
    baseReveal(root.current)
    gsap.from(gsap.utils.toArray('.trk', root.current), {
      y: 42,
      opacity: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.trk-list', start: 'top 84%', once: true },
    })
  })

  return (
    <section data-section="circuits" data-side="left" id="circuits" ref={root}>
      <div className="sec wrap">
        <div className="col col-wide">
          <div className="sec-head">
            <span className="eyebrow rv">{circuits.eyebrow}</span>
            <h2 className="section-heading rv-line">
              <span>{circuits.heading}</span>
            </h2>
            <p className="lede rv" data-delay="0.05">
              {circuits.note}
            </p>
          </div>

          <div className="trk-list">
            {circuits.list.map((c, i) => (
              <article className="trk" key={c.name} data-cursor="hover" tabIndex={0}>
                <span className="trk-idx">{String(i + 1).padStart(2, '0')} /</span>

                <div className="trk-main">
                  <h3 className="trk-name">{c.name}</h3>
                  <div className="trk-tags">
                    {c.series.map((s) => (
                      <span className={`tag tag-${s === 'F1' ? 'f1' : 'gp'}`} key={s}>
                        {s}
                      </span>
                    ))}
                    <span className="tag">{c.country}</span>
                  </div>
                </div>

                <p className="trk-note">{c.note}</p>

                <div className="trk-num">
                  <em>{c.km} km</em>
                  {c.corners} corners
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
