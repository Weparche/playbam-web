function isIkeaCandidate(unfurl, sourceUrl) {
  const domain = String(unfurl?.domain ?? '').toLowerCase()
  const url = String(sourceUrl ?? '').toLowerCase()
  return domain.includes('ikea.com') || url.includes('ikea.com')
}

function buildJinaMirrorUrl(sourceUrl) {
  const normalized = String(sourceUrl ?? '').replace(/^https?:\/\//i, '')
  if (!normalized) {
    return null
  }
  return `https://r.jina.ai/http://${normalized}`
}

function parseMarkdownImageUrls(markdown) {
  const regex = /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi
  const urls = []
  let match = regex.exec(markdown)
  while (match) {
    if (match[1]) {
      urls.push(match[1])
    }
    match = regex.exec(markdown)
  }
  return urls
}

function pickBestIkeaImage(urls) {
  let bestUrl = null
  let bestScore = Number.NEGATIVE_INFINITY

  for (const candidate of urls) {
    const url = String(candidate ?? '').trim()
    if (!url) {
      continue
    }

    const lower = url.toLowerCase()
    let score = 0

    if (lower.includes('ikea.com')) score += 30
    if (lower.includes('/images/products/')) score += 100
    if (lower.includes('/pvid/')) score += 80
    if (lower.includes('/global/assets/logos/')) score -= 140
    if (lower.includes('/logos/')) score -= 100
    if (lower.includes('favicon')) score -= 80
    if (lower.endsWith('.svg') || lower.includes('.svg?')) score -= 120

    if (score > bestScore) {
      bestScore = score
      bestUrl = url
    }
  }

  if (!bestUrl) {
    return null
  }

  if (bestUrl.startsWith('http://')) {
    return `https://${bestUrl.slice('http://'.length)}`
  }

  return bestUrl
}

async function resolveIkeaFallbackImage(sourceUrl) {
  const mirrorUrl = buildJinaMirrorUrl(sourceUrl)
  if (!mirrorUrl) {
    return null
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch(mirrorUrl, {
      method: 'GET',
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    const markdown = await response.text()
    const imageUrls = parseMarkdownImageUrls(markdown)
    return pickBestIkeaImage(imageUrls)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function withIkeaFallbackIfNeeded(requestUrl, unfurl) {
  if (!unfurl || unfurl.image) {
    return unfurl
  }

  const sourceUrl = requestUrl.searchParams.get('url') ?? ''
  if (!isIkeaCandidate(unfurl, sourceUrl)) {
    return unfurl
  }

  const fallbackImage = await resolveIkeaFallbackImage(sourceUrl)
  if (!fallbackImage) {
    return unfurl
  }

  return {
    ...unfurl,
    image: fallbackImage,
  }
}

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

  requestHeaders.delete('host')
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

  const isUnfurlRequest = context.request.method === 'GET' && url.pathname === '/api/unfurl'
  if (
    isUnfurlRequest &&
    upstreamResponse.ok &&
    (upstreamResponse.headers.get('content-type') ?? '').toLowerCase().includes('application/json')
  ) {
    const payloadText = await upstreamResponse.text()

    try {
      const unfurlPayload = JSON.parse(payloadText)
      const augmentedPayload = await withIkeaFallbackIfNeeded(url, unfurlPayload)
      responseHeaders.set('content-type', 'application/json; charset=utf-8')
      responseHeaders.delete('content-length')
      responseHeaders.delete('content-encoding')
      responseHeaders.delete('etag')

      return new Response(JSON.stringify(augmentedPayload), {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      })
    } catch {
      responseHeaders.delete('content-length')
      responseHeaders.delete('content-encoding')
      responseHeaders.delete('etag')
      return new Response(payloadText, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      })
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}
