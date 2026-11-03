import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { CONTACT, appSteps, g5, img, lineProducts, lines, productImg, products, protocol, techCards } from '../data'
import { reduced, splitWords, useReveal } from '../components/motion'
import { Arrow, CtaBand, Marquee, ProductCard, Tilt } from '../components/ui'
import { useQuote } from '../components/Layout'
import type { TreeHandle } from '../three/tree'

const BASE = import.meta.env.BASE_URL
const introSeen = () => {
  try {
    return !!sessionStorage.getItem('ps-intro')
  } catch {
    return true
  }
}

// Açılış: logodaki ağaç binlerce parçacıktan oluşur (ayrı parça olarak yüklenir).
// WebGL yoksa ya da tarayıcı bağlamı kapatırsa sabit ağaç görseli görünür.
function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const section = useRef<HTMLElement>(null)
  const handle = useRef<TreeHandle | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading')
  // her denemede yeni bir canvas: kaybolan bir WebGL bağlamı yeniden kullanılmaz
  const [attempt, setAttempt] = useState(0)
  const canvas2d = useRef<HTMLCanvasElement>(null)
  const flat = useRef<TreeHandle | null>(null)
  const flatStarting = useRef(false)
  const progress = useRef(0)
  const quote = useQuote()
  // 2D yedek: WebGL yoksa da ağaç her zaman parçacıklı ve hareketli kalır
  const wasReady = useRef(false)
  const startFlat = () => {
    if (flat.current || flatStarting.current || !canvas2d.current) return
    flatStarting.current = true
    import('../three/tree2d')
      .then(({ createTree2D }) => createTree2D(canvas2d.current!, { base: BASE, reduced: reduced(), mobile: window.innerWidth < 760, assembled: wasReady.current }))
      .then(h => {
        if (handle.current || !canvas2d.current) return h.dispose()
        h.setProgress(progress.current)
        flat.current = h
      })
      .catch(() => {})
      .finally(() => (flatStarting.current = false))
  }
  useEffect(
    () => () => {
      flat.current?.dispose()
      flat.current = null
    },
    [],
  )
  useEffect(() => {
    let alive = true
    let retry = 0
    const fail = () => {
      if (!alive) return
      handle.current?.dispose()
      handle.current = null
      setState('fallback')
      startFlat()
      // geçici hatada (bağlam kaybı, görsel yüklenemedi) 3D ağacı arka planda yeniden dene
      if (attempt < 6) retry = window.setTimeout(() => setAttempt(a => a + 1), 1500 + attempt * 2000)
    }
    import('../three/tree')
      .then(({ createTree }) => {
        if (!alive || !canvas.current) return null
        return createTree(canvas.current, { base: BASE, reduced: reduced(), mobile: window.innerWidth < 760 }, { onLost: fail })
      })
      .then(h => {
        if (!h) return
        if (!alive) return h.dispose()
        h.setProgress(progress.current)
        handle.current = h
        wasReady.current = true
        setState('ready')
        flat.current?.dispose()
        flat.current = null
      })
      .catch(fail)
    return () => {
      alive = false
      clearTimeout(retry)
      handle.current?.dispose()
      handle.current = null
    }
  }, [attempt])
  useEffect(() => {
    const el = section.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (!reduced())
        gsap
          .timeline({ delay: introSeen() ? 0.2 : 2.9 })
          .from('.hero-copy .w > span', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.07 })
          .from('.hero-copy .intro-up', { y: 26, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1 }, 0.35)
      gsap.to('.hero-copy', {
        yPercent: -25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true, onUpdate: st => {
            progress.current = st.progress
            handle.current?.setProgress(st.progress)
            flat.current?.setProgress(st.progress)
          },
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className={`hero is-${state}`} ref={section}>
      <div className="hero-bg" aria-hidden />
      <canvas ref={canvas2d} className="hero-canvas is-2d" aria-hidden />
      <canvas key={attempt} ref={canvas} className="hero-canvas" aria-label="Binlerce parçacıktan oluşan Protocol Stria ağacı" />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <p className="eyebrow intro-up">Kore formülasyonu · Profesyonel çatlak bakım protokolü</p>
          <h1 className="display xxl">{splitWords('Cildin yeniden yazılan hikâyesi.')}</h1>
          <p className="lead intro-up">Kore biyoteknolojisi ile geliştirilen Exosome ve lipozomal içerik teknolojileri; EGF destekli kabin ve ev devam bakım serisi.</p>
          <div className="hero-actions intro-up">
            <Link to="/uygulama" className="btn btn-light">
              Protokolü keşfedin <Arrow />
            </Link>
            <button type="button" className="btn btn-line" onClick={() => quote()}>
              Merkeziniz için teklif alın
            </button>
          </div>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden>
        <span>Kaydırın</span>
        <i />
      </div>
    </section>
  )
}

function Statement() {
  return (
    <section className="statement">
      <div className="wrap">
        <p className="eyebrow rv">Protocol Stria bakım yaklaşımı</p>
        <p className="display l statement-text rv">
          Stria bakımı, yalnızca yüzeysel bir iyileştirme değil; <em>cildin hafızasına dokunan</em> derin bir onarım sürecidir.
        </p>
        <div className="statement-grid">
          <p className="lead rv">
            Protocol Stria, profesyonel kabin uygulamaları ile ev devam bakım ürünlerini bir araya getiren bütüncül bir bakım yaklaşımı sunar. Gelişmiş aktif teknolojiler ve uygulama protokolü ile cilt yenilenme süreçlerinin desteklenmesine yardımcı olur.
          </p>
          <ul className="stats rv-stagger">
            <li>
              <strong>7</strong>
              <span>profesyonel formül</span>
            </li>
            <li>
              <strong>4</strong>
              <span>aşamalı kabin uygulaması</span>
            </li>
            <li>
              <strong>2×3</strong>
              <span>adımlı sabah & akşam rutini</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function Lines() {
  return (
    <section className="lines section">
      <div className="wrap lines-grid">
        {(['kabin', 'ev'] as const).map(l => (
          <Link key={l} to={`/${lines[l].slug}`} className="line-card rv" data-cursor="Keşfet">
            <div className="line-img">
              <img src={img(lines[l].tall)} alt={lines[l].short} loading="lazy" />
            </div>
            <div className="line-copy">
              <p className="eyebrow">{l === 'kabin' ? 'Profesyonel' : 'Günlük bakım'}</p>
              <h2 className="display m">{lines[l].short}</h2>
              <p>{lines[l].lead}</p>
              <div className="line-pills">
                {lineProducts(l).map(p => (
                  <span key={p.slug}>{p.name}</span>
                ))}
              </div>
              <span className="link">
                Keşfedin <Arrow />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// Teknoloji: solda sabit duran canlı "hücre" görseli, sağda kaydıkça değişen üç teknoloji
function Technology() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const triggers = gsap.utils.toArray<HTMLElement>('.tech-panel', el).map((p, i) =>
      ScrollTrigger.create({ trigger: p, start: 'top 60%', end: 'bottom 60%', onToggle: s => s.isActive && setActive(i) }),
    )
    return () => triggers.forEach(t => t.kill())
  }, [])
  return (
    <section className="tech section" ref={ref}>
      <div className="wrap tech-grid">
        <div className="tech-visual" data-active={active}>
          <div className="cell">
            <img src={img('exosome')} alt="" loading="lazy" />
            <span className="ring r1" />
            <span className="ring r2" />
            <span className="ring r3" />
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="vesicle" style={{ ['--i' as string]: i }} />
            ))}
          </div>
          <p className="tech-caption">{['Bitki kök hücresi · ProliCell®', 'Hücreler arası iletişim · Exosome', 'Hücre zarına benzer taşıyıcı · Lipozom'][active]}</p>
        </div>
        <div className="tech-panels">
          <div className="sec-head">
            <p className="eyebrow rv">Hücresel yenilenmeyi destekleyen akıllı teknoloji</p>
            <h2 className="display l rv">Hibrit biyoteknolojik yaklaşım</h2>
            <p className="lead rv">Protocol Stria sistemi, ProliCell®, Exosome, EGF ve Lipozom teknolojilerinin birleşimiyle geliştirilmiştir ve Kore kozmetik üretim teknolojileri kullanılarak üretilmektedir.</p>
          </div>
          {techCards.map((t, i) => (
            <article key={t.key} className={`tech-panel ${i === active ? 'on' : ''}`}>
              <em>0{i + 1}</em>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </article>
          ))}
          <Link to="/teknoloji" className="link rv">
            Teknolojiyi inceleyin <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Ürünler: yatay kayan sabitlenmiş vitrin
function Showcase() {
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrap.current
    const tr = track.current
    if (!el || !tr || reduced() || window.innerWidth < 900) return
    const cards = tr.querySelectorAll('.pcard')
    const skewTo = gsap.quickTo(cards, 'skewX', { duration: 0.5, ease: 'power3.out' })
    let idle = 0
    const skew = (v: number) => {
      skewTo(v)
      window.clearTimeout(idle)
      idle = window.setTimeout(() => skewTo(0), 120)
    }
    const ctx = gsap.context(() => {
      gsap.to(tr, {
        x: () => -(tr.scrollWidth - window.innerWidth + 80),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${tr.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // kaydırma hızına göre kartlar hafifçe eğilir, durunca düzelir
          onUpdate: st => skew(gsap.utils.clamp(-7, 7, st.getVelocity() / -320)),
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="showcase" ref={wrap}>
      <div className="showcase-head wrap">
        <p className="eyebrow">Protocol Stria bakım serisi</p>
        <h2 className="display l">Yedi formül, tek protokol</h2>
      </div>
      <div className="showcase-track" ref={track}>
        {products.map((p, i) => (
          <ProductCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </section>
  )
}

function Steps() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.steps-line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.step', el).forEach(s =>
        ScrollTrigger.create({ trigger: s, start: 'top 65%', onEnter: () => s.classList.add('on'), onLeaveBack: () => s.classList.remove('on') }),
      )
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="steps-sec section">
      <div className="wrap steps-grid">
        <div className="steps-sticky">
          <p className="eyebrow rv">Protocol Stria uygulama aşamaları</p>
          <h2 className="display l rv">Kabinde başlar, evde devam eder</h2>
          <p className="lead rv">{protocol.intro.text[0]}</p>
          <div className="steps-img rv-img">
            <img src={img('kabin-tall2')} alt="Protocol Stria kabin ürünleri ve vakum cihazı" loading="lazy" />
          </div>
        </div>
        <div className="steps-list" ref={ref}>
          <div className="steps-line" aria-hidden>
            <i />
          </div>
          {appSteps.map((s, i) => (
            <article key={s.title} className="step">
              <span className="step-n">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </article>
          ))}
          <Link to="/uygulama" className="link">
            Adım adım uygulama protokolü <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Routine() {
  const [night, setNight] = useState(false)
  const r = night ? protocol.home.night : protocol.home.day
  return (
    <section className={`routine section ${night ? 'is-night' : ''}`}>
      <div className="wrap">
        <div className="sec-head center">
          <p className="eyebrow rv">Ev devam ürünleri kullanım protokolü</p>
          <h2 className="display l rv">Sabah ve akşam, üç adım</h2>
          <div className="toggle rv" role="tablist" aria-label="Rutin">
            <button role="tab" aria-selected={!night} className={!night ? 'on' : ''} onClick={() => setNight(false)}>
              ☀ Sabah
            </button>
            <button role="tab" aria-selected={night} className={night ? 'on' : ''} onClick={() => setNight(true)}>
              ☾ Akşam
            </button>
          </div>
          <p className="muted rv">{r.label}</p>
        </div>
        <div className="routine-grid" key={night ? 'n' : 'd'}>
          {r.steps.map(s => (
            <Link key={s.n} to={`/urunler/${s.product}`} className="rcard" data-cursor="İncele">
              <Tilt className="rcard-stage" max={8}>
                <img src={productImg(s.product)} alt="" loading="lazy" />
              </Tilt>
              <span className="rcard-n">{s.n}. adım</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function G5() {
  return (
    <section className="g5 section">
      <div className="g5-bg" data-parallax="8">
        <picture>
          <source media="(max-width: 900px)" srcSet={img('g5-tall')} />
          <img src={img('g5')} alt="" loading="lazy" />
        </picture>
      </div>
      <div className="wrap g5-in">
        <div className="g5-card rv">
          <p className="eyebrow">G5 destekli profesyonel bakım</p>
          <h2 className="display m">{g5.title}</h2>
          {g5.text.map(t => (
            <p key={t.slice(0, 20)}>{t}</p>
          ))}
          <Link to="/uygulama#g5" className="link">
            G5 kullanım tablosu <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Catalog() {
  return (
    <section className="catalog section">
      <div className="wrap catalog-in">
        <div className="catalog-cover rv-img">
          <img src={`${BASE}img/insta1.webp`} alt="Protocol Stria profesyonel katalog" loading="lazy" />
        </div>
        <div className="rv">
          <p className="eyebrow">Protocol Stria</p>
          <h2 className="display l">Profesyonel katalog</h2>
          <p className="lead">Protocol Stria ürün serisi ve profesyonel uygulama sistemi hakkında detaylı bilgi almak için kataloğumuzu inceleyebilirsiniz.</p>
          <a className="btn" href={CONTACT.catalog} target="_blank" rel="noreferrer">
            PDF kataloğu indir <Arrow />
          </a>
        </div>
      </div>
      <div className="insta wrap rv-stagger">
        {[2, 3, 4, 5, 6].map(n => (
          <a key={n} href={CONTACT.instagram} target="_blank" rel="noreferrer" className="insta-item" aria-label="Instagram @protocol.stria" data-cursor="Instagram">
            <img src={img(`insta${n}`)} alt="" loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const page = useRef<HTMLDivElement>(null)
  const quote = useQuote()
  useReveal(page)
  useEffect(() => {
    document.title = 'Protocol Stria — Profesyonel Çatlak Bakım Protokolü'
  }, [])
  return (
    <div ref={page}>
      <Hero />
      <Marquee items={['ProliCell®', 'Exosome', 'EGF', 'Lipozom', 'Kore formülasyonu', 'G5 uyumlu']} />
      <Statement />
      <Lines />
      <Technology />
      <Showcase />
      <Steps />
      <Routine />
      <G5 />
      <Catalog />
      <CtaBand
        title={
          <>
            Merkeziniz için Protocol Stria <em>hakkında bilgi</em> almak ister misiniz?
          </>
        }
        text="Protocol Stria profesyonel bakım sistemini merkezinizde uygulamak ve iş birliği süreçleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz."
        button="Teklif alın"
        onClick={() => quote()}
      />
    </div>
  )
}
