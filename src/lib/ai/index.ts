export type AiProvider = 'gemini' | 'openai' | 'claude'

export interface ChatContext {
  leadId?: string
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponse {
  reply: string
  shouldEscalate: boolean
}

/**
 * Single entry point for all chatbot logic (Rule B). Dispatches to the
 * Gemini/OpenAI/Claude adapter based on the active provider in admin
 * settings, with fallback-provider support. UI must never import a provider
 * SDK directly — this is the only allowed import surface.
 */
export async function getChatResponse(
  _provider: AiProvider,
  _prompt: string,
  _context: ChatContext,
): Promise<ChatResponse> {
  throw new Error(
    'getChatResponse is not configured yet — provider adapters land in Phase 5 (docs/10).',
  )
}
