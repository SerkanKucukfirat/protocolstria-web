import { useEffect, useRef, useState, type JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONTACT, about, g5, img, policies, productImg, protocol, tech } from '../data'
import { capsBrand, useIntro, useReveal } from '../components/motion'
import { Arrow, CtaBand, PageHero } from '../components/ui'
import { useQuote } from '../components/Layout'

function usePage(title: string) {
  const page = useRef<HTMLDivElement>(null)
  useIntro(page)
  useReveal(page)
  useEffect(() => {
    document.title = `${title} — Protocol Stria`
  }, [title])
  return page
}

// logo files for the ProliCell badges (public/img/badges)
const BADGE_LOGO: Record<string, string> = {
  'ACTV Biotech': 'actv',
  'Magic Effect with Small RNAs': 'small-rnas',
  'Dermatologically Tested': 'derm',
  'Patent Pending': 'patent',
  'Sustainable Materials': 'sustainable',
  'COSMOS Approved': 'cosmos',
}

export function Technology() {
  const page = usePage('Teknoloji')
  const quote = useQuote()
  return (
    <div ref={page}>
      <PageHero eyebrow="Teknoloji" title={tech.hybrid.title} text={tech.hybrid.sub} crumbs={[{ label: 'Teknoloji' }]} image={img('exosome')} />
      <section className="section">
        <div className="wrap split">
          <div>
            <p className="eyebrow rv">{capsBrand(tech.prolicell.sub)}</p>
            <h2 className="display l rv">{tech.prolicell.title}</h2>
            <ul className="badge-logos rv-stagger" aria-label="Sertifikalar ve teknoloji ortakları">
              {tech.prolicell.badges.map(b => (
                <li key={b} title={b}>
                  <img src={img(`badges/${BADGE_LOGO[b]}`)} alt={b} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            {tech.prolicell.text.map(t => (
              <p key={t.slice(0, 20)} className="rv">
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="section dark">
        <div className="phero-tree" aria-hidden />
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv hyb-eyebrow">
              <img className="exo-mark" src={img('badges/exosome')} alt="Exosome" loading="lazy" />
              {capsBrand(tech.hybrid.sub)}
            </p>
            <h2 className="display l rv">Exosome mesajı iletir, lipozom güvenle taşır</h2>
          </div>
          <div className="hyb-grid rv-stagger">
            {tech.hybrid.text.map((t, i) => (
              <article key={i} className="hyb">
                <em>0{i + 1}</em>
                <p>{t}</p>
              </article>
            ))}
          </div>
          <p className="motto rv">
            {tech.hybrid.motto[0]}
            <br />
            <em>{tech.hybrid.motto[1]}</em>
          </p>
        </div>
      </section>
      <CtaBand title={<>Teknolojiyi <em>merkezinizde</em> deneyimleyin</>} button="Teklif alın" onClick={() => quote('Protocol Stria teknolojisi')} />
    </div>
  )
}

// Training videos (shared Google Drive folder). They play on the page; a link opens them on Drive.
const TRAINING_VIDEOS = [
  { id: '1R-nFnTI-DKd19BBeqjQZtHMDn1Fn4sk3', youtube: '24GAc36NyJk', title: 'Çatlak uygulaması', text: 'Protocol Stria kabin uygulamasının adım adım anlatımı.', poster: 'video-stria' },
  { id: '1nUsej6U-GT-F8slK2VhasilCP2b_VJe1', youtube: 'QiJJ8RQSdnU', title: 'G5 uygulaması', text: 'Kabin ürünleri ile G5 destekli selülit bakımı uygulaması.', poster: 'video-g5' },
]

function TrainingVideo({ id, youtube, title, text, poster }: { id: string; youtube: string; title: string; text: string; poster: string }) {
  const [play, setPlay] = useState(false)
  return (
    <article className="video-card">
      <div className="video-frame">
        {play ? (
          <iframe src={`https://drive.google.com/file/d/${id}/preview`} title={title} allow="autoplay; fullscreen" allowFullScreen />
        ) : (
          <button type="button" className="video-poster" onClick={() => setPlay(true)} aria-label={`${title} videosunu oynat`}>
            <img src={img(poster)} alt="" loading="lazy" />
            <span className="video-play" aria-hidden>
              <i />
            </span>
          </button>
        )}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <a className="link" href={`https://www.youtube.com/watch?v=${youtube}`} target="_blank" rel="noreferrer">
        YouTube'da izle <Arrow />
      </a>
    </article>
  )
}

export function Application() {
  const page = usePage('Uygulama')
  const quote = useQuote()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 400)
  }, [hash])
  return (
    <div ref={page}>
      <PageHero eyebrow="Uygulama" title={protocol.intro.sub} crumbs={[{ label: 'Uygulama' }]} image={img('kabin-tall2')} />
      <section className="section">
        <div className="wrap split">
          <p className="display s rv">{protocol.intro.text[0]}</p>
          <div>
            {protocol.intro.text.slice(1).map(t => (
              <p key={t.slice(0, 20)} className="rv">
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="videolar">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">Eğitim videoları</p>
            <h2 className="display l rv">Uygulamayı izleyerek öğrenin</h2>
          </div>
          <div className="video-grid rv-stagger">
            {TRAINING_VIDEOS.map(v => (
              <TrainingVideo key={v.id} {...v} />
            ))}
          </div>
        </div>
      </section>
      <section className="section tint">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">{capsBrand(protocol.cabin.title)}</p>
            <h2 className="display l rv">{protocol.cabin.sub}</h2>
          </div>
          <ol className="pstep-grid rv-stagger">
            {protocol.cabin.steps.map(s => (
              <li key={s.n} className="pstep">
                <span className="pstep-n">{s.n}</span>
                <img src={productImg(s.product)} alt="" loading="lazy" />
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="note rv">{protocol.cabin.note}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">Ev devam</p>
            <h2 className="display l rv">{protocol.home.title}</h2>
          </div>
          <div className="dn-grid">
            {(['day', 'night'] as const).map(k => (
              <div key={k} className={`dn ${k} rv`}>
                <p className="dn-head">
                  <span>{k === 'day' ? '☀' : '☾'}</span> {protocol.home[k].label}
                </p>
                {protocol.home[k].steps.map(s => (
                  <Link to={`/urunler/${s.product}`} key={s.n} className="dn-step">
                    <img src={productImg(s.product)} alt="" loading="lazy" />
                    <div>
                      <em>
                        {s.n}. adım · {s.title}
                      </em>
                      <p>{s.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section dark" id="g5">
        <div className="phero-tree" aria-hidden />
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">G5 destekli selülit bakımı · Kullanım tablosu</p>
            <h2 className="display l rv">{g5.title}</h2>
            {g5.text.map(t => (
              <p key={t.slice(0, 20)} className="lead rv">
                {t}
              </p>
            ))}
          </div>
          <div className="g5-table rv-stagger">
            <div className="g5-row head">
              <span>Kullanılan ürün</span>
              <span>Uygulama şekli</span>
              <span>Amaç</span>
            </div>
            {g5.table.map(r => (
              <div key={r.n} className="g5-row">
                <span className="g5-prod">
                  <img src={productImg(r.product)} alt="" loading="lazy" />
                  <b>
                    {r.n}. adım
                    <br />
                    {r.product.startsWith('exotherm') ? 'EXOTHERM' : 'LIPOTHERM'}
                  </b>
                </span>
                <span>{r.how}</span>
                <span>{r.goal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title={<>Protokolü <em>merkezinize</em> getirin</>} button="Teklif alın" onClick={() => quote('Protocol Stria uygulaması')} />
    </div>
  )
}

export function About() {
  const page = usePage('Hakkımızda')
  return (
    <div ref={page}>
      <PageHero eyebrow="Hakkımızda" title="Kore Biyoteknolojisi ile Çatlak Bakımına Bütüncül Bir Yaklaşım" keepCase crumbs={[{ label: 'Hakkımızda' }]} image={img('ev-tall')} />
      <section className="section">
        <div className="wrap split">
          <p className="display s rv">{about[0]}</p>
          <div>
            {about.slice(1).map(t => (
              <p key={t.slice(0, 20)} className="rv">
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="wide-band">
        <img src={img('day-night')} alt="" loading="lazy" />
      </section>
    </div>
  )
}

export function Contact() {
  const page = usePage('İletişim')
  const quote = useQuote()
  return (
    <div ref={page}>
      <PageHero eyebrow="İletişim" title="Merkeziniz için Protocol Stria hakkında bilgi alın" text="Protocol Stria profesyonel bakım sistemini merkezinizde uygulamak ve iş birliği süreçleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz." crumbs={[{ label: 'İletişim' }]}>
        <div className="hero-actions intro-up">
          <button type="button" className="btn btn-light" onClick={() => quote()}>
            İletişim formu <Arrow />
          </button>
        </div>
      </PageHero>
      <section className="section">
        <div className="wrap contact-grid rv-stagger">
          <a href={`mailto:${CONTACT.email}`} className="ccard">
            <em>E-posta</em>
            <strong>{CONTACT.email}</strong>
          </a>
          <a href={CONTACT.phoneHref} className="ccard">
            <em>Telefon</em>
            <strong>{CONTACT.phone}</strong>
          </a>
          <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer" className="ccard">
            <em>WhatsApp</em>
            <strong>{CONTACT.whatsapp}</strong>
          </a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address)}`} target="_blank" rel="noreferrer" className="ccard wide">
            <em>Adres</em>
            <strong>{CONTACT.address}</strong>
          </a>
        </div>
      </section>
    </div>
  )
}

export function Policies() {
  const page = usePage('Politikalarımız')
  return (
    <div ref={page}>
      <PageHero eyebrow="Politikalarımız" title="Politikalarımız & KVKK Aydınlatma Metni" crumbs={[{ label: 'Politikalarımız' }]} />
      <section className="section">
        <div className="wrap prose">
          {(() => {
            const out: JSX.Element[] = []
            let list: string[] = []
            const flush = (k: number) => {
              if (list.length) out.push(<ul key={`l${k}`}>{list.map(l => <li key={l}>{l}</li>)}</ul>)
              list = []
            }
            policies.blocks.forEach((b, k) => {
              if (b.li) {
                list.push(b.li)
                return
              }
              flush(k)
              if (b.h) out.push(b.h === b.h.toUpperCase() || /Politikası$/.test(b.h) ? <h2 key={k}>{b.h}</h2> : <h3 key={k}>{b.h}</h3>)
              else if (b.p) out.push(<p key={k}>{b.p}</p>)
            })
            flush(9999)
            return out
          })()}
        </div>
      </section>
    </div>
  )
}
