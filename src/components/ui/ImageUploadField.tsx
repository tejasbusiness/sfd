import { useRef, useState } from 'react'
import { Button } from './Button'
import { labelClasses } from './Input'
import { getCompanyAssetPublicUrl, uploadCompanyAsset } from '../../lib/supabase/storageQueries'

interface ImageUploadFieldProps {
  id: string
  label: string
  targetSize: string
  value: string
  onChange: (path: string) => void
  kind: 'logo' | 'favicon'
  accept?: string
}

export function ImageUploadField({
  id,
  label,
  targetSize,
  value,
  onChange,
  kind,
  accept = 'image/png,image/jpeg,image/svg+xml,image/x-icon',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelected(file: File) {
    setUploading(true)
    setError(null)
    try {
      const path = await uploadCompanyAsset(file, kind)
      onChange(path)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label} ({targetSize})
      </label>
      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-ink/15 bg-cream">
          {value ? (
            <img src={getCompanyAssetPublicUrl(value)} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="font-mono-label text-[10px] uppercase text-ink-soft/60">No file</span>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFileSelected(file)
              e.target.value = ''
            }}
          />
          <Button type="button" variant="secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          {error && (
            <p role="alert" className="mt-1 text-sm text-terracotta">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
