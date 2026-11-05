// Stripe Terminal sandbox: register a simulated reader, hand it a PaymentIntent,
// and present a simulated test card. Simulated readers only exist in test mode.
import { checkAccess, errorResponse, HttpError, json, readJson, stripeRequest } from '../lib/stripe.mts'

const ID = /^[A-Za-z0-9_]+$/

function summarizeReader(r: any) {
  return {
    id: r.id,
    label: r.label,
    device_type: r.device_type,
    status: r.status,
    location: r.location,
    action: r.action
      ? { type: r.action.type, status: r.action.status, failure_message: r.action.failure_message ?? null }
      : null,
  }
}

async function processWithRetry(readerId: string, paymentIntentId: string) {
  let tries = 0
  for (;;) {
    tries++
    try {
      return await stripeRequest('POST', `/terminal/readers/${readerId}/process_payment_intent`, {
        payment_intent: paymentIntentId,
      })
    } catch (err) {
      // Temporary networking blip: retry a few times, mirroring the Stripe sample.
      if (err instanceof HttpError && err.code === 'terminal_reader_timeout' && tries < 3) continue
      throw err
    }
  }
}

export default async (req: Request) => {
  try {
    checkAccess(req)
    if (req.method !== 'POST') return json({ error: { message: 'Method not allowed.' } }, 405)
    const body = await readJson(req)
    const action = String(body.action || '')

    if (action === 'register') {
      const location = await stripeRequest('POST', '/terminal/locations', {
        display_name: String(body.display_name || 'WORKBRIDGE Sandbox').slice(0, 100),
        address: {
          line1: '1272 Valencia Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: '94110',
        },
      })
      const reader = await stripeRequest('POST', '/terminal/readers', {
        location: location.id,
        label: 'WORKBRIDGE - Simulated Reader',
        registration_code: 'simulated-t600',
      })
      return json({ location: { id: location.id }, reader: summarizeReader(reader) }, 201)
    }

    const readerId = String(body.reader_id || '')
    if (!readerId.startsWith('tmr_') || !ID.test(readerId)) throw new HttpError(400, 'A valid reader_id is required.', 'invalid_reader')

    if (action === 'process') {
      const piId = String(body.payment_intent_id || '')
      if (!piId.startsWith('pi_') || !ID.test(piId)) throw new HttpError(400, 'A valid payment_intent_id is required.', 'invalid_id')
      try {
        const reader = await processWithRetry(readerId, piId)
        return json({ reader: summarizeReader(reader) })
      } catch (err) {
        if (err instanceof HttpError && err.code === 'intent_invalid_state') {
          const pi = await stripeRequest('GET', `/payment_intents/${piId}`)
          throw new HttpError(409, `PaymentIntent is already in ${pi.status} state.`, 'intent_invalid_state')
        }
        throw err
      }
    }

    if (action === 'simulate') {
      const cardNumber = String(body.card_number || '4242424242424242')
      if (!/^\d{12,19}$/.test(cardNumber)) throw new HttpError(400, 'card_number must be a Stripe test card number.', 'invalid_card')
      const reader = await stripeRequest('POST', `/test_helpers/terminal/readers/${readerId}/present_payment_method`, {
        type: 'card_present',
        card_present: { number: cardNumber },
      })
      return json({ reader: summarizeReader(reader) })
    }

    throw new HttpError(400, 'action must be one of: register, process, simulate.', 'invalid_action')
  } catch (err) {
    return errorResponse(err)
  }
}

export const config = {
  path: '/api/terminal/reader',
  method: 'POST',
}
