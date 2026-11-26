// GitHub Pages SPA yönlendirmesi yapmaz: her rota için index.html'in bir kopyası klasörüne konur.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const products = JSON.parse(readFileSync('src/data/products.json', 'utf8'))
const routes = ['kabin-urunleri', 'ev-devam-urunleri', 'teknoloji', 'uygulama', 'hakkimizda', 'iletisim', 'politikalar', 'politikalarimiz', ...products.map(p => `urunler/${p.slug}`)]
for (const r of routes) {
  mkdirSync(`dist/${r}`, { recursive: true })
  cpSync('dist/index.html', `dist/${r}/index.html`)
}
cpSync('dist/index.html', 'dist/404.html')

// Eski WordPress sitesinin (protocolstria.com) yeni sitede karşılığı farklı olan adresleri: yönlendirme sayfası.
const base = process.env.BASE_PATH ?? '/'
const oldUrls = {
  'en': '', 'en/cabinet-products': 'kabin-urunleri', 'en/home-cleaning-products': 'ev-devam-urunleri',
  'en/about-us': 'hakkimizda', 'en/our-policies': 'politikalarimiz', 'yakinda-gelecek': '', 'en/coming-soon': '',
  'shop': '', 'en/store': '',
}
for (const [from, to] of Object.entries(oldUrls)) {
  const url = base + (to ? to + '/' : '')
  mkdirSync(`dist/${from}`, { recursive: true })
  writeFileSync(`dist/${from}/index.html`, `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Protocol Stria</title><meta name="robots" content="noindex"><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${url}"><script>location.replace(${JSON.stringify(url)} + location.search + location.hash)</script></head><body><a href="${url}">Protocol Stria</a></body></html>`)
}
console.log(`prerendered ${routes.length} routes, ${Object.keys(oldUrls).length} redirects`)
