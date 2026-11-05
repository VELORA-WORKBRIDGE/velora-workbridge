# Netlify Functions starter (sandbox only)

Server endpoints for the buildless WORKBRIDGE hub. They are adapted from two sources: the Stripe "accept in-person payments" Terminal sample and the Cyberklick product-audience-insight playbook. No npm dependencies: Stripe is called over its REST API with `fetch`.

**Live payments are not enabled.** Every Stripe call refuses keys that are not `sk_test_`/`rk_test_`, and it also refuses any live-mode object Stripe returns. **Booking confirmation is not enabled.** The webhook returns a diagnostic receipt and does nothing else.

## Endpoints

| Method & path | Purpose |
|---|---|
| `POST /api/terminal/payments` `{ "amount": 2000 }` | Create a `card_present` PaymentIntent (USD, in cents, 50–100000) |
| `GET /api/terminal/payments/:id` | Payment status |
| `POST /api/terminal/reader` `{ "action": "register" }` | Create a sandbox location and a simulated reader |
| `POST /api/terminal/reader` `{ "action": "process", "reader_id", "payment_intent_id" }` | Send the PaymentIntent to the reader (retries reader timeouts) |
| `POST /api/terminal/reader` `{ "action": "simulate", "reader_id", "card_number"? }` | Present a simulated test card (default `4242424242424242`) |
| `GET /api/audience-plan` / `GET /api/audience-plan/:brand` | Five-section planning outline for `velora`, `vivia`, `workbridge` |
| `POST /api/stripe/webhook` | Verify `Stripe-Signature`, reject live events, return a diagnostic receipt |

Sandbox flow: register → create payment → process → simulate → poll status until `succeeded`.

## Setup

1. **Rotate the exposed key first.** The original Stripe sample ZIP contained a hardcoded test secret key. Roll it in the Stripe Dashboard (Developers → API keys → Roll key). Do not reuse it.
2. In Netlify project environment variables, set these as secrets and keep them out of Git:
   - `STRIPE_SECRET_KEY`: the new **test-mode** secret key (or a restricted `rk_test_` key)
   - `STRIPE_WEBHOOK_SECRET`: the signing secret of a **test-mode** webhook endpoint pointing at `https://<site>/api/stripe/webhook`
   - `TERMINAL_API_TOKEN` (recommended): when set, Terminal endpoints require `Authorization: Bearer <token>`
3. Deploy, then run the sandbox flow above against Stripe test mode.

## Audience plans

These plans are outlines, not research results. Following the playbook's "data before fabrication" rule, they leave percentages, budgets, competitors and regions as `RESEARCH_REQUIRED`. Interest keywords are candidates until TikTok validates them. VIVIA (HOUSING) and WORKBRIDGE (EMPLOYMENT) fall under TikTok special ad categories, so demographic targeting is marked as not applicable and needs a compliance review.

## Tests

`node --test tests/functions/functions.test.mts` runs 9 tests against a mocked `fetch`. No real Stripe calls are made.
