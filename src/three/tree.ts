import * as THREE from 'three'
import { PALETTE, pickIndex, sampleTree } from './sample'

// Ana sayfa imza görseli: Protocol Stria logosundaki ağaç, binlerce küçük üçgen parçacıktan oluşur.
// Parçacıklar açılışta dağınık bir buluttan ağaca toplanır, imlecin çevresinde dağılır, kaydırmada savrulur.
// Tek bir Points nesnesi ve küçük bir shader: GPU'yu yormaz.

export type TreeOptions = { base: string; reduced: boolean; mobile: boolean }
export type TreeHandle = { setProgress: (p: number) => void; dispose: () => void }
export type TreeCallbacks = { onLost?: () => void }

function pickColor(r: number) {
  return new THREE.Color(PALETTE[pickIndex(r)])
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uAssemble;
  uniform float uScatter;
  uniform vec3 uMouse;
  uniform float uPixel;
  attribute vec3 aTarget;
  attribute vec3 aFrom;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vRot;
  varying float vAlpha;
  void main() {
    float t = uTime;
    // açılış: buluttan ağaca (her parçacık biraz farklı zamanda)
    float k = clamp((uAssemble * 1.6) - aSeed * 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(aFrom, aTarget, k);
    // canlı salınım: yapraklar hafifçe titreşir
    p.x += sin(t * 0.9 + aSeed * 40.0) * 0.012;
    p.y += cos(t * 0.7 + aSeed * 31.0) * 0.012;
    p.z += sin(t * 0.5 + aSeed * 17.0) * 0.03;
    // kaydırma: parçacıklar merkezden dışa savrulur
    vec3 dir = normalize(aTarget + vec3(0.0001, 0.0, 0.0001));
    p += dir * uScatter * (0.6 + aSeed * 2.2) + vec3(0.0, uScatter * aSeed * 0.8, 0.0);
    // imleç: yakındaki parçacıklar itilir
    vec3 d = p - uMouse;
    float dist = length(d.xy);
    float push = smoothstep(0.55, 0.0, dist) * 0.32;
    p.xy += normalize(d.xy + 0.0001) * push;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (5.0 / -mv.z);
    vColor = aColor;
    vRot = aSeed * 6.2831 + t * (aSeed - 0.5) * 0.6;
    vAlpha = (0.7 + 0.3 * sin(t * 1.3 + aSeed * 50.0)) * (1.0 - uScatter * 0.55);
  }
`

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vRot;
  varying float vAlpha;
  // ince kenarlı üçgen
  float tri(vec2 p) {
    const float k = 1.7320508;
    p.x = abs(p.x) - 1.0;
    p.y = p.y + 1.0 / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0, 0.0);
    return -length(p) * sign(p.y);
  }
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float c = cos(vRot), s = sin(vRot);
    uv = mat2(c, -s, s, c) * uv;
    float d = tri(uv * 1.35);
    float edge = 1.0 - smoothstep(0.0, 0.12, abs(d + 0.06));
    float fill = (1.0 - smoothstep(-0.02, 0.04, d)) * 0.6;
    float a = max(edge, fill) * vAlpha;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

export async function createTree(canvas: HTMLCanvasElement, opts: TreeOptions, cb: TreeCallbacks = {}): Promise<TreeHandle> {
  const COUNT = opts.mobile ? 9000 : 18000
  const AMBIENT = opts.mobile ? 400 : 900
  const pts = await sampleTree(`${opts.base}img/tree.png`, COUNT)

  const dpr = Math.min(window.devicePixelRatio, opts.mobile ? 1.5 : 1.25)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
  camera.position.set(0, 0, 6)

  const N = COUNT + AMBIENT
  const target = new Float32Array(N * 3)
  const from = new Float32Array(N * 3)
  const color = new Float32Array(N * 3)
  const size = new Float32Array(N)
  const seed = new Float32Array(N)
  const SCALE = 2.75
  for (let i = 0; i < N; i++) {
    const r = Math.random()
    if (i < COUNT) {
      const [x, y] = pts[i]
      // derinlik: tacı yuvarlak bir hacim gibi, gövdeyi ince tut
      const crown = y > -0.05 ? Math.sqrt(Math.max(0, 0.2 - (x * x + (y - 0.12) ** 2))) : 0.04
      target.set([x * SCALE, y * SCALE, (Math.random() * 2 - 1) * crown * SCALE * 0.35], i * 3)
      size[i] = 0.05 + Math.random() * 0.07
    } else {
      // çevrede dağınık atmosfer parçacıkları
      const a = Math.random() * Math.PI * 2
      const rad = 2.2 + Math.random() * 4.5
      target.set([Math.cos(a) * rad * 1.4, (Math.random() - 0.5) * 6, Math.sin(a) * rad - 2], i * 3)
      size[i] = 0.03 + Math.random() * 0.04
    }
    // başlangıç bulutu
    const fa = Math.random() * Math.PI * 2
    const fr = 3 + Math.random() * 5
    from.set([Math.cos(fa) * fr, (Math.random() - 0.5) * 7, Math.sin(fa) * fr - 1], i * 3)
    const col = pickColor(r)
    color.set([col.r, col.g, col.b], i * 3)
    seed[i] = Math.random()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(target, 3))
  geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
  geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
  geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const uniforms = {
    uTime: { value: 0 },
    uAssemble: { value: opts.reduced ? 1 : 0 },
    uScatter: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uPixel: { value: 0 },
  }
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  const group = new THREE.Group()
  group.add(points)
  scene.add(group)

  let progress = 0
  let smooth = 0
  let assemble = opts.reduced ? 1 : 0
  const mouseNdc = new THREE.Vector2(9, 9)
  const mouseTarget = new THREE.Vector2(9, 9)
  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const hit = new THREE.Vector3()
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    mouseTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const onLeave = () => mouseTarget.set(9, 9)
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // dar ekranda ağacı ortala ve sığdır; genişte metnin sağına yerleştir
    const a = w / h
    camera.position.z = a < 0.9 ? 7.2 : 6
    // görünen alanın genişliği: ağacı geniş ekranda sağ yarının ortasına koy
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    group.position.x = a > 1.15 ? visH * a * 0.23 : 0
    group.position.y = a < 0.9 ? visH * 0.2 : 0
    uniforms.uPixel.value = h * dpr * 0.06
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

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
  let last = 0
  const tick = () => {
    if (lost) return
    raf = requestAnimationFrame(tick)
    if (!visible || document.hidden) return
    const t = clock.getElapsedTime()
    const dt = Math.min(t - last, 0.05)
    last = t
    if (assemble < 1) assemble = Math.min(1, assemble + dt / 2.6)
    smooth += (progress - smooth) * 0.08
    mouseNdc.lerp(mouseTarget, 0.12)
    ray.setFromCamera(mouseNdc, camera)
    if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit).sub(group.position)
    uniforms.uTime.value = opts.reduced ? 0 : t
    uniforms.uAssemble.value = assemble
    uniforms.uScatter.value = smooth * 1.4
    group.rotation.y = opts.reduced ? 0 : Math.sin(t * 0.18) * 0.16 + mouseNdc.x * 0.06 * (Math.abs(mouseNdc.x) < 2 ? 1 : 0)
    group.rotation.x = smooth * 0.25
    renderer.render(scene, camera)
  }
  tick()

  return {
    setProgress: p => (progress = p),
    dispose: () => {
      lost = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('webglcontextlost', onLost)
      ro.disconnect()
      io.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      // bağlamı hemen bırak: sayfalar arasında gidip gelince tarayıcının bağlam sınırına takılmasın
      renderer.forceContextLoss()
    },
  }
}
