// GET /api/audience-plan            -> plans for all brands
// GET /api/audience-plan/:brand     -> plan for velora | vivia | workbridge
import { BRAND_KEYS, buildPlan, type Brand } from '../lib/audience-plans.mts'
import { json } from '../lib/stripe.mts'

export default async (req: Request, context: any) => {
  if (req.method !== 'GET') return json({ error: { message: 'Method not allowed.' } }, 405)
  const brand = String(context?.params?.brand || '').toLowerCase()
  if (!brand) return json({ plans: BRAND_KEYS.map((b) => buildPlan(b)) })
  if (!BRAND_KEYS.includes(brand as Brand)) {
    return json({ error: { message: `Unknown brand. Use one of: ${BRAND_KEYS.join(', ')}.` } }, 404)
  }
  return json({ plan: buildPlan(brand as Brand) })
}

export const config = {
  path: ['/api/audience-plan', '/api/audience-plan/:brand'],
  method: 'GET',
}
