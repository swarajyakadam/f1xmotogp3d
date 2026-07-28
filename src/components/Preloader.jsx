import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { site } from '../data/content'

const STAGES = [
  ['Establishing link', 'Handshake with the render context'],
  ['Loading chassis', '27.8 MB of geometry, streaming in'],
  ['Unpacking bodywork', 'Decoding textures and normals'],
  ['Baking studio light', 'Building the reflection probe'],
  ['Systems green', 'Ready to roll out'],
]

/**
 * `progress` is 0..1 and comes from real bytes on the wire — see lib/loader.
 * The counter eases toward it so a burst of packets never makes it jump.
 */
export default function Preloader({ progress = 0, onDone }) {
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)
  const root = useRef(null)
  const bar = useRef(null)
  const smooth = useRef(0)
  const finished = useRef(false)
  const target = useRef(0)

  target.current = progress

  useEffect(() => {
    let raf
    const tick = () => {
      const goal = target.current * 100
      smooth.current += (goal - smooth.current) * 0.08
      const v = Math.min(100, smooth.current)
      setShown(v)
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`
      if (v > 99.3 && !finished.current) {
        finished.current = true
        exit()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const exit = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true)
        onDone?.()
      },
    })
    tl.to('.pre-count, .pre-status, .pre-top, .pre-bottom', {
      y: -24,
      opacity: 0,
      duration: 0.55,
      stagger: 0.05,
      ease: 'power3.in',
    })
      .to('.pre-bar', { scaleY: 0, transformOrigin: 'bottom', duration: 0.4, ease: 'power2.in' }, '<')
      .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.15')
      .to('.curtain', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '<0.08')
  }

  if (gone) return null

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((shown / 100) * STAGES.length))]

  return (
    <>
      <div className="curtain" />
      <div className="preloader" ref={root}>
        <div className="pre-top mono">
          <span>
            {site.name} — {site.strapline}
          </span>
          <span>{site.updated}</span>
        </div>

        <div>
          <div className="pre-mid">
            <div className="pre-count">
              {String(Math.floor(shown)).padStart(3, '0')}
              <sup>%</sup>
            </div>
            <div className="pre-status mono">
              <strong>{stage[0]}</strong>
              {stage[1]}
            </div>
          </div>
          <div className="pre-bar">
            <i ref={bar} style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>

        <div className="pre-bottom mono">
          <span>Formula 1 car · MotoGP prototype</span>
          <span>WebGL · R3F</span>
        </div>
      </div>
    </>
  )
}
