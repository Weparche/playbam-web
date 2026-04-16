import {
  buildInvitationHeroTitle,
  formatInvitationDateText,
  formatInvitationTimeText,
  resolveInvitationBackgroundImage,
} from '../components/invitation/invitationHeroContent'
import type { PublicInvitation } from './invitationApi'

const META_KEYS = [
  ['property', 'og:type'],
  ['property', 'og:url'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:image'],
  ['property', 'og:locale'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
] as const

export function buildInvitationShareDescription(inv: PublicInvitation): string {
  const parts = [
    formatInvitationDateText(inv.date),
    formatInvitationTimeText(inv.time),
    inv.location?.trim(),
  ].filter(Boolean)
  const line = parts.join(' · ')
  const msg = inv.message?.trim()
  if (msg && line.length < 140) {
    const extra = msg.length > 90 ? `${msg.slice(0, 90)}…` : msg
    return `${line} — ${extra}`.slice(0, 220)
  }
  return (line || 'Rođendanska pozivnica na VidimoSe.hr').slice(0, 220)
}

function upsertMeta(attr: 'property' | 'name', key: string, content: string) {
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function buildInvitationPageUrl(inv: PublicInvitation) {
  const slug = (inv.publicSlug || inv.shareToken || '').trim()
  const path = `/pozivnica/${encodeURIComponent(slug)}`
  if (typeof window === 'undefined') {
    return path
  }
  return `${window.location.origin}${path}`
}

export function applyInvitationShareMeta(inv: PublicInvitation) {
  const pageUrl = buildInvitationPageUrl(inv)
  const title = buildInvitationHeroTitle(inv.title, inv.celebrantName)
  const description = buildInvitationShareDescription(inv)
  const imagePath = resolveInvitationBackgroundImage(inv.coverImage, inv.theme)
  const imageUrl =
    typeof window !== 'undefined' ? new URL(imagePath, window.location.origin).href : imagePath

  document.title = title
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:url', pageUrl)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:image', imageUrl)
  upsertMeta('property', 'og:locale', 'hr_HR')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', imageUrl)
}

export function clearInvitationShareMeta() {
  document.title = 'VidimoSe.hr'
  for (const [attr, key] of META_KEYS) {
    const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
    document.querySelector(selector)?.remove()
  }
}
