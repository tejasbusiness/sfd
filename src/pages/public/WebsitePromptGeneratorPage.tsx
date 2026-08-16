import { useEffect, useState } from 'react'
import PublicLayout from '../../components/marketing/PublicLayout'
import PageHeader from '../../components/ui/PageHeader'
import PromptGeneratorForm, {
  fileToDataUrl,
  type PromptGeneratorFormValues,
} from '../../components/promptGenerator/PromptGeneratorForm'
import PromptOutputPanel from '../../components/promptGenerator/PromptOutputPanel'
import {
  fetchQuotaStatus,
  generateWebsitePrompt,
  PromptGeneratorError,
  type QuotaStatus,
} from '../../lib/ai/websitePromptGenerator'
import type { Palette } from '../../lib/color/paletteGenerator'

function WebsitePromptGeneratorPage() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaStatus | null>(null)

  useEffect(() => {
    fetchQuotaStatus()
      .then(setQuota)
      .catch(() => {
        // Non-fatal — the badge just stays hidden if the initial check fails;
        // the real enforcement happens server-side on submit regardless.
      })
  }, [])

  async function handleSubmit(values: PromptGeneratorFormValues, palette: Palette, referenceImage: File | null) {
    if (isGenerating) return // guards against a duplicate submit consuming two requests

    setIsGenerating(true)
    setError(null)

    try {
      const referenceImagePayload = referenceImage
        ? { dataUrl: await fileToDataUrl(referenceImage), mimeType: referenceImage.type }
        : null

      const result = await generateWebsitePrompt({
        yourName: values.yourName || undefined,
        businessName: values.businessName,
        services: values.services,
        businessDescription: values.businessDescription,
        phone: values.phone || undefined,
        email: values.email || undefined,
        serviceArea: values.serviceArea || undefined,
        websiteUrl: values.websiteUrl || undefined,
        websiteType: values.websiteType,
        sectionsOrPages: values.sectionsOrPages,
        palette,
        referenceImage: referenceImagePayload,
      })

      setPrompt(result.prompt)
      setQuota((prev) => (prev ? { ...prev, remaining: result.remaining } : prev))
    } catch (err) {
      if (err instanceof PromptGeneratorError) {
        setError(err.message)
      } else {
        setError("We couldn't generate your prompt. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Free Tool"
        title="Website Prompt Generator"
        description="Answer a few questions about your business and get a ready-to-use AI prompt for building your website."
        variant="clinical"
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-2 lg:items-start">
        <PromptGeneratorForm isGenerating={isGenerating} quota={quota} onSubmit={handleSubmit} />
        <div className="lg:sticky lg:top-24">
          <PromptOutputPanel prompt={prompt} isGenerating={isGenerating} error={error} quota={quota} />
        </div>
      </div>
    </PublicLayout>
  )
}

export default WebsitePromptGeneratorPage
