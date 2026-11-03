import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { g5, img, lineProducts, lines, productImg, protocol, type Line } from '../data'
import { useIntro, useReveal } from '../components/motion'
import { Arrow, CtaBand, PageHero, ProductCard } from '../components/ui'
import { useQuote } from '../components/Layout'

export default function LinePage({ line }: { line: Line }) {
  const page = useRef<HTMLDivElement>(null)
  const quote = useQuote()
  const L = lines[line]
  const list = lineProducts(line)
  useIntro(page, [line])
  useReveal(page, [line])
  useEffect(() => {
    document.title = `${L.short} — Protocol Stria`
  }, [L])
  return (
    <div ref={page} key={line}>
      <PageHero eyebrow={L.short} title={L.title} text={L.text} crumbs={[{ label: L.short }]} image={img(L.tall)} />
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow rv">{list.length} ürün</p>
            <h2 className="display l rv">{line === 'kabin' ? 'Profesyonel uygulama protokolünün formülleri' : 'Profesyonel bakımın evdeki devamı'}</h2>
          </div>
          <div className={`pgrid n${list.length} rv-stagger`}>
            {list.map((p, i) => (
              <ProductCard key={p.slug} p={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="wide-band">
        <img src={img(line === 'kabin' ? 'kabin-banner2' : 'ev-banner2')} alt="" loading="lazy" data-parallax="6" />
      </section>

      {line === 'kabin' ? (
        <>
          <section className="section">
            <div className="wrap">
              <div className="sec-head">
                <p className="eyebrow rv">Protocol Stria kabin uygulama protokolü</p>
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
          <section className="section tint">
            <div className="wrap split">
              <div className="rv-img split-img">
                <img src={img('g5-tall')} alt="G5 destekli profesyonel bakım" loading="lazy" />
              </div>
              <div>
                <p className="eyebrow rv">G5 destekli profesyonel bakım</p>
                <h2 className="display m rv">{g5.title}</h2>
                {g5.text.map(t => (
                  <p className="rv" key={t.slice(0, 20)}>
                    {t}
                  </p>
                ))}
                <Link to="/uygulama#g5" className="link rv">
                  G5 kullanım tablosu <Arrow />
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow rv">{protocol.home.title}</p>
              <h2 className="display l rv">Sabah ve akşam rutini</h2>
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
      )}

      <section className="section crossline">
        <div className="wrap crossline-in rv">
          <img src={img(lines[line === 'kabin' ? 'ev' : 'kabin'].banner)} alt="" loading="lazy" />
          <div>
            <p className="eyebrow">{line === 'kabin' ? 'Bakımı evde sürdürün' : 'Kabinde başlayan bakım'}</p>
            <h2 className="display m">{lines[line === 'kabin' ? 'ev' : 'kabin'].short}</h2>
            <p>{lines[line === 'kabin' ? 'ev' : 'kabin'].lead}</p>
            <Link to={`/${lines[line === 'kabin' ? 'ev' : 'kabin'].slug}`} className="btn">
              İnceleyin <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand title={<>Merkeziniz için <em>teklif alın</em></>} text="Protocol Stria ürünleri ve profesyonel uygulama sistemi hakkında bilgi almak için bize ulaşın." button="İletişim formu" onClick={() => quote(L.short)} />
    </div>
  )
}
