/**
 * Builds a single CSS string with @font-face rules and inlined font binaries.
 * Uses fetch() only (no StyleSheet#cssRules), so it works with cross-origin
 * Google Fonts links that would throw SecurityError inside html-to-image.
 */
export async function buildGoogleFontsEmbedCss(
  doc: Document,
  options?: { cacheBust?: boolean; fetchRequestInit?: RequestInit },
): Promise<string> {
  const links = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
  const hrefs = [
    ...new Set(
      links
        .map((l) => l.getAttribute('href')?.trim() || '')
        .filter((h) => h.includes('fonts.googleapis.com')),
    ),
  ].map((h) => (h.startsWith('http') ? h : new URL(h, doc.location.origin).href))

  const chunks: string[] = []
  for (const href of hrefs) {
    const url =
      href + (options?.cacheBust ? `${href.includes('?') ? '&' : '?'}_=${Date.now()}` : '')
    try {
      const res = await fetch(url, options?.fetchRequestInit)
      if (!res.ok) {
        continue
      }
      const cssText = await res.text()
      chunks.push(await inlineFontUrlsInCss(cssText, href))
    } catch {
      /* ignore broken font sheet */
    }
  }
  return chunks.join('\n')
}

async function blobToDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(blob)
  })
}

async function inlineFontUrlsInCss(cssText: string, sheetHref: string): Promise<string> {
  const locs = cssText.match(/url\([^)]+\)/g) || []
  const uniqueLocs = [...new Set(locs)]
  const locToAbsolute = new Map<string, string>()

  for (const loc of uniqueLocs) {
    const m = /url\((["']?)([^"')]+)\1\)/.exec(loc)
    if (!m) {
      continue
    }
    const raw = m[2]
    if (raw.startsWith('data:')) {
      continue
    }
    const absolute = /^https?:\/\//i.test(raw) ? raw : new URL(raw, sheetHref).href
    locToAbsolute.set(loc, absolute)
  }

  const absoluteUrls = [...new Set(locToAbsolute.values())]
  const dataByAbsolute = new Map<string, string>()
  await Promise.all(
    absoluteUrls.map(async (abs) => {
      try {
        const res = await fetch(abs)
        if (!res.ok) {
          return
        }
        const dataUrl = await blobToDataUrl(await res.blob())
        if (dataUrl) {
          dataByAbsolute.set(abs, dataUrl)
        }
      } catch {
        /* keep original */
      }
    }),
  )

  let out = cssText
  for (const [loc, absolute] of locToAbsolute) {
    const dataUrl = dataByAbsolute.get(absolute)
    if (dataUrl) {
      out = out.split(loc).join(`url(${dataUrl})`)
    }
  }
  return out
}
