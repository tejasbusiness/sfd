import type { QuotaStatus } from '../../lib/ai/websitePromptGenerator'

interface QuotaBadgeProps {
  quota: QuotaStatus | null
}

function QuotaBadge({ quota }: QuotaBadgeProps) {
  if (!quota) return null

  const exhausted = quota.remaining <= 0

  return (
    <p className={`font-mono-label text-[10px] uppercase ${exhausted ? 'text-studio-ink' : 'text-studio-ink-soft'}`}>
      {exhausted
        ? `0 of ${quota.limit} prompts remaining — resets ${new Date(quota.resetsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `${quota.remaining} of ${quota.limit} prompts remaining this month`}
    </p>
  )
}

export default QuotaBadge
