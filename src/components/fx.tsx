import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLocation } from 'react-router-dom'
import { reduced } from './motion'

const BASE = import.meta.env.BASE_URL
const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches

// Açılış: logodaki ağaç alttan yukarı dolar, sayaç 100'e varınca perde kalkar. Oturum başına bir kez.
export function Preloader() {
  const [show, setShow] = useState(() => {
    try {
      return !reduced() && !sessionStorage.getItem('ps-intro')
    } catch {
      return !reduced()
    }
  })
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!show || !root.current) return
    try {
      sessionStorage.setItem('ps-intro', '1')
    } catch {
      /* gizli sekme */
    }
    document.documentElement.classList.add('locked')
    const counter = { v: 0 }
    // 3D sahne yüklenirken sayfa bir an donabilir; zaman çizelgesini kendimiz, kare başına en fazla 1/30 sn ilerletiriz
    // ki animasyon atlamasın.
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        document.documentElement.classList.remove('locked')
        setShow(false)
      },
    })
    tl.to(counter, { v: 100, duration: 1.9, ease: 'power2.inOut', onUpdate: () => num.current && (num.current.textContent = String(Math.round(counter.v))) })
      .fromTo('.pl-fill', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.9, ease: 'power2.inOut' }, 0)
      .from('.pl-word', { yPercent: 120, duration: 1.1, ease: 'expo.out' }, 0.3)
      .to('.pl-inner', { y: -40, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.15')
      .to(root.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.2')
    let raf = 0
    const start = performance.now()
    let last = start
    const step = (now: number) => {
      // kare başına en fazla 1/20 sn; ama gerçek zamanın 0,8 sn'den fazla gerisinde kalmaz (yavaş cihazlar)
      tl.time(Math.max(tl.time() + Math.min((now - last) / 1000, 1 / 20), (now - start) / 1000 - 0.8))
      last = now
      if (tl.progress() < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      tl.kill()
      document.documentElement.classList.remove('locked')
    }
  }, [show])
  if (!show) return null
  return (
    <div className="preloader" ref={root} aria-hidden>
      <div className="pl-inner">
        <div className="pl-tree">
          <span className="pl-base" style={{ ['--src' as string]: `url(${BASE}img/tree.png)` }} />
          <span className="pl-fill" style={{ ['--src' as string]: `url(${BASE}img/tree.png)` }} />
        </div>
        <div className="pl-row">
          <span className="pl-mask">
            <span className="pl-word">Protocol Stria</span>
          </span>
          <span className="pl-num">
            <span ref={num}>0</span>%
          </span>
        </div>
      </div>
    </div>
  )
}

// Özel imleç: küçük nokta ve onu gecikmeli izleyen halka; [data-cursor] üzerinde etiketle büyür.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const { pathname } = useLocation()
  useEffect(() => setLabel(''), [pathname])
  useEffect(() => {
    if (!finePointer() || reduced()) return
    document.documentElement.classList.add('has-cursor')
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...pos }
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button')
      const l = t?.dataset.cursor ?? ''
      setLabel(prev => (prev === l ? prev : l))
      ring.current?.classList.toggle('hover', !!t)
    }
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (ring.current) ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.ticker.remove(tick)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden>
        <span className={label ? 'on' : ''}>{label}</span>
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden />
    </>
  )
}

// Butonlar imlece doğru hafifçe çekilir
export function useMagnetic() {
  useEffect(() => {
    if (!finePointer() || reduced()) return
    let current: HTMLElement | null = null
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.btn')
      if (current && current !== el) {
        gsap.to(current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
        current = null
      }
      if (!el) return
      current = el
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) * 0.28
      const y = (e.clientY - r.top - r.height / 2) * 0.4
      gsap.to(el, { x, y, duration: 0.4, ease: 'power3.out' })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
}

export function Grain() {
  return <div className="grain" aria-hidden />
}
