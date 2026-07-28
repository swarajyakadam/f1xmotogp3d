import { useRef } from 'react'
import { hero, site } from '../data/content'
import { useGsap } from '../hooks/useReveal'
import Marquee from '../components/Marquee'
import SpinZone from '../components/SpinZone'

export default function Hero({ ready }) {
  const root = useRef(null)

  useGsap(
    root,
    (gsap) => {
      if (!ready) return
      const tl = gsap.timeline({ delay: 0.15 })
      // fromTo with y pinned to 0: the inline start state is a percentage
      // translate, which GSAP reads back from the computed matrix as pixels and
      // would otherwise keep as an offset, leaving the title inside its mask.
      tl.fromTo(
        '.hero-title .line > span',
        { yPercent: 110, y: 0 },
        { yPercent: 0, y: 0, duration: 1.35, ease: 'expo.out', stagger: 0.09 }
      )
        .to(
          '.hero-meta > *',
          { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1 },
          '-=0.9'
        )
        .to('.hero-side, .scroll-cue', { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.7')

      // the title drifts up and dissolves as you leave the hero
      gsap.to('.hero-title', {
        yPercent: -18,
        opacity: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
      gsap.to('.hero-meta', {
        yPercent: -50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    },
    [ready]
  )

  return (
    <section data-section="hero" data-side="left" id="hero" ref={root}>
      <SpinZone />

      <div className="hero wrap">
        <span className="hero-side" style={{ opacity: 0 }}>
          {site.strapline} · {site.updated}
        </span>

        <div className="col hero-col">
          <h1 className="hero-title">
            <span className="line">
              <span style={{ transform: 'translateY(110%)' }}>{hero.lineA}</span>
            </span>
            <span className="line">
              <span className="outline" style={{ transform: 'translateY(110%)' }}>
                {hero.lineB}
              </span>
            </span>
          </h1>

          <div className="hero-meta">
            <div className="hero-kicker rv" style={{ opacity: 0, transform: 'translateY(20px)' }}>
              <span>●</span> {hero.kicker}
            </div>
            <p className="hero-blurb rv" style={{ opacity: 0, transform: 'translateY(20px)' }}>
              {hero.blurb}
            </p>
            <ul className="hero-facts rv" style={{ opacity: 0, transform: 'translateY(20px)' }}>
              {hero.facts.map((f) => (
                <li key={f.k}>
                  <b>{f.v}</b>
                  <span>{f.k}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="scroll-cue" style={{ opacity: 0 }}>
          <i />
          Scroll
        </div>
      </div>

      <Marquee />
    </section>
  )
}
