import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CONTACT, lineProducts, lines } from '../data'
import { reduced } from './motion'
import { Arrow, Logo, RoundLogo } from './ui'
import { Cursor, Grain, Preloader, useMagnetic } from './fx'

let lenis: Lenis | null = null

function useSmoothScroll() {
  useEffect(() => {
    if (reduced()) return
    lenis = new Lenis({ lerp: 0.085 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

// Her sayfa en üstten açılır; arada yeşil bir perde kalkar.
function usePageChange(curtain: RefObject<HTMLDivElement | null>) {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true, force: true })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    if (first.current) first.current = false
    else if (curtain.current && !reduced())
      gsap.fromTo(curtain.current, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.05 })
    return () => window.clearTimeout(id)
  }, [pathname, curtain])
}

// Teklif formu her yerden açılabilsin
const QuoteCtx = createContext<(subject?: string) => void>(() => {})
export const useQuote = () => useContext(QuoteCtx)

function Header({ onQuote }: { onQuote: () => void }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    setOpen(false)
    setDrop(false)
  }, [pathname])
  useEffect(() => {
    document.documentElement.classList.toggle('locked', open)
    if (open) lenis?.stop()
    else lenis?.start()
  }, [open])
  return (
    <header className={`hdr ${solid ? 'solid' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="hdr-in">
        <Link to="/" className="hdr-logo" aria-label="Protocol Stria ana sayfa">
          <RoundLogo />
          <Logo />
        </Link>
        <nav className="hdr-nav" aria-label="Ana menü">
          <div className={`hdr-drop ${drop ? 'show' : ''}`} onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
            <button type="button" aria-expanded={drop} onClick={() => setDrop(d => !d)}>
              Ürünler <span className="chev" aria-hidden />
            </button>
            <div className="drop-panel">
              {(['kabin', 'ev'] as const).map(l => (
                <div key={l}>
                  <Link to={`/${lines[l].slug}`} className="drop-head">
                    {lines[l].short} <Arrow />
                  </Link>
                  {lineProducts(l).map(p => (
                    <Link key={p.slug} to={`/urunler/${p.slug}`}>
                      {p.name}
                      <small>{p.sub}</small>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <NavLink to="/teknoloji">Teknoloji</NavLink>
          <NavLink to="/uygulama">Uygulama</NavLink>
          <NavLink to="/hakkimizda">Hakkımızda</NavLink>
          <NavLink to="/iletisim">İletişim</NavLink>
        </nav>
        <button type="button" className="btn btn-sm hdr-cta" onClick={onQuote}>
          Teklif alın
        </button>
        <button type="button" className="burger" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <i />
          <i />
        </button>
      </div>
      <div className="mnav" aria-hidden={!open}>
        <div className="mnav-in">
          <p className="eyebrow">Ürünler</p>
          <Link to={`/${lines.kabin.slug}`}>Kabin Ürünleri</Link>
          <Link to={`/${lines.ev.slug}`}>Ev Devam Ürünleri</Link>
          <p className="eyebrow">Protocol Stria</p>
          <Link to="/teknoloji">Teknoloji</Link>
          <Link to="/uygulama">Uygulama</Link>
          <Link to="/hakkimizda">Hakkımızda</Link>
          <Link to="/iletisim">İletişim</Link>
          <button type="button" className="btn" onClick={onQuote}>
            Merkeziniz için teklif alın <Arrow />
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer({ onQuote }: { onQuote: () => void }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-top">
        <div className="ftr-brand">
          <RoundLogo />
          <p>Kore biyoteknolojisi ile geliştirilen Exosome ve lipozomal içerik teknolojileri. Ventura Medikal Kozmetik A.Ş. · Slimwell Group</p>
          <button type="button" className="btn btn-line" onClick={onQuote}>
            Merkeziniz için teklif alın <Arrow />
          </button>
        </div>
        <div>
          <p className="eyebrow">Ürünler</p>
          <Link to={`/${lines.kabin.slug}`}>Kabin Ürünleri</Link>
          <Link to={`/${lines.ev.slug}`}>Ev Devam Ürünleri</Link>
          <a href={CONTACT.catalog} target="_blank" rel="noreferrer">
            PDF Katalog
          </a>
        </div>
        <div>
          <p className="eyebrow">Protocol Stria</p>
          <Link to="/teknoloji">Teknoloji</Link>
          <Link to="/uygulama">Uygulama</Link>
          <Link to="/hakkimizda">Hakkımızda</Link>
          <Link to="/politikalar">Politikalarımız</Link>
        </div>
        <div>
          <p className="eyebrow">İletişim</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp {CONTACT.whatsapp}
          </a>
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer">
            @protocol.stria
          </a>
        </div>
      </div>
      <div className="wrap ftr-word" aria-hidden>
        <Logo />
      </div>
      <div className="wrap ftr-bottom">
        <span>© {new Date().getFullYear()} Protocol Stria · Slimwell Group</span>
        <span>{CONTACT.address}</span>
      </div>
    </footer>
  )
}

// Sunucu tarafı olmadığı için form, doldurulan bilgilerle WhatsApp'ı ya da e-postayı açar.
function QuoteModal({ subject, onClose }: { subject: string; onClose: () => void }) {
  const [sent, setSent] = useState<null | 'wa' | 'mail'>(null)
  useEffect(() => {
    document.documentElement.classList.add('locked')
    lenis?.stop()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      document.documentElement.classList.remove('locked')
      lenis?.start()
      window.removeEventListener('keydown', esc)
    }
  }, [onClose])
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const via = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === 'mail' ? 'mail' : 'wa'
    const rows = [
      'Protocol Stria teklif talebi',
      subject && `Konu: ${subject}`,
      `Ad Soyad: ${f.get('name')}`,
      `Telefon: ${f.get('phone')}`,
      `Merkez: ${f.get('center')}`,
      `İl / İlçe: ${f.get('city')}`,
      f.get('msg') ? `Mesaj: ${f.get('msg')}` : '',
    ].filter(Boolean)
    const text = rows.join('\n')
    const url =
      via === 'wa'
        ? `${CONTACT.whatsappHref}?text=${encodeURIComponent(text)}`
        : `mailto:${CONTACT.email}?subject=${encodeURIComponent('Protocol Stria teklif talebi')}&body=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener')
    setSent(via)
  }
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="İletişim formu" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button type="button" className="modal-x" onClick={onClose} aria-label="Kapat">
          ×
        </button>
        <p className="eyebrow">İletişim formu</p>
        <h2 className="h3">Merkeziniz için teklif alın</h2>
        <p className="muted">Merkeziniz için profesyonel bakım ürünleri hakkında bilgi almak üzere formu doldurabilirsiniz.</p>
        {sent ? (
          <p className="sent">
            {sent === 'wa' ? 'WhatsApp yeni sekmede açıldı; mesajı göndermeniz yeterli.' : 'E-posta uygulamanız açıldı; e-postayı göndermeniz yeterli.'} Ekibimiz en kısa sürede size dönüş yapacaktır.
          </p>
        ) : (
          <form onSubmit={submit} className="form">
            <label>
              Adınız Soyadınız
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Telefon Numaranız
              <input name="phone" required type="tel" autoComplete="tel" />
            </label>
            <label>
              Merkez İsmi
              <input name="center" required />
            </label>
            <label>
              İl / İlçe
              <input name="city" required />
            </label>
            <label className="full">
              Mesajınız (isteğe bağlı)
              <textarea name="msg" rows={3} defaultValue={subject ? `${subject} hakkında bilgi almak istiyorum.` : ''} />
            </label>
            <label className="check full">
              <input type="checkbox" required /> <span>
                Kişisel verilerimin <Link to="/politikalar" onClick={onClose}>KVKK Aydınlatma Metni</Link> kapsamında işlenmesini kabul ediyorum.
              </span>
            </label>
            <div className="form-actions full">
              <button className="btn" value="wa">
                WhatsApp ile gönder <Arrow />
              </button>
              <button className="btn btn-line dark" value="mail">
                E-posta ile gönder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Layout() {
  const curtain = useRef<HTMLDivElement>(null)
  const [quote, setQuote] = useState<string | null>(null)
  useSmoothScroll()
  usePageChange(curtain)
  useMagnetic()
  const openQuote = (s?: string) => setQuote(s ?? '')
  return (
    <QuoteCtx.Provider value={openQuote}>
      <a href="#main" className="skip">
        Ana içeriğe atla
      </a>
      <Header onQuote={() => openQuote()} />
      <main id="main">
        <Outlet />
      </main>
      <Footer onQuote={() => openQuote()} />
      <div ref={curtain} className="curtain" aria-hidden>
        <RoundLogo />
      </div>
      {quote !== null && <QuoteModal subject={quote} onClose={() => setQuote(null)} />}
      <Grain />
      <Cursor />
      <Preloader />
    </QuoteCtx.Provider>
  )
}
