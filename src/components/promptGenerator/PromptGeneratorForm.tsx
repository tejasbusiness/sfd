import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { supahubInputClasses, supahubLabelClasses } from '../ui/Input'
import { Select } from '../ui/Select'
import ColorPaletteEditor from './ColorPaletteEditor'
import ReferenceImageUpload from './ReferenceImageUpload'
import { generatePalette, STRATEGY_ORDER } from '../../lib/color/paletteGenerator'
import type { Palette } from '../../lib/color/paletteGenerator'
import type { QuotaStatus, WebsiteType } from '../../lib/ai/websitePromptGenerator'

const DEFAULT_PRIMARY = '#2F6E62'
const MAX_PAGES = 5

export interface PromptGeneratorFormValues {
  yourName: string
  businessName: string
  services: string
  businessDescription: string
  phone: string
  email: string
  serviceArea: string
  websiteUrl: string
  websiteType: WebsiteType
  sectionsOrPages: string
}

const EMPTY_VALUES: PromptGeneratorFormValues = {
  yourName: '',
  businessName: '',
  services: '',
  businessDescription: '',
  phone: '',
  email: '',
  serviceArea: '',
  websiteUrl: '',
  websiteType: 'single',
  sectionsOrPages: '',
}

function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

interface PromptGeneratorFormProps {
  isGenerating: boolean
  quota: QuotaStatus | null
  onSubmit: (values: PromptGeneratorFormValues, palette: Palette, referenceImage: File | null) => void
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function PromptGeneratorForm({ isGenerating, quota, onSubmit }: PromptGeneratorFormProps) {
  const [values, setValues] = useState<PromptGeneratorFormValues>(EMPTY_VALUES)
  const [palette, setPalette] = useState<Palette>(() => generatePalette(DEFAULT_PRIMARY, STRATEGY_ORDER[0]))
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  function updateField<K extends keyof PromptGeneratorFormValues>(key: K, value: PromptGeneratorFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!values.businessName.trim() || !values.services.trim() || !values.businessDescription.trim()) {
      setValidationError('Business Name, Services You Offer, and Describe Your Business are required.')
      return
    }

    const entries = parseCommaSeparated(values.sectionsOrPages)
    if (entries.length === 0) {
      setValidationError(
        values.websiteType === 'single'
          ? 'Please list at least one section for your single-page website.'
          : 'Please list at least one page for your website.',
      )
      return
    }
    if (values.websiteType === 'multi' && entries.length > MAX_PAGES) {
      setValidationError(`Maximum ${MAX_PAGES} pages allowed — you listed ${entries.length}. Please trim your list.`)
      return
    }

    setValidationError(null)
    onSubmit(values, palette, referenceImage)
  }

  const quotaExhausted = quota !== null && quota.remaining <= 0

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-supahub-mist bg-white p-7 sm:p-8">
      <div>
        <h2 className="font-bricolage text-xl font-semibold text-supahub-ink">Tell Us About Your Project</h2>
        <p className="mt-1 text-sm text-supahub-slate">
          The more detail you provide, the better your website will turn out.
        </p>
      </div>

      {validationError && (
        <p role="alert" className="mt-4 text-sm text-supahub-ink">
          {validationError}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="yourName" className={supahubLabelClasses}>
            Your Name
          </label>
          <input
            id="yourName"
            type="text"
            placeholder="e.g. John Doe"
            value={values.yourName}
            onChange={(e) => updateField('yourName', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="businessName" className={supahubLabelClasses}>
            Business Name
          </label>
          <input
            id="businessName"
            type="text"
            required
            placeholder="e.g. Miami Grill House"
            value={values.businessName}
            onChange={(e) => updateField('businessName', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="services" className={supahubLabelClasses}>
            Services You Offer
          </label>
          <input
            id="services"
            type="text"
            required
            placeholder="e.g. Residential plumbing, drain cleaning, water heater repair"
            value={values.services}
            onChange={(e) => updateField('services', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="businessDescription" className={supahubLabelClasses}>
            Describe Your Business
          </label>
          <textarea
            id="businessDescription"
            required
            rows={4}
            placeholder="What does your business do? Who are your customers? What makes you different?"
            value={values.businessDescription}
            onChange={(e) => updateField('businessDescription', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <Select
            id="websiteType"
            label="Website Type"
            variant="supahub"
            value={values.websiteType}
            onChange={(val) => {
              updateField('websiteType', val as WebsiteType)
              updateField('sectionsOrPages', '')
            }}
            options={[
              { value: 'single', label: 'Single Page (scrollable sections)' },
              { value: 'multi', label: `Multiple Pages (up to ${MAX_PAGES})` },
            ]}
          />
          <p className="mt-1.5 text-xs text-supahub-slate">
            {values.websiteType === 'single'
              ? 'One scrollable page with multiple sections, linked from the header navigation.'
              : `A traditional multi-page site (up to ${MAX_PAGES} pages), each linked from the header navigation.`}
          </p>
        </div>

        <div>
          <label htmlFor="sectionsOrPages" className={supahubLabelClasses}>
            {values.websiteType === 'single' ? 'Sections You Want (comma separated)' : 'Pages You Want (comma separated)'}
          </label>
          <input
            id="sectionsOrPages"
            type="text"
            placeholder={
              values.websiteType === 'single'
                ? 'e.g. Home, About, Services, Testimonials, Contact'
                : 'e.g. Home, About, Services, Pricing, Contact'
            }
            value={values.sectionsOrPages}
            onChange={(e) => updateField('sectionsOrPages', e.target.value)}
            className={supahubInputClasses}
          />
          <p className="mt-1.5 text-xs text-supahub-slate">
            {values.websiteType === 'single'
              ? 'List the sections you want on your page, in the order you want them to appear. The header navigation will link to each one.'
              : `List the page names you want (max ${MAX_PAGES}), in the order you want them in the navigation. Each becomes its own page linked from the header.`}
          </p>
        </div>

        <div>
          <label htmlFor="phone" className={supahubLabelClasses}>
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. (305) 555-1234"
            value={values.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className={supahubLabelClasses}>
            Your Email (Not required)
          </label>
          <input
            id="email"
            type="email"
            placeholder="Put a real email if you have one — leave blank otherwise."
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="serviceArea" className={supahubLabelClasses}>
            Service Area or Storefront Address
          </label>
          <input
            id="serviceArea"
            type="text"
            placeholder="e.g. Serving all of Miami-Dade County, or 123 Main St Miami FL"
            value={values.serviceArea}
            onChange={(e) => updateField('serviceArea', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className={supahubLabelClasses}>
            Your Website URL (if you have one)
          </label>
          <input
            id="websiteUrl"
            type="text"
            placeholder="mybusiness.com or just type your business name"
            value={values.websiteUrl}
            onChange={(e) => updateField('websiteUrl', e.target.value)}
            className={supahubInputClasses}
          />
        </div>

        <div className="border-t border-supahub-mist pt-5">
          <ColorPaletteEditor palette={palette} onChange={setPalette} />
        </div>

        <div className="border-t border-supahub-mist pt-5">
          <ReferenceImageUpload file={referenceImage} onChange={setReferenceImage} />
        </div>
      </div>

      {quotaExhausted && (
        <p className="mt-5 text-sm text-supahub-ink">
          You've used all {quota?.limit ?? 15} website prompt generations for this month. Your allowance will reset
          next month.
        </p>
      )}

      <Button type="submit" variant="supahub" size="lg" disabled={isGenerating || quotaExhausted} className="mt-6 w-full">
        {isGenerating ? 'Generating Your Prompt…' : 'Generate My Website Prompt'}
      </Button>
    </form>
  )
}

export default PromptGeneratorForm
export { fileToDataUrl }
