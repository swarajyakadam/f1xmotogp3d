import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from './CameraRig'
import { WORDMARK } from './layout'

/** The two faces the page itself sets this chapter in. */
const STYLES = {
  display: { font: (px) => `400 ${px}px Anton, 'Arial Narrow', Impact, sans-serif`, size: 300, tracking: 0, gap: 0.92 },
  label: { font: (px) => `500 ${px}px 'JetBrains Mono', ui-monospace, monospace`, size: 54, tracking: 0.22, gap: 1.5 },
}

/** Draws letter by letter when tracked out; canvas letterSpacing is too new to lean on. */
function drawTracked(ctx, text, x, y, tracking) {
  if (!tracking) {
    ctx.fillText(text, x, y)
    return
  }
  let cursor = x
  for (const ch of text) {
    ctx.fillText(ch, cursor, y)
    cursor += ctx.measureText(ch).width + tracking
  }
}

function widthOf(ctx, text, tracking) {
  if (!tracking) return ctx.measureText(text).width
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + tracking
  return w - tracking
}

/**
 * Paints the chapter's section head into a canvas using the page's own faces
 * and hands it back as a texture. No font file to ship and no second copy of
 * the type to keep in sync — it is literally what the headings are set in.
 */
function useWordTexture(lines) {
  const [state, setState] = useState(null)

  useEffect(() => {
    let alive = true
    const PAD = 44

    const build = () => {
      if (!alive) return

      // Measure on a throwaway context: setting canvas.width resets the state
      // of the real one, font included.
      const probe = document.createElement('canvas').getContext('2d')

      const rows = lines.map((line) => {
        const s = STYLES[line.style] || STYLES.display
        const text = line.text.toUpperCase()
        const tracking = s.size * s.tracking
        probe.font = s.font(s.size)
        const m = probe.measureText(text)
        return {
          text,
          style: s,
          tracking,
          width: widthOf(probe, text, tracking),
          ascent: m.actualBoundingBoxAscent || s.size * 0.72,
          descent: m.actualBoundingBoxDescent || s.size * 0.02,
        }
      })

      // stack them: each row's baseline sits a full step below the one above
      let y = rows[0].ascent
      rows[0].baseline = y
      for (let i = 1; i < rows.length; i++) {
        y += rows[i].style.size * rows[i].style.gap
        rows[i].baseline = y
      }

      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(Math.max(...rows.map((r) => r.width))) + PAD * 2
      canvas.height = Math.ceil(y + rows[rows.length - 1].descent) + PAD * 2

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'alphabetic'
      for (const r of rows) {
        ctx.font = r.style.font(r.style.size)
        drawTracked(ctx, r.text, PAD, PAD + r.baseline, r.tracking)
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.needsUpdate = true

      setState({ texture, aspect: canvas.width / canvas.height })
    }

    // Without this the block gets drawn in the fallback faces and stays that way.
    const fonts = document.fonts
    const wanted = lines.map((l) => (STYLES[l.style] || STYLES.display))
    if (fonts?.load) {
      Promise.all(wanted.map((s) => fonts.load(s.font(s.size)).catch(() => {})))
        .then(build)
        .catch(build)
    } else {
      build()
    }

    return () => {
      alive = false
    }
  }, [lines])

  useEffect(() => () => state?.texture.dispose(), [state])

  return state
}

export default function Wordmark() {
  const group = useRef()
  const face = useRef()
  const word = useWordTexture(WORDMARK.lines)

  useFrame(() => {
    const g = group.current
    if (!g) return
    // Fades with the chapter rather than popping in, and stops being drawn at
    // all once it is gone.
    const a = rig.gpWord
    g.visible = a > 0.01
    if (!g.visible) return
    if (face.current) face.current.opacity = a
  })

  if (!word) return null

  const height = WORDMARK.width / word.aspect

  return (
    <group
      ref={group}
      visible={false}
      position={[WORDMARK.x, WORDMARK.base + height / 2, WORDMARK.z]}
      rotation={[0, WORDMARK.rotY, 0]}
    >
      <mesh>
        <planeGeometry args={[WORDMARK.width, height]} />
        {/* Plain white and unlit on purpose: a standard material would take a
            red kicker off one side and a blue fill off the other, and the
            heading would stop reading as a heading. Fog and depth still
            apply, so it sits in the scene and the bike occludes it. */}
        <meshBasicMaterial
          ref={face}
          map={word.texture}
          color="#ffffff"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
