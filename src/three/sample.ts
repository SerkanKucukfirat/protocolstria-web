// Ağaç maskesinden (beyaz ağaç, saydam zemin) rastgele noktalar örnekler. three.js'e bağlı değil.
export async function sampleTree(url: string, count: number) {
  // Safari'de img.decode() zaman zaman sebepsiz reddedilir; onload ile yükle, decode'u yalnız dene
  const img = new Image()
  img.decoding = 'async'
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('tree mask'))
    img.src = url
  })
  try {
    await img.decode()
  } catch {
    /* zaten yüklendi */
  }
  const S = 480
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, S, S)
  const data = g.getImageData(0, 0, S, S).data
  const pts: [number, number][] = []
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const a = data[(y * S + x) * 4 + 3]
      // dış çember çizgisini at: yalnız ağacın kendisi
      const dx = x / S - 0.5
      const dy = y / S - 0.5
      if (a > 120 && Math.hypot(dx, dy) < 0.47) pts.push([dx, -dy])
    }
  if (!pts.length) throw new Error('empty tree mask')
  const out: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const p = pts[(Math.random() * pts.length) | 0]
    out.push([p[0] + (Math.random() - 0.5) / S, p[1] + (Math.random() - 0.5) / S])
  }
  return out
}

export const PALETTE = ['#2f8a64', '#3fae7f', '#9fd8bd', '#cdeedd', '#ffffff', '#1f6b4f', '#7fd1ad', '#f5c96a']
export const WEIGHTS = [0.22, 0.18, 0.2, 0.12, 0.08, 0.12, 0.05, 0.03]
export function pickIndex(r: number) {
  let acc = 0
  for (let i = 0; i < WEIGHTS.length; i++) {
    acc += WEIGHTS[i]
    if (r <= acc) return i
  }
  return 0
}
