import { PALETTE, pickIndex, sampleTree } from './sample'
import type { TreeHandle, TreeOptions } from './tree'

// WebGL çalışmadığında aynı parçacıklı ağaç, sıradan 2D canvas ile çizilir.
// Açılışta buluttan toplanır, hafifçe salınır, imleç parçacıkları iter, kaydırmada savrulur.
// Yerleşim 3D sahneyle aynıdır; böylece geçişte ağaç yerinden oynamaz.

const TREE = 2.75 // 3D sahnedeki ölçek (dünya birimi)

export async function createTree2D(canvas: HTMLCanvasElement, opts: TreeOptions & { assembled?: boolean }): Promise<TreeHandle> {
  const COUNT = opts.mobile ? 2600 : 4800
  const AMBIENT = opts.mobile ? 160 : 320
  const pts = await sampleTree(`${opts.base}img/tree.png`, COUNT)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')

  const N = COUNT + AMBIENT
  const tx = new Float32Array(N) // hedef (ağaç birimi, -0.5..0.5)
  const ty = new Float32Array(N)
  const tz = new Float32Array(N)
  const fx = new Float32Array(N) // başlangıç bulutu
  const fy = new Float32Array(N)
  const size = new Float32Array(N)
  const seed = new Float32Array(N)
  const col = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    if (i < COUNT) {
      const [x, y] = pts[i]
      const crown = y > -0.05 ? Math.sqrt(Math.max(0, 0.2 - (x * x + (y - 0.12) ** 2))) : 0.04
      tx[i] = x
      ty[i] = y
      tz[i] = (Math.random() * 2 - 1) * crown * 0.35
      size[i] = 1.3 + Math.random() * 1.9
    } else {
      const a = Math.random() * Math.PI * 2
      const r = 0.75 + Math.random() * 1.3
      tx[i] = Math.cos(a) * r * 1.3
      ty[i] = (Math.random() - 0.5) * 2
      tz[i] = 0
      size[i] = 0.9 + Math.random() * 1.2
    }
    const fa = Math.random() * Math.PI * 2
    const fr = 1.1 + Math.random() * 1.8
    fx[i] = Math.cos(fa) * fr
    fy[i] = (Math.random() - 0.5) * 2.6
    seed[i] = Math.random()
    col[i] = pickIndex(Math.random())
  }
  // renk başına tek çizim çağrısı için sırala
  const byColor: number[][] = PALETTE.map(() => [])
  for (let i = 0; i < N; i++) byColor[col[i]].push(i)

  let dpr = 1
  let W = 0
  let cx = 0
  let cy = 0
  let s = 1 // ağaç biriminin piksel karşılığı
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.25)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    W = w
    const a = w / h
    // 3D kamera: fov 35°, z 6 (dar ekranda 7.2)
    const z = a < 0.9 ? 7.2 : 6
    const visH = 2 * z * Math.tan((35 / 2) * (Math.PI / 180))
    s = Math.min((TREE * h) / visH, (w * 0.98) / 0.94)
    cx = a > 1.15 ? w * 0.73 : w / 2
    cy = a < 0.9 ? h * 0.3 : h * 0.5
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  let mx = -1e4
  let my = -1e4
  let tmx = -1e4
  let tmy = -1e4
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    tmx = e.clientX - r.left
    tmy = e.clientY - r.top
  }
  const onLeave = () => {
    tmx = tmy = -1e4
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(canvas)

  let progress = 0
  let smooth = 0
  let assemble = opts.reduced || opts.assembled ? 1 : 0
  let raf = 0
  let dead = false
  const t0 = performance.now()
  let last = t0
  const tick = (now: number) => {
    if (dead) return
    raf = requestAnimationFrame(tick)
    if (!visible || document.hidden || !W) return
    // yavaş cihazda da açılış gerçek zamanda tamamlansın
    const dt = Math.min((now - last) / 1000, 0.25)
    last = now
    const t = opts.reduced ? 0 : (now - t0) / 1000
    if (assemble < 1) assemble = Math.min(1, assemble + dt / 2.6)
    smooth += (progress - smooth) * 0.08
    mx += (tmx - mx) * 0.15
    my += (tmy - my) * 0.15
    const scatter = smooth * 1.4
    const rot = Math.sin(t * 0.18) * 0.16
    const cr = Math.cos(rot)
    const sr = Math.sin(rot)
    const pushR = 0.2 * s
    const pushD = 0.116 * s

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    for (let c = 0; c < PALETTE.length; c++) {
      const list = byColor[c]
      if (!list.length) continue
      ctx.fillStyle = PALETTE[c]
      // iki parlaklık katmanı: titreşim için yarısı daha soluk
      for (let layer = 0; layer < 2; layer++) {
        ctx.globalAlpha = (layer ? 0.55 : 0.95) * (1 - scatter * 0.55)
        ctx.beginPath()
        for (let k = layer; k < list.length; k += 2) {
          const i = list[k]
          const sd = seed[i]
          let kk = Math.min(1, Math.max(0, assemble * 1.6 - sd * 0.6))
          kk = kk * kk * (3 - 2 * kk)
          let x = fx[i] + (tx[i] - fx[i]) * kk
          let y = fy[i] + (ty[i] - fy[i]) * kk
          const z = tz[i]
          x += Math.sin(t * 0.9 + sd * 40) * 0.0045
          y += Math.cos(t * 0.7 + sd * 31) * 0.0045
          // y ekseni etrafında hafif dönüş
          const xr = x * cr + z * sr
          // kaydırmada merkezden dışa savrulma
          const len = Math.hypot(tx[i], ty[i]) + 1e-4
          const f = scatter * (0.22 + sd * 0.8)
          let px = cx + (xr + (tx[i] / len) * f) * s
          let py = cy - (y + (ty[i] / len) * f + scatter * sd * 0.3) * s
          const dx = px - mx
          const dy = py - my
          const d = Math.hypot(dx, dy)
          if (d < pushR) {
            const u = 1 - d / pushR
            const p = u * u * (3 - 2 * u) * pushD
            px += (dx / (d + 1e-3)) * p
            py += (dy / (d + 1e-3)) * p
          }
          const r = size[i]
          const a = sd * 6.2831 + t * (sd - 0.5) * 0.6
          const ca = Math.cos(a) * r
          const sa = Math.sin(a) * r
          // küçük üçgen
          ctx.moveTo(px + ca, py + sa)
          ctx.lineTo(px - 0.5 * ca - 0.866 * sa, py - 0.5 * sa + 0.866 * ca)
          ctx.lineTo(px - 0.5 * ca + 0.866 * sa, py - 0.5 * sa - 0.866 * ca)
        }
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
  raf = requestAnimationFrame(tick)

  return {
    setProgress: p => (progress = p),
    dispose: () => {
      dead = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('pointerleave', onLeave)
      ro.disconnect()
      io.disconnect()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}
