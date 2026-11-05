// Stripe Terminal sandbox: create card_present PaymentIntents and read their status.
// Adapted from the Stripe "accept in-person payments" sample (server.rb) without its hardcoded key.
import { checkAccess, errorResponse, HttpError, json, readJson, stripeRequest } from '../lib/stripe.mts'

const MIN_AMOUNT = 50 // Stripe minimum for USD, in cents
const MAX_AMOUNT = 100_000 // sandbox safety cap: $1,000.00

function summarize(pi: any) {
  return {
    id: pi.id,
    status: pi.status,
    amount: pi.amount,
    amount_received: pi.amount_received,
    currency: pi.currency,
    capture_method: pi.capture_method,
    livemode: pi.livemode,
    last_payment_error: pi.last_payment_error?.message ?? null,
    created: pi.created,
  }
}

export default async (req: Request, context: any) => {
  try {
    checkAccess(req)
    const id: string | undefined = context?.params?.id

    if (req.method === 'GET') {
      if (!id || !/^pi_[A-Za-z0-9_]+$/.test(id)) throw new HttpError(400, 'A valid PaymentIntent id is required.', 'invalid_id')
      const pi = await stripeRequest('GET', `/payment_intents/${id}`)
      return json({ payment: summarize(pi) })
    }

    if (req.method === 'POST' && !id) {
      const body = await readJson(req)
      const amount = Number(body.amount)
      if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
        throw new HttpError(400, `amount must be an integer number of cents between ${MIN_AMOUNT} and ${MAX_AMOUNT}.`, 'invalid_amount')
      }
      const brand = typeof body.brand === 'string' ? body.brand.slice(0, 40) : 'velora'
      const pi = await stripeRequest(
        'POST',
        '/payment_intents',
        {
          amount,
          currency: 'usd',
          payment_method_types: ['card_present'],
          capture_method: 'automatic',
          metadata: { source: 'workbridge-terminal-sandbox', brand },
        },
        typeof body.idempotency_key === 'string' ? body.idempotency_key.slice(0, 255) : undefined,
      )
      return json({ payment: summarize(pi) }, 201)
    }

    return json({ error: { message: 'Method not allowed.' } }, 405)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config = {
  path: ['/api/terminal/payments', '/api/terminal/payments/:id'],
  method: ['GET', 'POST'],
}
