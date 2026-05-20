/** Ime datoteke za Twemoji CDN (npr. 1f389.png ili 1f469-200d-1f467). */
export function twemojiFilename(symbol: string): string {
  const parts: string[] = []

  for (const char of symbol) {
    const cp = char.codePointAt(0)
    if (cp === undefined || cp === 0xfe0f) {
      continue
    }
    parts.push(cp.toString(16))
  }

  return parts.join('-')
}

export function twemojiAssetUrl(symbol: string, size: 72 | 36 = 72): string {
  const file = twemojiFilename(symbol)
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/${size}x${size}/${file}.png`
}
