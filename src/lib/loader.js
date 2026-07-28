import * as THREE from 'three'

// GLTFLoader pulls the .glb through FileLoader, which checks this cache first —
// so we can download it ourselves, watch the bytes arrive, and hand the parser
// a warm buffer instead of paying for the transfer twice.
THREE.Cache.enabled = true

/** The Formula 1 car. On screen from the first frame, so the preloader waits for it. */
export const F1_URL = '/models/ferrari_f1_2019.glb'
/** The MotoGP bike. Fetched once the page is interactive — nothing blocks on it. */
export const GP_URL = '/models/ducati_motogp.glb'

/**
 * Downloads a model, reporting 0..1 as bytes land.
 * Servers that omit content-length fall back to a time-based estimate so the
 * counter still moves rather than sitting at zero.
 */
export function loadModelBuffer(url = F1_URL, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const started = performance.now()
    let synthetic = 0

    new THREE.FileLoader()
      .setResponseType('arraybuffer')
      .load(
        url,
        (buf) => {
          onProgress(1)
          resolve(buf)
        },
        (e) => {
          if (e.lengthComputable && e.total > 0) {
            onProgress(Math.min(1, e.loaded / e.total))
          } else {
            // no content-length: creep toward 0.9 over ~12s, never past it
            const t = (performance.now() - started) / 12000
            synthetic = Math.max(synthetic, 0.9 * (1 - Math.exp(-3 * t)))
            onProgress(synthetic)
          }
        },
        reject
      )
  })
}
