/**
 * Why WebGL is not available, in words a visitor can act on.
 *
 * A canvas that simply refuses to start is the single most common way this
 * page breaks on someone else's machine, and "WebGL failed" tells them
 * nothing. This probes once, cheaply, and reports back what actually happened
 * — including the browser's own reason string, which is usually specific
 * ("GPU process isn't usable", "disabled by policy", a driver name).
 */

/** three r160+ dropped WebGL 1: the renderer needs a WebGL 2 context. */
const ATTRS = { failIfMajorPerformanceCaveat: false, antialias: true, alpha: true }

function tryContext(canvas, kind, powerPreference) {
  let reason = ''
  const onError = (e) => {
    reason = e.statusMessage || ''
  }
  canvas.addEventListener('webglcontextcreationerror', onError, false)
  let ctx = null
  try {
    ctx = canvas.getContext(kind, { ...ATTRS, powerPreference })
  } catch (err) {
    reason = err?.message || String(err)
  }
  canvas.removeEventListener('webglcontextcreationerror', onError, false)
  return { ctx, reason }
}

/**
 * @returns {{
 *   ok: boolean,
 *   powerPreference: 'high-performance' | 'default',
 *   renderer: string,
 *   title: string,
 *   detail: string,
 * }}
 */
export function probeWebGL() {
  if (typeof document === 'undefined') {
    return { ok: false, powerPreference: 'default', renderer: '', title: '', detail: '' }
  }

  const canvas = document.createElement('canvas')

  // Preferred path: WebGL 2 on the discrete GPU.
  let { ctx, reason } = tryContext(canvas, 'webgl2', 'high-performance')
  let powerPreference = 'high-performance'

  // Hybrid-graphics laptops with a sick discrete driver often refuse
  // high-performance and hand back a perfectly good integrated context.
  if (!ctx) {
    const fallback = tryContext(document.createElement('canvas'), 'webgl2', 'default')
    if (fallback.ctx) {
      ctx = fallback.ctx
      powerPreference = 'default'
    } else {
      reason = fallback.reason || reason
    }
  }

  if (ctx) {
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(
      (dbg && ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) || ctx.getParameter(ctx.RENDERER) || ''
    )
    // Hand the context straight back; a probe left alive burns one of the
    // handful of contexts a browser will give a single page.
    ctx.getExtension('WEBGL_lose_context')?.loseContext()
    return { ok: true, powerPreference, renderer, title: '', detail: '' }
  }

  // No WebGL 2. Is there WebGL 1, i.e. a browser too old for three.js?
  const legacy = tryContext(document.createElement('canvas'), 'webgl', 'default')
  if (legacy.ctx) {
    legacy.ctx.getExtension('WEBGL_lose_context')?.loseContext()
    return {
      ok: false,
      powerPreference: 'default',
      renderer: '',
      title: 'Browser too old for the 3D layer',
      detail:
        'This browser has WebGL 1 but not WebGL 2, which the renderer needs. Updating to a current Chrome, Edge, Firefox or Safari fixes it.',
    }
  }

  const detail = reason
    ? `The browser reported: “${reason.trim()}”`
    : 'The browser would not create a WebGL context.'

  return {
    ok: false,
    powerPreference: 'default',
    renderer: '',
    title: 'The 3D layer could not start',
    detail: `${detail} This is usually hardware acceleration being switched off, a graphics driver that needs updating, or a disk with no free space left for the GPU cache. In Chrome or Edge, chrome://gpu says which.`,
  }
}
