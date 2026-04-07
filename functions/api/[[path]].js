export async function onRequest(context) {
  const backendOrigin = (context.env.PLAYBAM_BACKEND_ORIGIN ?? '').trim().replace(/\/$/, '')

  if (!backendOrigin) {
    return new Response(JSON.stringify({ error: 'PLAYBAM_BACKEND_ORIGIN is not configured' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    })
  }

  const url = new URL(context.request.url)
  const upstreamUrl = new URL(`${backendOrigin}${url.pathname}${url.search}`)
  const requestHeaders = new Headers(context.request.headers)

  requestHeaders.set('x-forwarded-host', url.host)
  requestHeaders.set('x-forwarded-proto', url.protocol.replace(':', ''))

  const upstreamRequest = new Request(upstreamUrl, {
    method: context.request.method,
    headers: requestHeaders,
    body: ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body,
    redirect: 'manual',
  })

  const upstreamResponse = await fetch(upstreamRequest)
  const responseHeaders = new Headers(upstreamResponse.headers)

  responseHeaders.delete('access-control-allow-origin')
  responseHeaders.delete('access-control-allow-headers')
  responseHeaders.delete('access-control-allow-methods')

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}
