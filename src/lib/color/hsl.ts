// Small, dependency-free HSL <-> hex conversion shared by paletteGenerator.ts
// and contrast.ts. No chroma.js/colord dependency — this project keeps
// dependencies minimal and these conversions are ~20 lines each.

export interface Hsl {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim()
  return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim())
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  return { r, g, b }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex)
  const rN = r / 255
  const gN = g / 255
  const bN = b / 255
  const max = Math.max(rN, gN, bN)
  const min = Math.min(rN, gN, bN)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rN) h = 60 * (((gN - bN) / delta) % 6)
    else if (max === gN) h = 60 * ((bN - rN) / delta + 2)
    else h = 60 * ((rN - gN) / delta + 4)
  }
  if (h < 0) h += 360

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hN = ((h % 360) + 360) % 360
  const sN = Math.max(0, Math.min(100, s)) / 100
  const lN = Math.max(0, Math.min(100, l)) / 100

  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((hN / 60) % 2) - 1))
  const m = lN - c / 2

  let rP = 0
  let gP = 0
  let bP = 0
  if (hN < 60) [rP, gP, bP] = [c, x, 0]
  else if (hN < 120) [rP, gP, bP] = [x, c, 0]
  else if (hN < 180) [rP, gP, bP] = [0, c, x]
  else if (hN < 240) [rP, gP, bP] = [0, x, c]
  else if (hN < 300) [rP, gP, bP] = [x, 0, c]
  else [rP, gP, bP] = [c, 0, x]

  return rgbToHex((rP + m) * 255, (gP + m) * 255, (bP + m) * 255)
}

export function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
