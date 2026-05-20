/**
 * Dohvaća URL-ove slika parkova s Wikimedia Commonsa (geosearch + pretraga).
 *
 *   node tools/fetch-park-photos.mjs
 *   node tools/fetch-park-photos.mjs --apply
 *
 * Zahtijeva pauzu između poziva (Commons rate limit). Ručno provjeri rezultat prije --apply.
 */
import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../src/data/parks-data.ts')
const USER_AGENT = 'VidimoSe/1.0 (https://vidimose.hr; parks photo tool)'
const DELAY_MS = 1600

/** Ručno provjerene fotografije (Wikimedia Commons, CC). */
export const CURATED_PARK_PHOTOS = {
  'maksimirsko-igraliste':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Zagreb_-_Maksimirski_perivoj_u_travnju.JPG/1280px-Zagreb_-_Maksimirski_perivoj_u_travnju.JPG',
  'park-bundek':
    'https://upload.wikimedia.org/wikipedia/commons/9/99/Bundek_climbing_frame_20150307_DSC_0109%2C_crop.jpg',
  'jarun-djecji-park':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Zagreb_Jarun_main_way_1.jpg/1280px-Zagreb_Jarun_main_way_1.jpg',
  'park-ribnjak':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/ZagrebParkRibnjak.jpg/1280px-ZagrebParkRibnjak.jpg',
  'park-zrinjevac':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Zrinjevac_Park_in_Zagreb%2C_Croatia.JPG/1280px-Zrinjevac_Park_in_Zagreb%2C_Croatia.JPG',
  'park-stara-tresnjevka':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Zagreb_STC_MeetUp_9_Photo_1.jpg/1280px-Zagreb_STC_MeetUp_9_Photo_1.jpg',
  'park-dugave':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Dugave_park_20110917_3137.jpg/1280px-Dugave_park_20110917_3137.jpg',
  'park-kajzerica':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Kajzerica_table%2C_Novi_Zagreb.jpg/1280px-Kajzerica_table%2C_Novi_Zagreb.jpg',
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function commonsApi(params) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    format: 'json',
    ...params,
  })}`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text.slice(0, 120))
  }
}

function pickBest(candidates, parkName) {
  const words = parkName.toLowerCase().split(/\s+/)
  const scored = candidates
    .map((item) => {
      const title = item.title.toLowerCase()
      let score = 0
      if (/playground|igrali|climbing|djec|children|park|jezero|lake|bundek|jarun|maksimir|ribnjak|zrinjevac|dugave|kajzerica|tresnjevka/i.test(title)) {
        score += 4
      }
      for (const word of words) {
        if (word.length > 3 && title.includes(word)) score += 2
      }
      if (/map|plan|svg|pdf|logo|coat|insect|fly|moth|meetup|flood/i.test(title)) score -= 5
      return { ...item, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored[0]?.url ?? null
}

async function fetchPhotoForPark(park) {
  await sleep(DELAY_MS)

  const geo = await commonsApi({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${park.lat}|${park.lng}`,
    ggsradius: '700',
    ggslimit: '20',
    ggsnamespace: '6',
    prop: 'imageinfo',
    iiprop: 'url|thumburl',
    iiurlwidth: '1200',
  })

  const geoPages = Object.values(geo.query?.pages ?? {}).map((page) => ({
    title: (page.title ?? '').replace(/^File:/, ''),
    url: page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url,
  }))

  const bestGeo = pickBest(geoPages.filter((p) => p.url), park.name)
  if (bestGeo) return { source: 'geosearch', url: bestGeo }

  await sleep(DELAY_MS)

  const search = await commonsApi({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `${park.name} Zagreb park`,
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|thumburl',
    iiurlwidth: '1200',
  })

  const searchPages = Object.values(search.query?.pages ?? {}).map((page) => ({
    title: (page.title ?? '').replace(/^File:/, ''),
    url: page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url,
  }))

  const bestSearch = pickBest(searchPages.filter((p) => p.url), park.name)
  if (bestSearch) return { source: 'search', url: bestSearch }

  return { source: 'curated', url: CURATED_PARK_PHOTOS[park.id] ?? null }
}

function parseParksFromDataFile(contents) {
  const parks = []
  const blockRe = /\{\s*id: '([^']+)'[\s\S]*?name: '([^']+)'[\s\S]*?lat: ([\d.]+),[\s\S]*?lng: ([\d.]+),/g
  let match
  while ((match = blockRe.exec(contents))) {
    parks.push({
      id: match[1],
      name: match[2],
      lat: Number(match[3]),
      lng: Number(match[4]),
    })
  }
  return parks
}

function applyPhotos(contents, photoById) {
  let next = contents
  for (const [id, url] of Object.entries(photoById)) {
    if (!url) continue
    const re = new RegExp(
      `(id: '${id}'[\\s\\S]*?coverPhoto: )'[^']*'`,
    )
    next = next.replace(re, `$1'${url.replace(/'/g, "\\'")}'`)
  }
  return next
}

async function main() {
  const apply = process.argv.includes('--apply')
  const contents = fs.readFileSync(dataPath, 'utf8')
  const parks = parseParksFromDataFile(contents)

  console.log(`Parkova: ${parks.length}\n`)

  const photoById = {}
  for (const park of parks) {
    const curated = CURATED_PARK_PHOTOS[park.id]
    let result = { source: 'curated', url: curated ?? null }

    if (!apply) {
      console.log(`${park.id}: ${curated ?? '(nema kurirane)'}`)
      photoById[park.id] = curated
      continue
    }

    try {
      result = await fetchPhotoForPark(park)
    } catch (error) {
      console.warn(`${park.id}: API greška, ostaje kurirana slika — ${error.message}`)
      result = { source: 'curated-fallback', url: curated ?? null }
    }

    photoById[park.id] = result.url
    console.log(`${park.id} [${result.source}]: ${result.url ?? '—'}`)
  }

  if (apply) {
    fs.writeFileSync(dataPath, applyPhotos(contents, photoById), 'utf8')
    console.log('\nAžurirano:', dataPath)
  } else {
    console.log('\nZa upis u parks-data.ts pokreni: node tools/fetch-park-photos.mjs --apply')
    console.log('(trenutno samo ispis kuriranih URL-ova; --apply zove Commons API)')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
