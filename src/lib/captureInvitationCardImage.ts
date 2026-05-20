import { toJpeg } from 'html-to-image'

import { buildGoogleFontsEmbedCss } from './buildGoogleFontsEmbedCss'

/** Isti izvoz kao „Izvezi u JPG” u host studiju — za WhatsApp OG upload. */
export async function captureInvitationCardJpeg(root: HTMLElement): Promise<string> {
  const rect = root.getBoundingClientRect()
  const width = Math.ceil(Math.max(root.scrollWidth, rect.width))
  const height = Math.ceil(Math.max(root.scrollHeight, rect.height))

  let fontEmbedCSS = ''
  try {
    fontEmbedCSS = await buildGoogleFontsEmbedCss(document, { cacheBust: true })
  } catch {
    /* mreža / blokada */
  }

  return toJpeg(root, {
    quality: 0.92,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      overflow: 'visible',
    },
  })
}
