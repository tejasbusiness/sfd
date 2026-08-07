export type Currency = 'INR' | 'USD'

export interface ProcessPaymentParams {
  currency: Currency
  amount: number
  tierId: string
  clientId?: string
  leadId?: string
}

export interface ProcessPaymentResult {
  gateway: 'razorpay' | 'stripe'
  checkoutUrl: string
  gatewaySubscriptionId: string
}

/**
 * Single entry point for all checkout/billing code (Rule A). Dispatches to
 * the Razorpay or Stripe adapter by currency. UI must never import a gateway
 * SDK directly — this is the only allowed import surface.
 */
export async function processPayment(
  _params: ProcessPaymentParams,
): Promise<ProcessPaymentResult> {
  throw new Error(
    'processPayment is not configured yet — gateway adapters land in Phase 3 (docs/03, docs/05).',
  )
}
