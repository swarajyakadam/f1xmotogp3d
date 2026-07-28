import { useRef } from 'react'
import { eras } from '../data/content'
import { useGsap, baseReveal } from '../hooks/useReveal'

export default function Eras() {
  const root = useRef(null)

  useGsap(root, (gsap) => {
    baseReveal(root.current)

    // the timeline draws itself as you scroll past it
    gsap.to('.lap-line i', {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.lap', start: 'top 72%', end: 'bottom 78%', scrub: 0.5 },
    })

    gsap.utils.toArray('.lap-item', root.current).forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        x: -26,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          once: true,
          onEnter: () => el.classList.add('in'),
        },
      })
    })
  })

  return (
    <section data-section="eras" data-side="right" id="eras" ref={root}>
      <div className="sec wrap">
        <div className="col">
          <div className="sec-head">
            <span className="eyebrow rv">{eras.eyebrow}</span>
            <h2 className="section-heading rv-line">
              <span>{eras.heading}</span>
            </h2>
          </div>

          <div className="lap">
            <div className="lap-line">
              <i />
            </div>
            {eras.entries.map((e) => (
              <div className="lap-item" key={e.period + e.title}>
                <div className="lap-period">{e.period}</div>
                <div>
                  <div className={`lap-org org-${e.org === 'Formula 1' ? 'f1' : e.org === 'Both' ? 'both' : 'gp'}`}>
                    {e.org}
                  </div>
                  <h3 className="lap-title">{e.title}</h3>
                  <p className="lap-detail">{e.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
