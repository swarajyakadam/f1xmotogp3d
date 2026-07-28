import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll, measureAnchors } from './lib/scroll'
import { loadModelBuffer, F1_URL, GP_URL } from './lib/loader'
import { probeWebGL } from './lib/webgl'
import { f1, motogp } from './data/content'

import Stage from './three/Stage'
import StageBoundary from './components/StageBoundary'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hud from './components/Hud'

import Hero from './sections/Hero'
import Machine from './sections/Machine'
import Compare from './sections/Compare'
import Weekend from './sections/Weekend'
import Circuits from './sections/Circuits'
import Eras from './sections/Eras'
import Glossary from './sections/Glossary'

/** Bytes are most of the wait; parsing and the first frame are the last slice. */
const DOWNLOAD_SHARE = 0.88

export default function App() {
  const [ready, setReady] = useState(false)
  const [no3D, setNo3D] = useState(false)
  const [bytes, setBytes] = useState(0)
  const [carIn, setCarIn] = useState(false)
  const [bikeReady, setBikeReady] = useState(false)
  const [glGen, setGlGen] = useState(0)
  // Probed once, before anything is downloaded: a machine that cannot draw the
  // models should not be made to fetch 38 MB of them, and "it didn't work"
  // deserves a reason the visitor can act on.
  const [gl] = useState(probeWebGL)
  const [noticeOpen, setNoticeOpen] = useState(true)
  const bufferReady = useRef(false)
  const losses = useRef(0)

  const dropTo2D = useCallback((info) => {
    setNo3D(
      info?.title
        ? info
        : {
            title: 'The 3D layer stopped',
            detail: 'The graphics context was lost and would not come back. Check the console.',
          }
    )
    setBytes(1)
    setCarIn(true)
  }, [])

  useEffect(() => {
    if (gl.ok) {
      console.info(`[stage] WebGL 2 ready — ${gl.renderer || 'renderer undisclosed'}`)
      return
    }
    console.warn(`[stage] ${gl.title} — ${gl.detail}`)
    dropTo2D(gl)
  }, [gl, dropTo2D])

  // 27.8 MB is a rude thing to download for a canvas that cannot be drawn.
  useEffect(() => {
    if (!gl.ok) return
    let alive = true
    loadModelBuffer(F1_URL, (p) => {
      if (alive) setBytes(p)
    })
      .then(() => {
        if (!alive) return
        bufferReady.current = true
        setBytes(1)
      })
      .catch((err) => {
        console.warn('[model] download failed, continuing without it:', err?.message || err)
        if (alive) {
          dropTo2D({
            title: 'The models could not be downloaded',
            detail: `${err?.message || err}. Everything else on the page still works.`,
          })
        }
      })
    return () => {
      alive = false
    }
  }, [gl.ok, dropTo2D])

  // The bike is two chapters down the page, so it is never allowed to hold up
  // the first paint — it starts downloading only once the car is on the grid.
  useEffect(() => {
    if (!ready || no3D) return
    let alive = true
    const start = () =>
      loadModelBuffer(GP_URL)
        .then(() => alive && setBikeReady(true))
        .catch((err) => console.warn('[model] bike unavailable:', err?.message || err))

    const idle = window.requestIdleCallback
      ? requestIdleCallback(start, { timeout: 2500 })
      : setTimeout(start, 900)
    return () => {
      alive = false
      if (window.cancelIdleCallback && window.requestIdleCallback) cancelIdleCallback(idle)
      else clearTimeout(idle)
    }
  }, [ready, no3D])

  // Belt and braces: never strand a visitor on the loading screen.
  useEffect(() => {
    const id = setTimeout(() => setCarIn(true), 40000)
    return () => clearTimeout(id)
  }, [])

  // A lost context leaves a frozen frame behind, which reads as a broken page.
  // The canvas is rebuilt on restore; if the GPU keeps giving up, the site
  // carries on as pure DOM rather than flickering forever.
  const onContextLost = useCallback(() => {
    losses.current += 1
    console.warn('[stage] WebGL context lost', losses.current)
    if (losses.current > 2) dropTo2D()
  }, [dropTo2D])

  const onContextRestored = useCallback(() => {
    if (losses.current > 2) return
    setGlGen((g) => g + 1)
  }, [])

  const progress = Math.min(1, bytes * DOWNLOAD_SHARE + (carIn ? 1 - DOWNLOAD_SHARE : 0))

  // hold the page still until the car is on the grid
  useEffect(() => {
    document.body.classList.toggle('is-locked', !ready)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    const destroy = initSmoothScroll()
    const id = setTimeout(() => {
      measureAnchors()
      ScrollTrigger.refresh()
    }, 260)
    return () => {
      clearTimeout(id)
      destroy()
    }
  }, [ready])

  return (
    <>
      <div className="stage-glow" />
      {!no3D && (
        <StageBoundary onFail={dropTo2D}>
          <Stage
            key={glGen}
            powerPreference={gl.powerPreference}
            showCar={bytes >= 1}
            showBike={bikeReady}
            onCarIn={() => setCarIn(true)}
            onContextLost={onContextLost}
            onContextRestored={onContextRestored}
          />
        </StageBoundary>
      )}

      {/* Outside .shell on purpose: the nav sits above the canvas, and
          .shell's stacking context would trap it. */}
      <Nav />
      <Hud />

      <div className="shell">
        <Hero ready={ready} />
        <Machine data={f1} side="left" tone="f1" />
        <Machine data={motogp} side="right" tone="gp" />
        <Compare />
        <Weekend />
        <Circuits />
        <Eras />
        <Glossary />
      </div>

      {no3D && noticeOpen && (
        <aside className="gl-warn mono" role="status">
          <b>{no3D.title}</b>
          {no3D.detail}
          <p>
            The car and the bike will not appear. Every word on the page still works, and the
            layout is built to read without them.
          </p>
          <button onClick={() => setNoticeOpen(false)}>Dismiss</button>
        </aside>
      )}

      <div className="scanlines" />
      <div className="vignette" />
      <div className="grain" />
      <Cursor />

      <Preloader progress={progress} onDone={() => setReady(true)} />
    </>
  )
}
