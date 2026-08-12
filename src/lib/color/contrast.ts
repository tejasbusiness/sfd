// WCAG 2.1 relative luminance / contrast ratio, used to warn (not block) on
// low-contrast palette combinations. See docs comment in ColorPaletteEditor
// for exactly which pairs are checked and why.
import { hexToRgb } from './hsl'

const WCAG_AA_THRESHOLD = 4.5

function linearizeChannel(c: number): number {
  const cNorm = c / 255
  return cNorm <= 0.03928 ? cNorm / 12.92 : ((cNorm + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const rLin = linearizeChannel(r)
  const gLin = linearizeChannel(g)
  const bLin = linearizeChannel(b)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsWcagAA(hexA: string, hexB: string): boolean {
  return contrastRatio(hexA, hexB) >= WCAG_AA_THRESHOLD
}

export { WCAG_AA_THRESHOLD }
