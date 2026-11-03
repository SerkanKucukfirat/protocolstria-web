import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { productImg, type Product } from '../data'
import { splitWords } from './motion'

const BASE = import.meta.env.BASE_URL

// Yazı logosu maske olarak çizilir; bulunduğu yerin rengini alır.
export function Logo({ className = '' }: { className?: string }) {
  return <span className={`logo ${className}`} style={{ ['--src' as string]: `url(${BASE}img/logo-wordmark.png)` }} role="img" aria-label="Protocol Stria" />
}

export function RoundLogo({ className = '' }: { className?: string }) {
  return <img className={`roundlogo ${className}`} src={`${BASE}img/logo-round.png`} alt="" width={48} height={48} />
}

export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 24 12" aria-hidden>
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  )
}

// Fareyle eğilen 3D kart (dokunmatikte sabit kalır)
export function Tilt({ children, className = '', max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${-y * max}deg`)
    el.style.setProperty('--ry', `${x * max}deg`)
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
  }
  const leave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  )
}

export function ProductCard({ p, index }: { p: Product; index?: number }) {
  return (
    <Link to={`/urunler/${p.slug}`} className="pcard" data-cursor="İncele">
      <Tilt className="pcard-stage">
        <span className="pcard-glow" />
        <img src={productImg(p.slug)} alt={`${p.name} ${p.sub}`} loading="lazy" />
      </Tilt>
      <span className="pcard-meta">
        {index !== undefined && <em>{String(index + 1).padStart(2, '0')}</em>}
        <span className="pcard-line">{p.line === 'kabin' ? 'Kabin' : 'Ev devam'}</span>
      </span>
      <strong>{p.name}</strong>
      <span className="pcard-sub">{p.sub}</span>
      <span className="pcard-go">
        İncele <Arrow />
      </span>
    </Link>
  )
}

export function Crumbs({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav className="crumbs intro-up" aria-label="Konum">
      <Link to="/">Ana sayfa</Link>
      {items.map(i => (
        <span key={i.label}>
          <i>/</i>
          {i.to ? <Link to={i.to}>{i.label}</Link> : <em>{i.label}</em>}
        </span>
      ))}
    </nav>
  )
}

// İç sayfa başlığı: koyu yeşil zemin, ağaç filigranı, kelime kelime yükselen başlık
export function PageHero({ eyebrow, title, text, crumbs, image, children }: { eyebrow: string; title: string; text?: string; crumbs: { to?: string; label: string }[]; image?: string; children?: ReactNode }) {
  return (
    <section className={`phero ${image ? 'has-img' : ''}`}>
      <div className="phero-tree" aria-hidden />
      <div className="wrap phero-in">
        <div className="phero-copy">
          <Crumbs items={crumbs} />
          <p className="eyebrow intro-up">{eyebrow}</p>
          <h1 className="display xl intro-words">{splitWords(title)}</h1>
          {text && <p className="lead intro-up">{text}</p>}
          {children}
        </div>
        {image && (
          <div className="phero-img intro-img">
            <img src={image} alt="" />
          </div>
        )}
      </div>
    </section>
  )
}

export function Marquee({ items, style }: { items: string[]; style?: CSSProperties }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className="marquee" style={style} aria-label={items.join(', ')}>
      <div className="marquee-track" aria-hidden>
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i className="leaf" />
          </span>
        ))}
      </div>
    </div>
  )
}

export function CtaBand({ title, text, onClick, button }: { title: ReactNode; text?: string; onClick: () => void; button: string }) {
  return (
    <section className="ctaband">
      <div className="ctaband-tree" aria-hidden />
      <div className="wrap ctaband-in rv">
        <div>
          <h2 className="display l">{title}</h2>
          {text && <p className="lead">{text}</p>}
        </div>
        <button type="button" className="btn btn-light" onClick={onClick}>
          {button} <Arrow />
        </button>
      </div>
    </section>
  )
}
