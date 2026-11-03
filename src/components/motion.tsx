import { useEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Scroll reveals for everything inside `scope`:
//  .rv        fades up
//  .rv-img    unveils its image with a clip and a slow settle
//  .rv-line   draws a hairline from the left
//  .rv-stagger children fade up one after another
export function useReveal(scope: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useEffect(() => {
    const root = scope.current
    if (!root) return
    if (reduced()) {
      root.querySelectorAll<HTMLElement>('.rv,.rv-img,.rv-line,.rv-stagger > *').forEach(el => (el.style.opacity = '1'))
      return
    }
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.rv').forEach(el =>
        gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }),
      )
      gsap.utils.toArray<HTMLElement>('.rv-stagger').forEach(el =>
        gsap.fromTo(
          el.children,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 86%' } },
        ),
      )
      gsap.utils.toArray<HTMLElement>('.rv-img').forEach(el => {
        const pic = el.querySelector('img')
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
        tl.fromTo(el, { clipPath: 'inset(12% 8% 12% 8%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.5, ease: 'expo.out' })
        if (pic) tl.fromTo(pic, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
      })
      gsap.utils.toArray<HTMLElement>('.rv-line').forEach(el =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } }),
      )
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el =>
        gsap.fromTo(
          el,
          { yPercent: -Number(el.dataset.parallax) },
          { yPercent: Number(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        ),
      )
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Large headings come in line by line: each word rises from behind a mask.
export function splitWords(text: string) {
  return text.split(' ').flatMap((w, i) => [
    <span className="w" key={i}>
      <span>{w}</span>
    </span>,
    ' ',
  ])
}

// First-screen choreography for page heroes: words rise, copy fades up, picture unveils.
export function useIntro(scope: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useEffect(() => {
    const root = scope.current
    if (!root || reduced()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.25 })
      tl.from('.intro-words .w > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.06 })
        .from('.intro-up', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.15)
        .fromTo('.intro-img', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
        .from('.intro-img img', { scale: 1.25, duration: 2.4, ease: 'expo.out' }, 0.2)
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
