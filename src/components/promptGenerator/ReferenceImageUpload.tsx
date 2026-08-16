import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '../ui/Button'
import { clinicalLabelClasses } from '../ui/Input'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES = 512 * 1024

interface ReferenceImageUploadProps {
  file: File | null
  onChange: (file: File | null) => void
}

/**
 * Optional reference-screenshot upload. Deliberately not a reuse of
 * ImageUploadField (that component is tightly coupled to the company-assets
 * Storage bucket) -- this feature never persists the image to Storage, it
 * only needs client-side preview + validation; the base64 payload is built
 * from `file` at submit time by the parent form.
 */
function ReferenceImageUpload({ file, onChange }: ReferenceImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFileSelect(selected: File | null) {
    setError(null)
    if (!selected) return

    if (!ALLOWED_MIME_TYPES.includes(selected.type)) {
      setError('Please upload a JPG, JPEG, PNG or WEBP image up to 0.5 MB.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('Please upload a JPG, JPEG, PNG or WEBP image up to 0.5 MB.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    onChange(selected)
  }

  function handleRemove() {
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className={clinicalLabelClasses}>Upload reference web page/website design as inspiration (optional)</label>
      <p className="mt-1 text-xs text-studio-ink-soft">JPG, JPEG, PNG or WEBP — up to 0.5 MB.</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        className="hidden"
        id="reference-image-input"
      />

      {!file && (
        <Button type="button" variant="clinical-ghost" size="md" className="mt-2" onClick={() => inputRef.current?.click()}>
          Choose Image
        </Button>
      )}

      <AnimatePresence>
        {file && previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 flex items-center gap-3 rounded-lg border border-studio-line bg-studio-bg-card-soft p-3"
          >
            <img
              src={previewUrl}
              alt="Reference design preview"
              className="h-16 w-16 shrink-0 rounded-md object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-studio-ink">{file.name}</p>
              <p className="text-xs text-studio-ink-soft">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="clinical-ghost" size="md" onClick={() => inputRef.current?.click()}>
                Replace
              </Button>
              <Button type="button" variant="clinical-ghost" size="md" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-studio-ink">
          {error}
        </p>
      )}
    </div>
  )
}

export default ReferenceImageUpload
