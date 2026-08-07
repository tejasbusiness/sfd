import { supabase } from './client'

const COMPANY_ASSETS_BUCKET = 'company-assets'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function uploadCompanyAsset(file: File, kind: 'logo' | 'favicon'): Promise<string> {
  const path = `${kind}/${Date.now()}-${sanitizeFilename(file.name)}`
  const { error } = await supabase.storage.from(COMPANY_ASSETS_BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export function getCompanyAssetPublicUrl(path: string): string {
  const { data } = supabase.storage.from(COMPANY_ASSETS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
