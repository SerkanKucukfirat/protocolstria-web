import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import profiles from './profiles.json'

// Ana sayfa 3D sahnesi: ürün fotoğraflarının kendi silüetinden döndürülmüş (lathe) şişeler,
// arkada parçacıklardan bir DNA sarmalı ve etrafta süzülen lipozom kürecikleri.

type Profile = { aspect: number; r: number[] }
const PROFILES = profiles as Record<string, Profile>

export type HeroOptions = { base: string; reduced: boolean; mobile: boolean }
export type HeroHandle = { setProgress: (p: number) => void; dispose: () => void }
export type HeroCallbacks = { onLost?: () => void }

const MINT = new THREE.Color('#9fd8bd')
const GREEN = new THREE.Color('#2f8a64')

// Şişe: fotoğraftaki silüet satır satır yarıçapa çevrilir; doku önden izdüşümle sarılır (arka yüz aynalanır).
function bottle(slug: string, tex: THREE.Texture, height: number) {
  const p = PROFILES[slug]
  const pts = p.r.map((r, i) => new THREE.Vector2(Math.max(r, 0.0005) * height, (i / (p.r.length - 1)) * height))
  pts.unshift(new THREE.Vector2(0, 0))
  pts.push(new THREE.Vector2(0, height))
  const geo = new THREE.LatheGeometry(pts, 96)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  const w = p.aspect * height
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / height)
  geo.translate(0, -height / 2, 0)
  geo.computeVertexNormals()
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32, metalness: 0, envMapIntensity: 0.7 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = false
  return mesh
}

// Yumuşak parlayan nokta (parçacıklar için)
function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function helix(dot: THREE.Texture, turns: number, per: number) {
  const group = new THREE.Group()
  const n = turns * per
  const pos: number[] = []
  const col: number[] = []
  const rungs: number[] = []
  const R = 0.95
  const H = 7.5
  for (let i = 0; i < n; i++) {
    const t = i / n
    const a = t * turns * Math.PI * 2
    const y = (t - 0.5) * H
    for (const off of [0, Math.PI]) {
      const x = Math.cos(a + off) * R
      const z = Math.sin(a + off) * R
      pos.push(x, y, z)
      const c = off ? MINT : GREEN.clone().lerp(MINT, 0.4)
      col.push(c.r, c.g, c.b)
    }
    if (i % 4 === 0) {
      rungs.push(Math.cos(a) * R, y, Math.sin(a) * R, Math.cos(a + Math.PI) * R, y, Math.sin(a + Math.PI) * R)
      // basamak üzerinde küçük noktalar
      for (let k = 1; k < 6; k++) {
        const f = k / 6
        pos.push(Math.cos(a) * R * (1 - 2 * f), y, Math.sin(a) * R * (1 - 2 * f))
        col.push(MINT.r, MINT.g, MINT.b)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  const pts = new THREE.Points(
    g,
    new THREE.PointsMaterial({ size: 0.085, map: dot, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  const lg = new THREE.BufferGeometry()
  lg.setAttribute('position', new THREE.Float32BufferAttribute(rungs, 3))
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }))
  group.add(pts, lines)
  return group
}

// Kenarı parlayan, ortası saydam küre (fresnel); kırılmalı camdan çok daha hafif
function bubbleMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: MINT }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.6);
        float iri = 0.5 + 0.5*sin(vP.y*9.0 + uTime*0.8);
        vec3 c = mix(uColor, vec3(0.75,0.95,1.0), iri*0.5);
        float hl = pow(max(dot(vN, normalize(vec3(-0.4,0.6,0.7))),0.0), 40.0);
        gl_FragColor = vec4(c*(f*0.9) + vec3(hl*0.8), f*0.85 + hl); }`,
  })
}

// Lipozom: kenarı parlayan küre ve yüzeyinde çift katmanı andıran nokta kabuğu
function liposome(dot: THREE.Texture, r: number, glass: THREE.Material) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), glass))
  const shell: number[] = []
  const N = 260
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const rr = Math.sqrt(1 - y * y)
    const a = i * 2.39996
    for (const s of [1.0, 1.08]) shell.push(Math.cos(a) * rr * r * s, y * r * s, Math.sin(a) * rr * r * s)
  }
  const sg = new THREE.BufferGeometry()
  sg.setAttribute('position', new THREE.Float32BufferAttribute(shell, 3))
  g.add(
    new THREE.Points(sg, new THREE.PointsMaterial({ size: r * 0.07, map: dot, color: MINT, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })),
  )
  return g
}

// Dokular tamamen yüklenmeden sahne döndürülmez: şişeler hiç etiketsiz/boş görünmez.
export async function createHero(canvas: HTMLCanvasElement, opts: HeroOptions, cb: HeroCallbacks = {}): Promise<HeroHandle> {
  const loader = new THREE.TextureLoader()
  const load = async (slug: string) => {
    const t = await loader.loadAsync(`${opts.base}img/t-${slug}.webp`) // kenar renkleri dışa taşırılmış doku
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }
  const [tCenter, tLeft, tRight] = await Promise.all([load('oxyfusion'), load('exotherm-kabin'), load('lipotherm')])

  // Çözünürlük sınırı: büyük ve retina ekranlarda GPU'yu yormamak için
  const wide = window.innerWidth > 1600
  const dpr = Math.min(window.devicePixelRatio, opts.mobile ? 1.25 : wide ? 1 : 1.25)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 1.5, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#06180f', 7, 16)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = env.texture
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
  camera.position.set(0, 0.15, 9)
  scene.add(new THREE.AmbientLight('#cfe9dc', 0.6))
  const key = new THREE.DirectionalLight('#ffffff', 1.6)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.PointLight('#6fe0ad', 16, 12, 2)
  rim.position.set(-3, 1.5, -1.5)
  scene.add(rim)

  const dot = dotTexture()
  const world = new THREE.Group() // geniş ekranda sahne metnin sağına kayar
  const rig = new THREE.Group()
  scene.add(world)
  world.add(rig)
  const center = bottle('oxyfusion', tCenter, 2.9)
  const left = bottle('exotherm-kabin', tLeft, 2.55)
  const right = bottle('lipotherm', tRight, 1.75)
  rig.add(center, left, right)

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 64),
    new THREE.MeshBasicMaterial({ color: '#2f8a64', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  disc.rotation.x = -Math.PI / 2
  disc.position.y = -1.5
  rig.add(disc)

  const dna = helix(dot, 5, opts.mobile ? 40 : 56)
  dna.position.set(0, 0.2, -2.6)
  dna.rotation.z = 0.32
  world.add(dna)

  const glass = bubbleMaterial()
  const spots: [number, number, number, number][] = [
    [-2.9, 1.3, 0.4, 0.34],
    [2.7, 1.55, -0.6, 0.42],
    [-2.3, -1.1, 1.2, 0.22],
    [2.2, -0.9, 1.4, 0.26],
    [3.4, 0.2, -1.8, 0.3],
  ]
  const bubbles: { g: THREE.Group; base: THREE.Vector3; sp: number; ph: number }[] = []
  for (const [x, y, z, r] of opts.mobile ? spots.slice(0, 3) : spots) {
    const g = liposome(dot, r, glass)
    g.position.set(x, y, z)
    world.add(g)
    bubbles.push({ g, base: new THREE.Vector3(x, y, z), sp: 0.3 + ((x * 7) % 1 + 1) * 0.2, ph: x + y })
  }

  const dust: number[] = []
  for (let i = 0; i < (opts.mobile ? 140 : 260); i++) dust.push((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2)
  const dg = new THREE.BufferGeometry()
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3))
  const dustPts = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.035, map: dot, color: '#bfeedd', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }))
  scene.add(dustPts)

  let progress = 0
  let smooth = 0
  let baseZ = 9
  const pointer = new THREE.Vector2()
  const target = new THREE.Vector2()
  const onPointer = (e: PointerEvent) => target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
  window.addEventListener('pointermove', onPointer, { passive: true })

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const a = w / h
    baseZ = a < 0.9 ? 10.5 : 9
    world.position.x = a > 1.15 ? Math.min(1.85, (a - 1.15) * 2.6 + 0.9) : 0
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // Görünmüyorsa (kaydırıldı / sekme arka planda) hiç çizmez
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(canvas)

  let raf = 0
  let lost = false
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    cancelAnimationFrame(raf)
    cb.onLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const clock = new THREE.Clock()
  const tick = () => {
    if (lost) return
    raf = requestAnimationFrame(tick)
    if (!visible || document.hidden) return
    const t = opts.reduced ? 0 : clock.getElapsedTime()
    pointer.lerp(target, 0.05)
    smooth += (progress - smooth) * 0.1
    const sway = Math.sin(t * 0.45) * 0.38
    const bob = (ph: number) => Math.sin(t * 0.8 + ph) * 0.05
    // Şişeler her zaman yerinde: yalnızca hafif salınım, fare takibi ve kaydırmada küçük bir yükselme
    center.rotation.y = sway + pointer.x * 0.35
    left.rotation.y = 0.35 + sway * 0.7 + pointer.x * 0.25
    right.rotation.y = -0.4 + sway * 0.7 + pointer.x * 0.25
    center.position.set(0, -0.05 + bob(0), 0.4)
    left.position.set(-1.25, -0.22 + bob(1.2), -0.35)
    right.position.set(1.3, -0.62 + bob(2.4), -0.1)
    rig.position.y = smooth * 0.8
    rig.rotation.x = pointer.y * 0.06
    dna.rotation.y = t * 0.18
    dustPts.rotation.y = t * 0.015
    for (const b of bubbles) {
      b.g.position.set(b.base.x + Math.sin(t * b.sp + b.ph) * 0.18, b.base.y + Math.cos(t * b.sp * 0.8 + b.ph) * 0.22 + smooth * 0.6, b.base.z)
      b.g.rotation.y = t * 0.2
    }
    glass.uniforms.uTime.value = t
    camera.position.x = pointer.x * 0.25
    camera.position.z = baseZ
    camera.lookAt(0, smooth * 0.4, 0)
    renderer.render(scene, camera)
  }
  tick()

  return {
    setProgress: p => (progress = p),
    dispose: () => {
      cancelAnimationFrame(raf)
      lost = true
      window.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('webglcontextlost', onLost)
      ro.disconnect()
      io.disconnect()
      scene.traverse(o => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach(x => x.dispose())
        else mat?.dispose()
      })
      ;[tCenter, tLeft, tRight, dot].forEach(x => x.dispose())
      env.dispose()
      renderer.dispose()
    },
  }
}
