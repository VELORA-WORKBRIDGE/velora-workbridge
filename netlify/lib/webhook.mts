// Stripe webhook signature verification (scheme v1, HMAC-SHA256).
import { createHmac, timingSafeEqual } from 'node:crypto'

const TOLERANCE_SECONDS = 300

export function verifySignature(payload: string, header: string, secret: string, now = Math.floor(Date.now() / 1000)): boolean {
  const parts = header.split(',').map((p) => p.trim().split('='))
  const timestamp = Number(parts.find(([k]) => k === 't')?.[1])
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v || '')
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest()
  return signatures.some((sig) => {
    const buf = Buffer.from(sig, 'hex')
    return buf.length === expected.length && timingSafeEqual(buf, expected)
  })
}
