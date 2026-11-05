// Minimal, dependency-free Stripe REST client restricted to sandbox (test-mode) keys.
// The buildless repo has no package.json, so this uses fetch + form encoding instead of the SDK.

const STRIPE_API = 'https://api.stripe.com/v1'

export class HttpError extends Error {
  status: number
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function getSandboxKey(): string {
  const key = process.env.STRIPE_SECRET_KEY || ''
  if (!key) throw new HttpError(503, 'Stripe sandbox is not configured.', 'not_configured')
  if (!/^(sk|rk)_test_/.test(key)) {
    // Live keys are refused outright: live payments are not enabled in this starter.
    throw new HttpError(503, 'Only Stripe sandbox (test-mode) keys are accepted.', 'live_key_rejected')
  }
  return key
}

export function encodeForm(data: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue
    const name = prefix ? `${prefix}[${k}]` : k
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === 'object') parts.push(encodeForm(item as Record<string, unknown>, `${name}[${i}]`))
        else parts.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(item))}`)
      })
    } else if (typeof v === 'object') {
      parts.push(encodeForm(v as Record<string, unknown>, name))
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.filter(Boolean).join('&')
}

export async function stripeRequest(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<any> {
  const key = getSandboxKey()
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` }
  if (method === 'POST') headers['Content-Type'] = 'application/x-www-form-urlencoded'
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    body: method === 'POST' ? encodeForm(body || {}) : undefined,
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = json?.error || {}
    throw new HttpError(res.status >= 500 ? 502 : 400, err.message || 'Stripe request failed.', err.code || err.type)
  }
  if (json && json.livemode === true) {
    throw new HttpError(502, 'Stripe returned a live-mode object; refusing to continue.', 'livemode_object')
  }
  return json
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) return json({ error: { message: err.message, code: err.code } }, err.status)
  console.error(err)
  return json({ error: { message: 'Unexpected server error.' } }, 500)
}

// Optional shared-secret gate so the public sandbox endpoints are not open to anyone.
export function checkAccess(req: Request): void {
  const token = process.env.TERMINAL_API_TOKEN
  if (!token) return
  const header = req.headers.get('authorization') || ''
  if (header !== `Bearer ${token}`) throw new HttpError(401, 'Unauthorized.', 'unauthorized')
}

export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json()
    if (body && typeof body === 'object' && !Array.isArray(body)) return body
  } catch {}
  throw new HttpError(400, 'Request body must be a JSON object.', 'invalid_json')
}
