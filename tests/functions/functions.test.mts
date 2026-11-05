// Mock-based tests: global fetch is stubbed, so no real Stripe calls are made.
// Run with: node --test tests/functions/
import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import payments from '../../netlify/functions/terminal-payments.mts'
import reader from '../../netlify/functions/terminal-reader.mts'
import audience from '../../netlify/functions/audience-plan.mts'
import webhook from '../../netlify/functions/stripe-webhook.mts'

const realFetch = globalThis.fetch
const calls: { url: string; init: any }[] = []
function mockStripe(responder: (url: string, init: any) => { status?: number; body: any }) {
  globalThis.fetch = (async (url: string, init: any) => {
    calls.push({ url, init })
    const r = responder(url, init)
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 })
  }) as any
}
afterEach(() => {
  globalThis.fetch = realFetch
  calls.length = 0
  delete process.env.STRIPE_SECRET_KEY
  delete process.env.STRIPE_WEBHOOK_SECRET
  delete process.env.TERMINAL_API_TOKEN
})
const TEST_KEY = 'sk_test_' + 'mock'
const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })

test('creates a sandbox card_present PaymentIntent', async () => {
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  mockStripe(() => ({ body: { id: 'pi_123', status: 'requires_payment_method', amount: 2000, currency: 'usd', livemode: false } }))
  const res = await payments(post('http://x/api/terminal/payments', { amount: 2000 }), { params: {} })
  assert.equal(res.status, 201)
  assert.equal((await res.json()).payment.id, 'pi_123')
  const sent = String(calls[0].init.body)
  assert.match(sent, /payment_method_types%5B0%5D=card_present/)
  assert.match(sent, /currency=usd/)
})

test('refuses live keys and invalid amounts without calling Stripe', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_live_' + 'mock'
  mockStripe(() => ({ body: {} }))
  const live = await payments(post('http://x/api/terminal/payments', { amount: 2000 }), { params: {} })
  assert.equal(live.status, 503)
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  const bad = await payments(post('http://x/api/terminal/payments', { amount: 5 }), { params: {} })
  assert.equal(bad.status, 400)
  assert.equal(calls.length, 0)
})

test('returns payment status', async () => {
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  mockStripe(() => ({ body: { id: 'pi_123', status: 'succeeded', amount: 2000, amount_received: 2000, livemode: false } }))
  const res = await payments(new Request('http://x/api/terminal/payments/pi_123'), { params: { id: 'pi_123' } })
  assert.equal((await res.json()).payment.status, 'succeeded')
  assert.equal(calls[0].init.method, 'GET')
})

test('processes on a simulated reader, retrying reader timeouts', async () => {
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  let n = 0
  mockStripe(() =>
    ++n < 3
      ? { status: 400, body: { error: { code: 'terminal_reader_timeout', message: 'timeout' } } }
      : { body: { id: 'tmr_1', action: { type: 'process_payment_intent', status: 'in_progress' }, livemode: false } },
  )
  const res = await reader(post('http://x/api/terminal/reader', { action: 'process', reader_id: 'tmr_1', payment_intent_id: 'pi_123' }))
  assert.equal(res.status, 200)
  assert.equal(calls.length, 3)
  assert.match(calls[0].url, /terminal\/readers\/tmr_1\/process_payment_intent$/)
})

test('presents a simulated test card', async () => {
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  mockStripe(() => ({ body: { id: 'tmr_1', action: { type: 'process_payment_intent', status: 'succeeded' }, livemode: false } }))
  const res = await reader(post('http://x/api/terminal/reader', { action: 'simulate', reader_id: 'tmr_1' }))
  assert.equal((await res.json()).reader.action.status, 'succeeded')
  assert.match(calls[0].url, /test_helpers\/terminal\/readers\/tmr_1\/present_payment_method$/)
})

test('optional access token gates terminal endpoints', async () => {
  process.env.STRIPE_SECRET_KEY = TEST_KEY
  process.env.TERMINAL_API_TOKEN = 'tok'
  mockStripe(() => ({ body: {} }))
  const res = await reader(post('http://x/api/terminal/reader', { action: 'register' }))
  assert.equal(res.status, 401)
  assert.equal(calls.length, 0)
})

test('audience plan has five sections for each brand', async () => {
  const res = await audience(new Request('http://x/api/audience-plan'), { params: {} })
  const { plans } = await res.json()
  assert.equal(plans.length, 3)
  for (const plan of plans) {
    assert.equal(plan.sections.length, 5)
    assert.equal(plan.sections[4].profiles.length, 5)
  }
  const vivia = await (await audience(new Request('http://x/api/audience-plan/vivia'), { params: { brand: 'vivia' } })).json()
  assert.equal(vivia.plan.sections[0].compliance.special_ad_category, 'HOUSING')
  const missing = await audience(new Request('http://x/api/audience-plan/nope'), { params: { brand: 'nope' } })
  assert.equal(missing.status, 404)
})

function signed(payload: string, secret: string, t = Math.floor(Date.now() / 1000)) {
  const sig = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')
  return post('http://x/api/stripe/webhook', JSON.parse(payload), { 'stripe-signature': `t=${t},v1=${sig}` })
}

test('webhook verifies signatures and returns a diagnostic receipt', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded', livemode: false, data: { object: { id: 'pi_1', status: 'succeeded' } } })
  const ok = await webhook(signed(payload, 'whsec_mock'))
  assert.equal(ok.status, 200)
  const body = await ok.json()
  assert.equal(body.receipt.fulfillment, 'none')
  assert.equal((await webhook(signed(payload, 'wrong'))).status, 400)
  assert.equal((await webhook(signed(payload, 'whsec_mock', 1000))).status, 400)
})

test('webhook rejects live-mode events', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
  const payload = JSON.stringify({ id: 'evt_2', type: 'payment_intent.succeeded', livemode: true, data: { object: {} } })
  assert.equal((await webhook(signed(payload, 'whsec_mock'))).status, 403)
})
