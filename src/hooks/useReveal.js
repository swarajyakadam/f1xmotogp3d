import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scoped GSAP context for a section. `setup(ctx, gsap)` runs once, and every
 * tween or ScrollTrigger it creates is reverted automatically on unmount.
 */
export function useGsap(ref, setup, deps = []) {
  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => setup(gsap), ref)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Fade-and-rise for anything tagged `.rv`, masked slide-up for `.rv-line`. */
export function baseReveal(scope) {
  gsap.utils.toArray('.rv', scope).forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'expo.out',
      delay: parseFloat(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })

  // The start state is a CSS *percentage* translate, which GSAP reads back from
  // the computed matrix as plain pixels. A .to({yPercent: 0}) therefore thinks
  // it is already home and animates nothing, and even a fromTo keeps that
  // stray pixel offset unless y is pinned to 0 as well — either way the heading
  // stays parked below its overflow:hidden mask, invisible.
  gsap.utils.toArray('.rv-line', scope).forEach((el) => {
    gsap.fromTo(
      el.children,
      { yPercent: 110, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    )
  })
}
