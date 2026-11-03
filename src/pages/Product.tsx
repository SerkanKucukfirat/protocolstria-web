import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link, useParams } from 'react-router-dom'
import { bySlug, lines, productImg, products, protocol } from '../data'
import { reduced, splitWords, useReveal } from '../components/motion'
import { Arrow, Crumbs, ProductCard, Tilt } from '../components/ui'
import { useQuote } from '../components/Layout'
import NotFound from './NotFound'

// Ürünün protokoldeki yeri: kabin adımları ya da ev rutini
function usage(slug: string) {
  const out: string[] = []
  protocol.cabin.steps.filter(s => s.product === slug).forEach(s => out.push(`Kabin uygulaması ${s.n}. adım — ${s.text}`))
  ;(['day', 'night'] as const).forEach(k =>
    protocol.home[k].steps.filter(s => s.product === slug).forEach(s => out.push(`${k === 'day' ? 'Sabah' : 'Akşam'} rutini ${s.n}. adım (${s.title}) — ${s.text}`)),
  )
  return out
}

export default function ProductPage() {
  const { slug } = useParams()
  const p = bySlug(slug)
  const page = useRef<HTMLDivElement>(null)
  const quote = useQuote()
  useReveal(page, [slug])
  useEffect(() => {
    if (p) document.title = `${p.name} ${p.sub} — Protocol Stria`
  }, [p])
  useEffect(() => {
    const el = page.current
    if (!el || reduced()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .from('.prod-hero .w > span', { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.06 })
        .from('.prod-hero .intro-up', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.2)
        .from('.prod-shot img', { y: 120, rotate: -6, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0)
      gsap.to('.prod-shot img', { y: -18, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 })
    }, el)
    return () => ctx.revert()
  }, [slug])
  if (!p) return <NotFound />
  const L = lines[p.line]
  const others = products.filter(x => x.slug !== p.slug && x.line === p.line).concat(products.filter(x => x.line !== p.line)).slice(0, 3)
  const use = usage(p.slug)
  return (
    <div ref={page} key={p.slug}>
      <section className="prod-hero">
        <div className="wrap prod-hero-in">
          <div className="prod-copy">
            <Crumbs items={[{ to: `/${L.slug}`, label: L.short }, { label: p.name }]} />
            <p className="eyebrow intro-up">
              {L.short} · {p.step}
            </p>
            <h1 className="display xl">{splitWords(p.name)}</h1>
            <p className="prod-sub intro-up">{p.sub}</p>
            {p.routine && (
              <p className="routine-badges intro-up">
                {p.routine.split(' · ').map(r => (
                  <span key={r}>
                    {r.startsWith('Gündüz') ? '☀' : '☾'} {r}
                  </span>
                ))}
              </p>
            )}
            <p className="lead intro-up">{p.desc[0]}</p>
            <div className="hero-actions intro-up">
              <button type="button" className="btn btn-light" onClick={() => quote(`${p.name} ${p.sub}`)}>
                Bilgi alın <Arrow />
              </button>
              <a href="#icerikler" className="btn btn-line">
                Aktif içerikler
              </a>
            </div>
          </div>
          <Tilt className="prod-shot" max={14}>
            <span className="prod-tree" aria-hidden />
            <span className="prod-halo" />
            <img src={productImg(p.slug)} alt={`${p.name} ${p.sub}`} />
            <span className="prod-floor" />
          </Tilt>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <p className="eyebrow rv">Ürün hakkında</p>
            {p.desc.slice(1).map(d => (
              <p key={d.slice(0, 24)} className="display s rv">
                {d}
              </p>
            ))}
          </div>
          {use.length > 0 && (
            <div className="usage rv">
              <p className="eyebrow">Protokoldeki yeri</p>
              <ul>
                {use.map(u => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <Link to="/uygulama" className="link">
                Uygulama protokolü <Arrow />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section actives" id="icerikler">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">Aktif içerikler</p>
            <h2 className="display l rv">Formülün kalbinde</h2>
          </div>
          <div className="act-grid rv-stagger">
            {p.actives.map(([name, text], i) => (
              <article key={name} className="act">
                <em>{String(i + 1).padStart(2, '0')}</em>
                <h3>{name}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">Protocol Stria bakım serisi</p>
            <h2 className="display l rv">Birlikte kullanılanlar</h2>
          </div>
          <div className="pgrid n3 rv-stagger">
            {others.map(x => (
              <ProductCard key={x.slug} p={x} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
