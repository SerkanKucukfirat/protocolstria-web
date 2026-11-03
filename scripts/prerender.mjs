// GitHub Pages SPA yönlendirmesi yapmaz: her rota için index.html'in bir kopyası klasörüne konur.
import { cpSync, mkdirSync, readFileSync } from 'node:fs'

const products = JSON.parse(readFileSync('src/data/products.json', 'utf8'))
const routes = ['kabin-urunleri', 'ev-devam-urunleri', 'teknoloji', 'uygulama', 'hakkimizda', 'iletisim', 'politikalar', 'politikalarimiz', ...products.map(p => `urunler/${p.slug}`)]
for (const r of routes) {
  mkdirSync(`dist/${r}`, { recursive: true })
  cpSync('dist/index.html', `dist/${r}/index.html`)
}
cpSync('dist/index.html', 'dist/404.html')
console.log(`prerendered ${routes.length} routes`)
