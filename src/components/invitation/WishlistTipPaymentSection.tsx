import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

import Button from '../ui/Button'
import type { InvitationPartyDetails } from '../../lib/invitationApi'

type Props = {
  partyDetails: InvitationPartyDetails | null | undefined
}

export default function WishlistTipPaymentSection({ partyDetails }: Props) {
  const keksUrl = partyDetails?.wishlistKeksPayUrl?.trim() ?? ''
  const iban = partyDetails?.wishlistBankIban?.trim() ?? ''
  const payImage = partyDetails?.wishlistPaymentImageUrl?.trim() ?? ''

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => {
    if (!keksUrl) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(keksUrl, { width: 200, margin: 2, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url)
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
  }, [keksUrl])

  if (!keksUrl && !iban && !payImage) {
    return null
  }

  const copyIban = async () => {
    if (!iban) {
      return
    }
    try {
      await navigator.clipboard.writeText(iban)
      setCopyDone(true)
      window.setTimeout(() => setCopyDone(false), 2000)
    } catch {
      setCopyDone(false)
    }
  }

  return (
    <div className="pb-wishlistTip">
      <h3 className="pb-wishlistTip__title">
        Uplati iznos po želji
      </h3>
      <p className="pb-wishlistTip__disclaimer">Uplata je dobrovoljna. Hvala na gesti.</p>

      {keksUrl ? (
        <div className="pb-wishlistTip__block">
          <p className="pb-wishlistTip__label">KEKS Pay</p>
          <div className="pb-wishlistTip__keksRow">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR kod za KEKS Pay" className="pb-wishlistTip__qr" width={200} height={200} />
            ) : (
              <div className="pb-wishlistTip__qrPlaceholder" aria-hidden>
                …
              </div>
            )}
            <div className="pb-wishlistTip__keksActions">
              <a className="pb-btn pb-btn-primary" href={keksUrl} target="_blank" rel="noopener noreferrer">
                Otvori KEKS Pay
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {iban || payImage ? (
        <div className="pb-wishlistTip__block">
          <p className="pb-wishlistTip__label">Bankovna uplata</p>
          {payImage ? (
            <img src={payImage} alt="Podaci za uplatu" className="pb-wishlistTip__payImage" loading="lazy" />
          ) : null}
          {iban ? (
            <div className="pb-wishlistTip__ibanRow">
              <code className="pb-wishlistTip__iban">{iban}</code>
              <Button type="button" variant="ghost" onClick={() => void copyIban()}>
                {copyDone ? 'Kopirano' : 'Kopiraj IBAN'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
