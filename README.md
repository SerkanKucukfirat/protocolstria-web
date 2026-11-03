# Protocol Stria — yeni web sitesi

Vite + React + TypeScript, Three.js (ana sayfa 3D sahnesi), GSAP ScrollTrigger, Lenis.

- `src/data/*.json` — katalogdan aktarılan içerik (7 ürün, teknoloji, protokoller, G5, politikalar)
- `src/three/hero.ts` — ana sayfa 3D: ürün fotoğraflarının silüetinden döndürülmüş şişeler, DNA sarmalı, lipozomlar
- `public/img` — ürün kesimleri (`p-*`), 3D dokular (`t-*`), banner ve logolar

```bash
npm ci
npm run dev
BASE_PATH=/protocolstria-web/ npm run build   # GitHub Pages önizlemesi
```
