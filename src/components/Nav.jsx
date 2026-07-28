import { useEffect, useState } from 'react'
import { nav, site } from '../data/content'
import { onSection, scrollToSection, scrollState } from '../lib/scroll'

export default function Nav() {
  const [active, setActive] = useState(scrollState.section)
  useEffect(() => onSection(setActive), [])

  return (
    <nav className="nav">
      <a
        className="brand"
        href="#hero"
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('hero')
        }}
      >
        <span className="brand-mark">A</span>
        <span className="brand-text">
          {site.name}
          <span>{site.strapline}</span>
        </span>
      </a>

      <div className="nav-links">
        {nav.map((n, i) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={`nav-link${i === active ? ' active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              scrollToSection(n.id)
            }}
          >
            <i>{n.code}</i>
            {n.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
