/**
 * Cloudflare Pages Function skeleton for Partner API (faza 2).
 * Bind D1 as PARTNER_DB in wrangler.toml before enabling.
 */

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)

  if (!env.PARTNER_DB) {
    return Response.json(
      { error: 'PARTNER_DB binding not configured. See functions/partner/schema.sql and wrangler.toml.' },
      { status: 501 },
    )
  }

  if (url.pathname === '/api/partner/playroom' && request.method === 'GET') {
    const row = await env.PARTNER_DB.prepare('SELECT * FROM playrooms LIMIT 1').first()
    return Response.json({ playroom: row })
  }

  return Response.json({ error: 'Not implemented in MVP skeleton' }, { status: 501 })
}
