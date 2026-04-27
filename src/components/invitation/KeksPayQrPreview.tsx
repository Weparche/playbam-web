import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = {
  url: string
  /** Prikaz gumba za otvaranje u novom tabu. */
  showOpenLink?: boolean
  className?: string
}

export default function KeksPayQrPreview({ url, showOpenLink = true, className = '' }: Props) {
  const trimmed = url.trim()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!trimmed) {
      queueMicrotask(() => setQrDataUrl(null))
      return
    }
    let cancelled = false
    QRCode.toDataURL(trimmed, { width: 220, margin: 2, errorCorrectionLevel: 'M' })
      .then((data) => {
        if (!cancelled) {
          setQrDataUrl(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [trimmed])

  if (!trimmed) {
    return null
  }

  return (
    <div className={['pb-keksQrPreview', className.trim()].filter(Boolean).join(' ')}>
      <div className="pb-keksQrPreview__row">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR kod za KEKS Pay"
            className="pb-keksQrPreview__img"
            width={220}
            height={220}
          />
        ) : (
          <div className="pb-keksQrPreview__loading" aria-live="polite">
            Generiram QR…
          </div>
        )}
        {showOpenLink ? (
          <div className="pb-keksQrPreview__actions">
            <a className="pb-btn pb-btn-primary" href={trimmed} target="_blank" rel="noopener noreferrer">
              Otvori KEKS Pay
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
