import { useEffect, useRef, useState } from 'react'
import { credit, glossary, site } from '../data/content'
import { useGsap, baseReveal } from '../hooks/useReveal'

const LABEL = { f1: 'F1', gp: 'MotoGP', both: 'Both' }

function Clock() {
  const [now, setNow] = useState('--:--:--')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Rome',
    })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <>{now}</>
}

export default function Glossary() {
  const root = useRef(null)
  const [open, setOpen] = useState(null)

  useGsap(root, () => baseReveal(root.current))

  return (
    <section data-section="glossary" data-side="left" id="glossary" ref={root}>
      <div className="sec wrap">
        <div className="col col-wide">
          <div className="sec-head">
            <span className="eyebrow rv">{glossary.eyebrow}</span>
            <h2 className="section-heading rv-line">
              <span>{glossary.heading}</span>
            </h2>
          </div>

          <div className="terms">
            {glossary.terms.map((t, i) => (
              <button
                className={`term rv${open === i ? ' open' : ''}`}
                key={t.term}
                data-delay={0.03 * i}
                data-cursor="hover"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="term-top">
                  <b>{t.term}</b>
                  <s className={`chip chip-${t.tone}`}>{LABEL[t.tone]}</s>
                </span>
                <span className="term-def">{t.def}</span>
              </button>
            ))}
          </div>

          <div className="sources rv" data-delay="0.1">
            <span className="mono">Go deeper</span>
            <div>
              {glossary.sources.map((s) => (
                <a
                  className="social"
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="credit rv" data-delay="0.16">
            <div className="credit-who">
              <span className="mono">{credit.role}</span>
              <b>{credit.name}</b>
            </div>

            <ul className="credit-links">
              <li>
                <a href={`mailto:${credit.email}`}>
                  <span className="mono">Email</span>
                  {credit.email}
                </a>
              </li>
              {credit.phone && (
                <li>
                  <a href={`tel:${credit.phone.replace(/[^+\d]/g, '')}`}>
                    <span className="mono">Phone</span>
                    {credit.phone}
                  </a>
                </li>
              )}
              <li>
                <a href={credit.portfolio} target="_blank" rel="noreferrer noopener">
                  <span className="mono">Portfolio</span>
                  {credit.portfolioLabel}
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M1 13L13 1M13 1H4M13 1V10"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="footer rv" data-delay="0.2">
            <span className="live">
              <i className="dot" /> {site.strapline}
            </span>
            <span>
              Paddock time · <Clock /> CET
            </span>
            <span>
              © {new Date().getFullYear()} {credit.name} · {site.name} is an independent
              explainer, unaffiliated with FIA, FOM, FIM or Dorna
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
