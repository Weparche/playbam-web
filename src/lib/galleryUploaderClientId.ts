const STORAGE_PREFIX = 'playbam-gallery-uploader:'

export function getGalleryUploaderClientId(token: string) {
  const key = `${STORAGE_PREFIX}${token.trim()}`

  try {
    const stored = localStorage.getItem(key)
    if (stored && stored.length >= 8) {
      return stored
    }

    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
  } catch {
    return ''
  }
}
