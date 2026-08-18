import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { supahubLabelClasses } from '../ui/Input'
import ColorField from './ColorField'
import {
  generatePalette,
  nextStrategy,
  STRATEGY_ORDER,
  type Palette,
  type PaletteStrategy,
} from '../../lib/color/paletteGenerator'
import { contrastRatio, WCAG_AA_THRESHOLD } from '../../lib/color/contrast'

interface ColorPaletteEditorProps {
  palette: Palette
  onChange: (palette: Palette) => void
}

const FIELD_KEYS = ['primary', 'secondary', 'text', 'accent', 'button'] as const
type FieldKey = (typeof FIELD_KEYS)[number]
const FIELD_LABELS: Record<FieldKey, string> = {
  primary: 'Primary Color',
  secondary: 'Secondary Color',
  text: 'Text Color',
  accent: 'Accent Color',
  button: 'Button Color',
}

function lowContrastWarning(ratio: number): string | undefined {
  if (ratio >= WCAG_AA_THRESHOLD) return undefined
  return `Low contrast — text may be difficult to read (ratio ${ratio.toFixed(1)}, needs ${WCAG_AA_THRESHOLD}).`
}

function ColorPaletteEditor({ palette, onChange }: ColorPaletteEditorProps) {
  const [lastStrategy, setLastStrategy] = useState<PaletteStrategy>(STRATEGY_ORDER[0])

  function handlePrimaryChange(hex: string) {
    const strategy = STRATEGY_ORDER[0]
    setLastStrategy(strategy)
    onChange(generatePalette(hex, strategy))
  }

  function handleFieldChange(key: FieldKey, hex: string) {
    if (key === 'primary') {
      handlePrimaryChange(hex)
      return
    }
    onChange({ ...palette, [key]: hex })
  }

  function handleRegenerate() {
    const strategy = nextStrategy(lastStrategy)
    setLastStrategy(strategy)
    onChange(generatePalette(palette.primary, strategy))
  }

  // Text-on-Primary (a realistic section-background usage) and Button-label
  // contrast (checked against both white and Text -- warn only if both fail,
  // since one passing label color means there's no real problem).
  const textOnPrimaryRatio = contrastRatio(palette.text, palette.primary)
  const buttonVsWhite = contrastRatio('#FFFFFF', palette.button)
  const buttonVsText = contrastRatio(palette.text, palette.button)
  const buttonWarning = buttonVsWhite < WCAG_AA_THRESHOLD && buttonVsText < WCAG_AA_THRESHOLD
    ? lowContrastWarning(Math.max(buttonVsWhite, buttonVsText))
    : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={supahubLabelClasses}>Brand Color Palette</p>
        <Button type="button" variant="supahub-ghost" size="md" onClick={handleRegenerate}>
          Regenerate Palette
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELD_KEYS.map((key) => (
          <ColorField
            key={key}
            id={`color-${key}`}
            label={FIELD_LABELS[key]}
            value={palette[key]}
            onChange={(hex) => handleFieldChange(key, hex)}
            warning={
              key === 'text' ? lowContrastWarning(textOnPrimaryRatio) : key === 'button' ? buttonWarning : undefined
            }
          />
        ))}
      </div>

      {/* Palette preview -- five adjoining swatches so all colors are seen
          together at a glance, updates immediately on any change. */}
      <div className="overflow-hidden rounded-lg border border-supahub-mist">
        <div className="flex h-16">
          {FIELD_KEYS.map((key) => (
            <motion.div
              key={key}
              className="flex flex-1 items-end p-2"
              animate={{ backgroundColor: palette[key] }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="font-mono-label truncate text-[9px] uppercase"
                style={{ color: key === 'text' ? palette.primary : '#ffffff', mixBlendMode: 'difference' }}
              >
                {palette[key]}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="flex bg-supahub-fog">
          {FIELD_KEYS.map((key) => (
            <div key={key} className="flex-1 px-2 py-1.5 text-center">
              <span className="font-mono-label text-[9px] uppercase text-supahub-slate">{FIELD_LABELS[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorPaletteEditor
