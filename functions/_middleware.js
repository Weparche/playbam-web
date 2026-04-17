/**
 * Za WhatsApp / društvene preglednice: vraća HTML s Open Graph meta tagovima
 * (slika = ista pozadina kao „Gost pregled”, vidi src/components/invitation/invitationHeroContent.ts).
 * Sinkroniziraj INVITATION_BACKGROUND_MAP s INVITATION_BACKGROUND_MAP u tom fileu.
 *
 * Radi samo na produkciji (Cloudflare Pages) uz PLAYBAM_BACKEND_ORIGIN.
 * Lokalni `vite` ne izvršava ovaj middleware — testiraj s `wrangler pages dev` ako trebaš.
 */

const INVITATION_BACKGROUND_MAP = Object.freeze({
  baloni: '/pozivnica-girl.png',
  konfeti: '/pozivnica-boys.png',
  zvjezdice: '/pozivnica-mix.png',
  'pozivnica-bg': '/pozivnica-girl.png',
  'pozivnica-bg1': '/pozivnica-mix.png',
  'pozivnica-boys': '/pozivnica-boys.png',
  'pozivnica-boys1': '/pozivnica-girls.png',
  'pozivnica-girl': '/pozivnica-girl.png',
  'pozivnica-boy': '/pozivnica-boy.png',
  'pozivnica-girls': '/pozivnica-girls.png',
  'pozivnica-mix': '/pozivnica-mix.png',
  safari: '/safari.png',
  space: '/space.png',
  sport: '/sport.png',
  barbie: '/barbie.png',
  princess: '/princess.png',
  unicorns: '/unicorns.png',
  pirates: '/pirates.png',
})

function buildInvitationHeroTitle(title, celebrantName) {
  const normalized = String(title ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  const merged = normalized.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim()
  if (merged) {
    return merged
  }
  const fallbackName = String(celebrantName ?? '')
    .trim()
    .replace(/\s+/g, ' ') || 'Slavljenik'
  return `${fallbackName} slavi rođendan!`
}

function formatInvitationDateText(dateValue) {
  const d = String(dateValue ?? '').trim()
  if (!d) {
    return 'Datum uskoro'
  }
  const parsedDate = new Date(`${d}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return d
  }
  const dayName = parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'long' })
    .replace(/^./, (letter) => letter.toUpperCase())
  const parts = d.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  if (!year || !month || !day) {
    return d
  }
  return `${dayName}, ${day}.${month}.${year}`
}

function formatInvitationTimeText(timeValue) {
  const normalized = String(timeValue ?? '').trim()
  if (!normalized) {
    return 'Vrijeme uskoro'
  }
  if (normalized.includes('-') || /\bdo\b/i.test(normalized)) {
    return normalized
      .replace(/\s*-\s*/g, ' - ')
      .replace(/(\d{2}:\d{2})(?!h)/g, '$1h')
  }
  const [startHour = '15', startMinute = '00'] = normalized.split(':')
  const startTotalMinutes = Number(startHour) * 60 + Number(startMinute)
  const endTotalMinutes = startTotalMinutes + 120
  const endHour = String(Math.floor(endTotalMinutes / 60)).padStart(2, '0')
  const endMinute = String(endTotalMinutes % 60).padStart(2, '0')
  return `${normalized}h - ${endHour}:${endMinute}h`
}

function resolveInvitationBackgroundImage(coverImage, theme) {
  const coverKey = String(coverImage ?? '')
    .trim()
    .toLowerCase()
  const themeKey = String(theme ?? '')
    .trim()
    .toLowerCase()
  if (INVITATION_BACKGROUND_MAP[coverKey]) {
    return INVITATION_BACKGROUND_MAP[coverKey]
  }
  if (INVITATION_BACKGROUND_MAP[themeKey]) {
    return INVITATION_BACKGROUND_MAP[themeKey]
  }
  return '/pozivnica-girl.png'
}

function buildShareDescription(invitation) {
  const parts = [
    formatInvitationDateText(invitation.date),
    formatInvitationTimeText(invitation.time),
    String(invitation.location ?? '').trim(),
  ].filter(Boolean)
  const line = parts.join(' · ')
  const msg = String(invitation.message ?? '').trim()
  if (msg && line.length < 140) {
    const extra = msg.length > 90 ? `${msg.slice(0, 90)}…` : msg
    return `${line} — ${extra}`.slice(0, 220)
  }
  return (line || 'Rođendanska pozivnica na VidimoSe.hr').slice(0, 220)
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isSocialPreviewBot(userAgent) {
  return /facebookexternalhit|Facebot|WhatsApp|Instagram|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|Pinterestbot|Pinterest|vkShare|redditbot|Snapchat|SkypeUriPreview|Google-Read-Aloud/i.test(
    userAgent || '',
  )
}

function extractPozivnicaSlug(pathname) {
  const prefix = '/pozivnica/'
  if (!pathname.startsWith(prefix)) {
    return null
  }
  const segment = pathname.slice(prefix.length).split('/')[0]
  if (!segment || segment === '..') {
    return null
  }
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const pathname = url.pathname

  if (pathname.startsWith('/api/')) {
    return context.next()
  }

  const method = request.method
  if (method !== 'GET' && method !== 'HEAD') {
    return context.next()
  }

  if (!pathname.startsWith('/pozivnica/')) {
    return context.next()
  }

  const ua = request.headers.get('user-agent') ?? ''
  if (!isSocialPreviewBot(ua)) {
    return context.next()
  }

  const slug = extractPozivnicaSlug(pathname)
  if (!slug) {
    return context.next()
  }

  const backendOrigin = String(env.PLAYBAM_BACKEND_ORIGIN ?? '')
    .trim()
    .replace(/\/$/, '')
  if (!backendOrigin) {
    return context.next()
  }

  const apiUrl = `${backendOrigin}/api/public/invitations/${encodeURIComponent(slug)}`

  let invitation
  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      return context.next()
    }
    invitation = await res.json()
  } catch {
    return context.next()
  }

  if (!invitation || typeof invitation.title !== 'string') {
    return context.next()
  }

  const title = buildInvitationHeroTitle(invitation.title, invitation.celebrantName)
  const description = buildShareDescription(invitation)
  const imagePath = resolveInvitationBackgroundImage(invitation.coverImage, invitation.theme)
  const origin = url.origin
  const ogImage = imagePath.startsWith('http') ? imagePath : `${origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`

  const slugForCanonical = String(invitation.publicSlug || invitation.shareToken || slug).trim()
  const canonical = `${origin}/pozivnica/${encodeURIComponent(slugForCanonical)}`

  const html = `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:locale" content="hr_HR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">
</head>
<body></body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
