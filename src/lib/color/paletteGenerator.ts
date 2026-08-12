// Real color-theory palette generation for the Website Prompt Generator.
// Deliberately avoids the purple/violet/indigo cliche that generic
// AI-generated palettes default to — see finalizeColor() below.
import { hexToHsl, hslToHex, wrapHue, clamp, type Hsl } from './hsl'

export interface Palette {
  primary: string
  secondary: string
  text: string
  accent: string
  button: string
}

export type PaletteStrategy =
  | 'complementary'
  | 'splitComplementary'
  | 'analogous'
  | 'monochromaticAccent'
  | 'mutedComplementary'
  | 'warmCoolBalance'

export const STRATEGY_ORDER: PaletteStrategy[] = [
  'complementary',
  'splitComplementary',
  'analogous',
  'monochromaticAccent',
  'mutedComplementary',
  'warmCoolBalance',
]

export function nextStrategy(current: PaletteStrategy): PaletteStrategy {
  const index = STRATEGY_ORDER.indexOf(current)
  return STRATEGY_ORDER[(index + 1) % STRATEGY_ORDER.length]
}

// The purple/violet/magenta/indigo band this tool must not default into on
// its own. A user who deliberately picks a Primary in this range is
// respected (see finalizeColor) — this rule targets the *tool's* defaults.
const PURPLE_BAND_START = 260
const PURPLE_BAND_END = 320

function isInPurpleBand(h: number): boolean {
  return h >= PURPLE_BAND_START && h <= PURPLE_BAND_END
}

// Shared post-processing applied to every generated (non-primary) color:
// clamp saturation to a tasteful 25-65% range, and steer away from the
// purple band unless Primary itself already lives there.
function finalizeColor(hsl: Hsl, primaryWasInBand: boolean): string {
  let h = wrapHue(hsl.h)
  const s = clamp(hsl.s, 25, 65)
  const l = clamp(hsl.l, 15, 85)

  if (!primaryWasInBand && isInPurpleBand(h)) {
    h = wrapHue(h + 40)
  }

  return hslToHex({ h, s, l })
}

function computeText(primary: Hsl): string {
  // Text is meant for body copy on this site's light/cream backgrounds, not
  // literally "on top of Primary" — biased to almost always be legible
  // regardless of strategy. contrast.ts still checks real pairings and can
  // surface a warning, but this generation is bias-corrected to rarely need one.
  if (primary.l > 55) {
    return hslToHex({ h: primary.h, s: 15, l: 12 })
  }
  return hslToHex({ h: primary.h, s: 10, l: 96 })
}

function classifyWarmCool(h: number): 'warm' | 'cool' | 'neutral' {
  if (h <= 60 || h >= 300) return 'warm'
  if (h >= 140 && h <= 260) return 'cool'
  return 'neutral'
}

interface StrategyOutput {
  secondary: Hsl
  accent: Hsl
  button: Hsl
}

function runStrategy(primary: Hsl, strategy: PaletteStrategy): StrategyOutput {
  const { h, s, l } = primary

  switch (strategy) {
    case 'complementary': {
      const compH = h + 180
      return {
        secondary: { h: compH, s: clamp(s, 30, 55), l: clamp(l, 40, 60) },
        accent: { h: compH, s: clamp(s + 15, 30, 65), l: clamp(l - 10, 20, 55) },
        button: { h, s: clamp(s + 10, 30, 65), l: clamp(l, 45, 50) },
      }
    }
    case 'splitComplementary': {
      return {
        secondary: { h: h + 150, s: clamp(s, 30, 55), l: clamp(l, 40, 60) },
        accent: { h: h + 210, s: clamp(s, 30, 55), l: clamp(l, 40, 60) },
        button: { h, s: clamp(s, 30, 65), l: clamp(l, 45, 50) },
      }
    }
    case 'analogous': {
      return {
        secondary: { h: h + 30, s: clamp(s, 25, 45), l: clamp(l, 45, 65) },
        accent: { h: h - 30, s: clamp(s, 25, 45), l: clamp(l, 45, 65) },
        button: { h: h + 15, s: clamp(s + 10, 25, 65), l: clamp(l, 45, 50) },
      }
    }
    case 'monochromaticAccent': {
      return {
        secondary: { h, s: clamp(s - 15, 20, 60), l: clamp(l + 20, 40, 80) },
        // The one deliberate hue jump in this strategy, so the palette
        // still reads as a genuine accent rather than fully monochrome-flat.
        accent: { h: h + 180, s: clamp(s, 35, 55), l: clamp(l, 40, 60) },
        button: { h, s: clamp(s, 25, 65), l: clamp(l - 15, 25, 55) },
      }
    }
    case 'mutedComplementary': {
      const compH = h + 180
      return {
        secondary: { h: compH, s: clamp(s, 15, 30), l: clamp(l, 50, 65) },
        accent: { h: compH, s: clamp(s + 10, 35, 50), l: clamp(l, 45, 55) },
        button: { h, s: clamp(s, 25, 65), l: clamp(l, 40, 50) },
      }
    }
    case 'warmCoolBalance': {
      const category = classifyWarmCool(h)
      // Deliberately crosses the warm/cool divide for Secondary.
      const secondaryH = category === 'warm' ? 200 : category === 'cool' ? 30 : h + 90
      return {
        secondary: { h: secondaryH, s: clamp(s, 30, 50), l: clamp(l, 45, 60) },
        accent: { h: h + 180, s: clamp(s + 5, 40, 60), l: clamp(l, 45, 55) },
        button: { h, s: clamp(s, 30, 65), l: clamp(l, 45, 50) },
      }
    }
  }
}

export function generatePalette(primaryHex: string, strategy: PaletteStrategy): Palette {
  const primary = hexToHsl(primaryHex)
  const primaryWasInBand = isInPurpleBand(wrapHue(primary.h))
  const { secondary, accent, button } = runStrategy(primary, strategy)

  return {
    primary: primaryHex.startsWith('#') ? primaryHex.toUpperCase() : `#${primaryHex.toUpperCase()}`,
    secondary: finalizeColor(secondary, primaryWasInBand),
    text: computeText(primary),
    accent: finalizeColor(accent, primaryWasInBand),
    button: finalizeColor(button, primaryWasInBand),
  }
}
