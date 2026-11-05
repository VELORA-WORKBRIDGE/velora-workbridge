// Stripe webhook receiver (sandbox only). Verifies the Stripe-Signature header,
// rejects live-mode events and returns a diagnostic receipt. It performs NO
// fulfillment: bookings are not confirmed and nothing is persisted.
import { json } from '../lib/stripe.mts'
import { verifySignature } from '../lib/webhook.mts'

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: { message: 'Method not allowed.' } }, 405)
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return json({ error: { message: 'Webhook secret is not configured.' } }, 503)

  const payload = await req.text()
  const header = req.headers.get('stripe-signature') || ''
  if (!verifySignature(payload, header, secret)) {
    return json({ error: { message: 'Invalid Stripe signature.' } }, 400)
  }

  let event: any
  try {
    event = JSON.parse(payload)
  } catch {
    return json({ error: { message: 'Invalid JSON payload.' } }, 400)
  }

  if (event.livemode !== false) {
    // Live payments are not enabled; refuse anything that is not explicitly test mode.
    return json({ error: { message: 'Live-mode events are rejected by this sandbox receiver.' } }, 403)
  }

  const object = event.data?.object || {}
  return json({
    received: true,
    receipt: {
      event_id: event.id,
      type: event.type,
      livemode: false,
      object_id: object.id ?? null,
      object_status: object.status ?? null,
      fulfillment: 'none',
      note: 'Diagnostic receipt only. Booking confirmation is not enabled.',
    },
  })
}

export const config = {
  path: '/api/stripe/webhook',
  method: 'POST',
}
