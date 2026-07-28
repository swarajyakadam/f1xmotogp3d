import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A single mutable object shared between the DOM layer and the WebGL layer.
 * The canvas reads it every frame, so it deliberately never triggers a React
 * render — anything that needs re-rendering subscribes instead.
 */
export const scrollState = {
  y: 0,
  progress: 0,
  velocity: 0,
  /** absolute speed, smoothed, roughly 0..1 — drives the HUD speedometer */
  speed: 0,
  section: 0,
}

const listeners = new Set()
export function onSection(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function emitSection(i) {
  if (i === scrollState.section) return
  scrollState.section = i
  listeners.forEach((fn) => fn(i))
}

/** Section centre anchors, measured from the DOM and refreshed on resize. */
export const anchors = { list: [] }

export function measureAnchors() {
  const els = Array.from(document.querySelectorAll('[data-section]'))
  anchors.list = els.map((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    return { id: el.dataset.section, top, height: r.height, center: top + r.height / 2 }
  })
}

let lenis = null
export function getLenis() {
  return lenis
}

export function initSmoothScroll() {
  // The site opens behind a preloader, so a browser-restored scroll position
  // would drop you mid-page with the camera still parked on the hero.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    lerp: 0.09,
  })

  lenis.on('scroll', ({ scroll, velocity, progress }) => {
    scrollState.y = scroll
    scrollState.progress = progress
    scrollState.velocity = velocity
    ScrollTrigger.update()
  })

  // Hold the reference: an anonymous callback left behind on the ticker keeps
  // calling raf() on a destroyed Lenis, and the throw takes down every GSAP
  // animation registered after it — reveals freeze half-open, text never
  // arrives. React's development double-mount hits this on the first load.
  const drive = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(drive)
  gsap.ticker.lagSmoothing(0)

  // Lenis drives the real window scroll here, so ScrollTrigger's default
  // scroller is already correct — it only needs telling when to re-read it.
  scrollState.y = window.scrollY || 0

  measureAnchors()
  const ro = new ResizeObserver(() => {
    measureAnchors()
    ScrollTrigger.refresh()
  })
  ro.observe(document.body)

  // Which section is under the middle of the viewport?
  const tick = () => {
    const mid = scrollState.y + window.innerHeight / 2
    const list = anchors.list
    let idx = 0
    for (let i = 0; i < list.length; i++) {
      if (mid >= list[i].top) idx = i
    }
    emitSection(idx)
    raf = requestAnimationFrame(tick)
  }
  let raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    gsap.ticker.remove(drive)
    lenis.destroy()
    lenis = null
  }
}

export function scrollToSection(id) {
  const el = document.querySelector(`[data-section="${id}"]`)
  if (el && lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
}

/* ── small math helpers used by both layers ─────────────────────── */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (t) => t * t * (3 - 2 * t)
export const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10)
/** Eases 0..1 but holds still at both ends, so the camera "settles" per section. */
export const plateau = (t, hold = 0.16) =>
  smootherstep(clamp((t - hold) / (1 - hold * 2)))
