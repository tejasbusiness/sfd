import { supabase } from '../supabase/client'

export type Currency = 'INR' | 'USD'

export interface ProcessPaymentParams {
  currency: Currency
  tierId: string
  clientEmail: string
  clientFullName?: string
  leadId?: string
}

export interface ProcessPaymentResult {
  gateway: 'razorpay' | 'stripe'
  checkoutUrl: string
}

export class PaymentError extends Error {}

/**
 * Single entry point for all checkout/billing code (Rule A). Dispatches to
 * the Razorpay or Stripe adapter by currency via the create-checkout-session
 * edge function — UI never imports a gateway SDK or sees a secret key
 * directly. This is the only allowed import surface for starting checkout.
 */
export async function processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  const { data, error } = await supabase.functions.invoke<ProcessPaymentResult>(
    'create-checkout-session',
    { body: params },
  )

  if (error) {
    const context = (error as { context?: Response }).context
    if (context) {
      const body = await context.clone().json().catch(() => null)
      throw new PaymentError(body?.error ?? error.message)
    }
    throw new PaymentError(error.message)
  }

  if (!data) throw new PaymentError('No response from checkout session.')
  return data
}
