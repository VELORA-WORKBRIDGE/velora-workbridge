// Server-side reachability check for the three linked service portals.
// Reports only whether each portal responds; it never reads or changes portal records.

const PORTALS = [
  { id: 'wellness', brand: 'VELORA', url: 'https://velorabysj.zite.so/' },
  { id: 'rentals', brand: 'VIVIA Rentals', url: 'https://viviarentalhomes.zite.so' },
  { id: 'careers', brand: 'WORKBRIDGE', url: 'https://workbridge.zite.so' },
]

async function probe(url: string) {
  const started = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
      headers: { 'user-agent': 'velora-workbridge-hub-status/1.0' },
    })
    await res.body?.cancel()
    return { reachable: res.status < 500, httpStatus: res.status, latencyMs: Date.now() - started }
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError'
    return { reachable: false, httpStatus: null, latencyMs: Date.now() - started, error: timedOut ? 'timeout' : 'unreachable' }
  }
}

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
  const results = await Promise.all(PORTALS.map(async (p) => ({ ...p, ...(await probe(p.url)) })))
  return Response.json(
    { checkedAt: new Date().toISOString(), portals: results },
    { headers: { 'cache-control': 'public, max-age=0, s-maxage=60' } },
  )
}

export const config = { path: '/api/integration-status' }
