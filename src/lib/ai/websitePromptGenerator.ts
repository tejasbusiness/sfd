// Client-side entry point for the Website Prompt Generator. Following Rule B
// (docs/11-architecture-scalability.md): the UI never imports a provider SDK
// directly, only this file, which only talks to the generate-website-prompt
// edge function. Provider adapters (Gemini/OpenAI/Claude) live exclusively
// server-side in that function. src/lib/ai/index.ts is intentionally
// untouched -- it's shaped for the chatbot's multi-turn conversation, a
// different concern from this one-shot structured generation.
import { supabase } from '../supabase/client'
import { getOrCreateDeviceId } from '../color/deviceId'

export type WebsiteType = 'single' | 'multi'

export interface PromptGeneratorPalette {
  primary: string
  secondary: string
  text: string
  accent: string
  button: string
}

export interface PromptGeneratorFormData {
  yourName?: string
  businessName: string
  services: string
  businessDescription: string
  phone?: string
  email?: string
  serviceArea?: string
  websiteUrl?: string
  websiteType: WebsiteType
  sectionsOrPages: string
  palette: PromptGeneratorPalette
  referenceImage?: { dataUrl: string; mimeType: string } | null
}

export interface PromptGeneratorResult {
  prompt: string
  provider: 'gemini' | 'openai' | 'claude'
  remaining: number
}

export interface QuotaStatus {
  remaining: number
  limit: number
  resetsAt: string
}

export class PromptGeneratorError extends Error {}

async function invoke<T>(
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('generate-website-prompt', {
    method,
    body,
    headers: { 'X-Device-Id': getOrCreateDeviceId() },
  })

  if (error) {
    // supabase-js wraps non-2xx responses in a generic error; the actual
    // message from our edge function's jsonError() is in error.context body
    // -- same unwrap pattern as src/lib/booking/api.ts.
    const context = (error as { context?: Response }).context
    if (context) {
      try {
        const responseBody = await context.clone().json()
        throw new PromptGeneratorError(responseBody.error ?? error.message)
      } catch (parseErr) {
        if (parseErr instanceof PromptGeneratorError) throw parseErr
        // fall through to generic message below
      }
    }
    throw new PromptGeneratorError(error.message)
  }

  return data as T
}

export function fetchQuotaStatus(): Promise<QuotaStatus> {
  return invoke<QuotaStatus>('GET')
}

export function generateWebsitePrompt(data: PromptGeneratorFormData): Promise<PromptGeneratorResult> {
  return invoke<PromptGeneratorResult>('POST', data as unknown as Record<string, unknown>)
}
