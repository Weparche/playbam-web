/**
 * Cloudflare Pages Function for Partner API (faza 2).
 * Requires PARTNER_DB D1 binding in wrangler.toml.
 */

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)

  if (!env.PARTNER_DB) {
    return Response.json(
      {
        error: 'PARTNER_DB binding not configured.',
        hint: 'Add [[d1_databases]] binding = "PARTNER_DB" to wrangler.toml and redeploy Pages.',
      },
      { status: 501, headers: JSON_HEADERS },
    )
  }

  if (url.pathname === '/api/partner/playroom' && request.method === 'GET') {
    const row = await env.PARTNER_DB.prepare('SELECT * FROM playrooms LIMIT 1').first()
    if (!row) {
      return Response.json(
        { error: 'No playroom found. Run: wrangler d1 execute vidimose-partner --remote --file=functions/partner/seed.sql' },
        { status: 404, headers: JSON_HEADERS },
      )
    }
    return Response.json({ playroom: row }, { headers: JSON_HEADERS })
  }

  return Response.json({ error: 'Not implemented in MVP skeleton' }, { status: 501, headers: JSON_HEADERS })
}
