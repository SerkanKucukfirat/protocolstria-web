import productsJson from './products.json'
import techJson from './tech.json'
import protocolJson from './protocol.json'
import g5Json from './g5.json'
import policiesJson from './policies.json'

export type Line = 'kabin' | 'ev'
export type Product = {
  slug: string
  name: string
  sub: string
  line: Line
  step: string
  routine?: string
  desc: string[]
  actives: [string, string][]
}
export type Step = { n: number; product: string; text: string; title?: string }

export const products = productsJson as Product[]
export const tech = techJson
export const protocol = protocolJson as {
  intro: { title: string; sub: string; text: string[] }
  cabin: { title: string; sub: string; steps: Step[]; note: string }
  home: { title: string; day: { label: string; steps: Step[] }; night: { label: string; steps: Step[] } }
}
export const g5 = g5Json as { title: string; text: string[]; table: { n: number; product: string; how: string; goal: string }[] }
export const policies = policiesJson as { title: string; blocks: { h?: string; p?: string; li?: string }[] }

const BASE = import.meta.env.BASE_URL
export const img = (name: string) => `${BASE}img/${name}.webp`
export const productImg = (slug: string) => img(`p-${slug}`)
export const bySlug = (slug?: string) => products.find(p => p.slug === slug)
export const lineProducts = (line: Line) => products.filter(p => p.line === line)

export const lines: Record<Line, { slug: string; title: string; short: string; lead: string; text: string; banner: string; tall: string }> = {
  kabin: {
    slug: 'kabin-urunleri',
    title: 'Profesyonel Bakım İçin Geliştirilen Kabin Ürünleri',
    short: 'Kabin Ürünleri',
    lead: 'Uzman uygulamalar için geliştirilen Protocol Stria bakım serisi.',
    text: 'Protocol Stria kabin ürünleri, profesyonel uygulama protokolünü desteklemek üzere geliştirilmiş ileri teknoloji formüller içerir. Ürünler, Kore kozmetik üretim teknolojileri kullanılarak üretilmekte olup profesyonel uygulama süreçleri ile uyumlu şekilde geliştirilmiştir.',
    banner: 'kabin-banner',
    tall: 'kabin-tall',
  },
  ev: {
    slug: 'ev-devam-urunleri',
    title: 'Profesyonel Bakımı Destekleyen Ev Devam Ürünleri',
    short: 'Ev Devam Ürünleri',
    lead: 'Profesyonel bakım sürecini destekleyen günlük bakım ürünleri.',
    text: 'Protocol Stria ev devam ürünleri, profesyonel bakım uygulamalarını desteklemek amacıyla geliştirilmiştir. Bakım rutini cildin hazırlanması ile başlar, aktif içeriklerin uygulanması ile devam eder ve son aşamada kullanılan bakım ürünleri ile cildin bakım süreci desteklenir. Düzenli kullanım, profesyonel uygulamaların etkisini destekleyen bütüncül bir bakım yaklaşımı sunar.',
    banner: 'ev-banner',
    tall: 'ev-tall',
  },
}

export const techCards = [
  {
    key: 'prolicell',
    title: 'ProliCell® Teknolojisi',
    text: 'Bitki kök hücrelerinden ilham alınarak geliştirilen ProliCell® teknolojisi, cilt yenilenme süreçlerinin desteklenmesine yardımcı olur.',
  },
  {
    key: 'exosome',
    title: 'Exosome Teknolojisi',
    text: 'Bitki kök hücre kaynaklı exosome yapıları, hücresel iletişimi destekleyerek cilt yenilenme süreçlerine katkı sağlar.',
  },
  {
    key: 'lipozom',
    title: 'EGF & Lipozom Teknolojisi',
    text: 'EGF destekli formüller ve lipozomal taşıyıcı sistem sayesinde aktif içeriklerin cilt tarafından daha dengeli şekilde algılanması desteklenir.',
  },
]

export const appSteps = [
  { title: 'Cilt Hazırlığı', text: 'Uygulama öncesinde cilt, özel temizleme ve hazırlık ürünleri ile bakım sürecine uygun hale getirilir.' },
  { title: 'Isı Aktivasyonu', text: 'Isı etkili formüller kullanılarak mikro dolaşımın desteklenmesi ve cildin uygulamaya hazırlanması hedeflenir.' },
  { title: 'Vakum Uygulaması', text: 'Vakum destekli uygulama ile aktif içeriklerin cilt yüzeyine daha dengeli şekilde yayılması sağlanır.' },
  { title: 'Bakımın Tamamlanması', text: 'Uygulama sonrasında kullanılan bakım ürünleri ile cildin yenilenme sürecinin desteklenmesi amaçlanır.' },
]

export const about = [
  'Protocol Stria, çatlak görünümüne ve cilt dokusunun yeniden yapılanma sürecine odaklanan, Kore laboratuvarlarında üretilen, ileri biyoteknolojik yaklaşımlarla geliştirilmiş profesyonel bir cilt bakım markasıdır.',
  'Markanın yaklaşımının temelinde, çatlak bakımını yalnızca yüzeysel bir uygulama olarak değil; cilt dokusunun bütünlüğünü, elastikiyetini ve yenilenme mekanizmalarını destekleyen çok yönlü bir süreç olarak ele almak yer alır. Bu doğrultuda geliştirilen profesyonel bakım sistemleri, ileri teknoloji ile biyoteknolojik aktifleri bir araya getirir.',
  'Protocol Stria’nın teknolojik altyapısında Lipozom ve Exosome taşıyıcı sistemleri ile EGF destekli formülasyonlar önemli bir yer tutar. Bu sistemler, aktif bileşenlerin stabilitesini ve cilde kontrollü iletimini destekleyen teknolojik bir yaklaşım sunar.',
  'Markanın öne çıkan biyoteknolojik yaklaşımlarından ProliCell® Teknolojisi; Centella Asiatica’nın yenileyici mekanizmalarından ilham alınarak, bitki kök hücreleri ve biyoteknolojik peptit kombinasyonlarıyla geliştirilmiştir. Cildin yenilenme mekanizmalarını desteklemeye odaklanan bu teknoloji; kolajen, elastin ve hyalüronik asit sentezinin desteklenmesine, cilt elastikiyetinin korunmasına ve doku bütünlüğünün güçlendirilmesine katkı sağlamayı amaçlar.',
  'Ventura Şirketi bünyesinde yer alan Protocol Stria, Kore’nin ileri kozmetik teknolojisini; biyoteknolojik aktifler, gelişmiş taşıyıcı sistemler ve profesyonel uygulama teknolojileriyle bir araya getirerek çatlak bakımına bütüncül ve teknoloji odaklı bir yaklaşım sunar.',
]

export const CONTACT = {
  email: 'info@slimwell.com.tr',
  phone: '+90 (216) 369 1 369',
  phoneHref: 'tel:+902163691369',
  whatsapp: '+90 (535) 442 0981',
  whatsappHref: 'https://wa.me/905354420981',
  address: 'İçerenköy Mah. Karaman Çiftlik Yolu Cad., Karakum Sk. No:2, 34750 Ataşehir/İstanbul',
  instagram: 'https://www.instagram.com/protocol.stria/',
  catalog: `${BASE}Protocol-Stria-Katalog.pdf`,
}
