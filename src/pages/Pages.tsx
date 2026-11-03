import { useEffect, useRef, type JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONTACT, about, g5, img, policies, productImg, protocol, tech } from '../data'
import { useIntro, useReveal } from '../components/motion'
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

export function Technology() {
  const page = usePage('Teknoloji')
  const quote = useQuote()
  return (
    <div ref={page}>
      <PageHero eyebrow="Teknoloji" title={tech.hybrid.title} text={tech.hybrid.sub} crumbs={[{ label: 'Teknoloji' }]} image={img('exosome')} />
      <section className="section">
        <div className="wrap split">
          <div>
            <p className="eyebrow rv">{tech.prolicell.sub}</p>
            <h2 className="display l rv">{tech.prolicell.title}</h2>
            <div className="badges rv-stagger">
              {tech.prolicell.badges.map(b => (
                <span key={b}>{b}</span>
              ))}
            </div>
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
            <p className="eyebrow rv">{tech.hybrid.sub}</p>
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
      <section className="section tint">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">{protocol.cabin.title}</p>
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
      <PageHero eyebrow="Hakkımızda" title="Kore biyoteknolojisi ile çatlak bakımına bütüncül bir yaklaşım" crumbs={[{ label: 'Hakkımızda' }]} image={img('ev-tall')} />
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
        <img src={img('day-night')} alt="" loading="lazy" data-parallax="6" />
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
