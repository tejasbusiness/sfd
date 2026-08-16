import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '../ui/Button'
import QuotaBadge from './QuotaBadge'
import { copyToClipboard } from '../../lib/clipboard/copyToClipboard'
import type { QuotaStatus } from '../../lib/ai/websitePromptGenerator'

interface PromptOutputPanelProps {
  prompt: string | null
  isGenerating: boolean
  error: string | null
  quota: QuotaStatus | null
}

function PromptOutputPanel({ prompt, isGenerating, error, quota }: PromptOutputPanelProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const prefersReducedMotion = useReducedMotion()
  const fadeTransition = { duration: prefersReducedMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] as const }

  async function handleCopy() {
    if (!prompt) return
    const ok = await copyToClipboard(prompt)
    setCopyState(ok ? 'copied' : 'failed')
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <div className="rounded-2xl border border-studio-line bg-white p-7 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-sans text-xl font-bold text-studio-ink">Your Prompt</h2>
        {prompt && !isGenerating && (
          <Button type="button" variant="clinical-ghost" size="md" onClick={handleCopy}>
            {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy Prompt'}
          </Button>
        )}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              className="flex items-center gap-3 text-studio-ink-soft"
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-studio-ink-soft/30 border-t-studio-ink"
              />
              <p className="text-sm">Generating your prompt…</p>
            </motion.div>
          )}

          {!isGenerating && error && (
            <motion.p
              key="error"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              className="text-sm text-studio-ink"
            >
              {error}
            </motion.p>
          )}

          {!isGenerating && !error && !prompt && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              className="text-sm italic text-studio-ink-soft"
            >
              Fill out the form and click "Generate My Website Prompt" to see your prompt here.
            </motion.p>
          )}

          {!isGenerating && !error && prompt && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              className="max-h-[70vh] overflow-y-auto rounded-lg border border-studio-line bg-studio-bg-card-soft p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-studio-ink">{prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {prompt && !isGenerating && (
        <p className="mt-3 text-xs text-studio-ink-soft">
          Copy this prompt and paste it, together with any reference image you uploaded, into Claude, ChatGPT, or
          another AI coding tool.
        </p>
      )}

      <div className="mt-5 border-t border-studio-line pt-4">
        <QuotaBadge quota={quota} />
      </div>
    </div>
  )
}

export default PromptOutputPanel
