/**
 * Skripta: dohvaća HTML svake igraonice koja ima `website` u landing-data.ts
 * i iz njega izvlači TikTok (i opcionalno Facebook/Instagram) href-ove.
 *
 * Pokretanje iz korijena projekta:
 *   node tools/scan-venue-social.mjs
 *   node tools/scan-venue-social.mjs --save
 *   node tools/scan-venue-social.mjs --delay 1200
 *
 * Ne mijenja landing-data.ts — samo ispis (i opcionalno tools/last-scan-social.json).
 */
import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataPath = join(root, 'src', 'lib', 'landing-data.ts')

const args = process.argv.slice(2)
const save = args.includes('--save')
const delayMs = Number(args.find((a) => a.startsWith('--delay='))?.split('=')[1]) || 900

function parseVenueWebsites(ts) {
  const start = ts.indexOf('export const venues: Venue[] = [')
  const end = ts.indexOf('].map(v => {', start)
  if (start === -1 || end === -1) throw new Error('Nije pronađen venues array u landing-data.ts')
  const slice = ts.slice(start, end)
  const pairs = []
  for (const chunk of slice.split(/\n    id: '/).slice(1)) {
    const slugM = chunk.match(/slug: '([^']+)'/)
    const webM = chunk.match(/website: '([^']+)'/)
    if (slugM?.[1] && webM?.[1]) pairs.push({ slug: slugM[1], website: webM[1] })
  }
  return pairs
}

function normalizeUrl(u, base) {
  let s = String(u).replace(/&amp;/g, '&').trim()
  if (s.startsWith('//')) s = 'https:' + s
  if (s.startsWith('/')) {
    try {
      s = new URL(s, base).href
    } catch {
      return null
    }
  }
  if (!/^https?:\/\//i.test(s)) return null
  return s
}

function isJunkTiktok(u) {
  return /tiktok\.com\/(?:share|v|video|t\/|discover|tag|music|live|foryou)/i.test(u)
}

function cleanTiktokCandidate(u) {
  if (!u || isJunkTiktok(u)) return null
  const noQuery = u.split('?')[0].replace(/\/+$/, '')
  if (!/tiktok\.com/i.test(noQuery)) return null
  if (/\/@[\w.]+$/i.test(noQuery) || /\/@[\w.]+\//i.test(noQuery)) {
    const m = noQuery.match(/^(https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+)/i)
    return m ? m[1].replace(/\/+$/, '') : null
  }
  return null
}

function pickBestTiktok(set) {
  const list = [...set].map(cleanTiktokCandidate).filter(Boolean)
  if (!list.length) return null
  list.sort((a, b) => a.length - b.length)
  return list[0]
}

function extractFromHtml(html, finalUrl) {
  const base = finalUrl || 'https://example.com/'
  const tiktok = new Set()

  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi
  let m
  while ((m = hrefRe.exec(html))) {
    const u = normalizeUrl(m[1], base)
    if (u && /tiktok\.com/i.test(u)) tiktok.add(u)
  }

  const rawRe = /https?:\/\/(?:www\.)?tiktok\.com\/[^\s"'<>]+/gi
  while ((m = rawRe.exec(html))) {
    let u = m[0].replace(/&amp;/g, '&')
    const cut = u.search(/["'<>]/)
    if (cut !== -1) u = u.slice(0, cut)
    if (/tiktok\.com/i.test(u)) tiktok.add(u)
  }

  return { tiktok: pickBestTiktok(tiktok) }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchPage(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 25000)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; VidimoSeSocialScan/1.0; +https://vidimose.hr)',
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'accept-language': 'hr,en;q=0.8',
      },
    })
    const html = await res.text()
    return { ok: res.ok, status: res.status, url: res.url, html }
  } catch (e) {
    return { ok: false, status: 0, url, html: '', error: String(e?.cause?.message || e?.message || e) }
  } finally {
    clearTimeout(t)
  }
}

async function scanWithOptionalWww(website) {
  let r = await fetchPage(website)
  if (!r.ok || !r.html) {
    const www = website.replace(/^(https?:\/\/)(?!www\.)/i, '$1www.')
    if (www !== website) r = await fetchPage(www)
  }
  return r
}

const text = fs.readFileSync(dataPath, 'utf8')
const venues = parseVenueWebsites(text)

console.error(`Pronađeno ${venues.length} lokacija s website poljem. Delay ${delayMs}ms između zahtjeva.\n`)

const results = {}
for (const { slug, website } of venues) {
  process.stderr.write(`${slug} … `)
  const r = await scanWithOptionalWww(website)
  if (!r.ok && !r.html) {
    results[slug] = { website, tiktok: null, error: r.error || `HTTP ${r.status}` }
    process.stderr.write(`fail (${results[slug].error})\n`)
  } else {
    const { tiktok } = extractFromHtml(r.html, r.url)
    results[slug] = { website, tiktok, status: r.status }
    process.stderr.write(tiktok ? `TikTok ✓\n` : '—\n')
  }
  await sleep(delayMs)
}

const summary = {
  generatedAt: new Date().toISOString(),
  count: venues.length,
  withTiktok: Object.values(results).filter((x) => x.tiktok).length,
  results,
}

if (save) {
  const outPath = join(__dirname, 'last-scan-social.json')
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8')
  console.error(`\nSpremljeno: ${outPath}`)
}

console.log(JSON.stringify(summary, null, 2))
