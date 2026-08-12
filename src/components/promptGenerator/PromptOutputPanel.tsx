import { useState } from 'react'
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

  async function handleCopy() {
    if (!prompt) return
    const ok = await copyToClipboard(prompt)
    setCopyState(ok ? 'copied' : 'failed')
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-7 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Your Prompt</h2>
        {prompt && !isGenerating && (
          <Button type="button" variant="secondary" size="md" onClick={handleCopy}>
            {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy Prompt'}
          </Button>
        )}
      </div>

      <div className="mt-4">
        {isGenerating && (
          <div className="flex items-center gap-3 text-ink-soft">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-ink-soft/30 border-t-teal"
            />
            <p className="text-sm">Generating your prompt…</p>
          </div>
        )}

        {!isGenerating && error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}

        {!isGenerating && !error && !prompt && (
          <p className="text-sm italic text-ink-soft">
            Fill out the form and click "Generate My Website Prompt" to see your prompt here.
          </p>
        )}

        {!isGenerating && !error && prompt && (
          <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-ink/10 bg-cream-dim p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{prompt}</p>
          </div>
        )}
      </div>

      {prompt && !isGenerating && (
        <p className="mt-3 text-xs text-ink-soft">
          Copy this prompt and paste it, together with any reference image you uploaded, into Claude, ChatGPT, or
          another AI coding tool.
        </p>
      )}

      <div className="mt-5 border-t border-ink/10 pt-4">
        <QuotaBadge quota={quota} />
      </div>
    </div>
  )
}

export default PromptOutputPanel
