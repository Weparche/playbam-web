import { useState } from 'react'

import Button from '../ui/Button'
import KeksPayQrPreview from './KeksPayQrPreview'
import type { InvitationPartyDetails } from '../../lib/invitationApi'

type Props = {
  partyDetails: InvitationPartyDetails | null | undefined
}

export default function WishlistTipPaymentSection({ partyDetails }: Props) {
  const keksUrl = partyDetails?.wishlistKeksPayUrl?.trim() ?? ''
  const iban = partyDetails?.wishlistBankIban?.trim() ?? ''
  const payImage = partyDetails?.wishlistPaymentImageUrl?.trim() ?? ''

  const [copyDone, setCopyDone] = useState(false)

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

  const hasBank = Boolean(iban || payImage)

  return (
    <div className="pb-wishlistTip">
      <h3 className="pb-wishlistTip__title">Uplati iznos po želji</h3>
      <p className="pb-wishlistTip__disclaimer">Uplata je dobrovoljna. Hvala na gesti.</p>

      {keksUrl ? (
        <section className="pb-wishlistTip__panel pb-wishlistTip__panel--keks" aria-labelledby="wishlist-tip-keks">
          <h4 id="wishlist-tip-keks" className="pb-wishlistTip__panelTitle">
            KEKS Pay
          </h4>
          <p className="pb-wishlistTip__panelLead">Skeniraj QR ili otvori poveznicu u aplikaciji.</p>
          <KeksPayQrPreview url={keksUrl} showOpenLink />
        </section>
      ) : null}

      {keksUrl && hasBank ? <div className="pb-wishlistTip__sep" aria-hidden /> : null}

      {hasBank ? (
        <section className="pb-wishlistTip__panel pb-wishlistTip__panel--bank" aria-labelledby="wishlist-tip-bank">
          <h4 id="wishlist-tip-bank" className="pb-wishlistTip__panelTitle">
            Bankovna uplata (IBAN)
          </h4>
          <p className="pb-wishlistTip__panelLead">Podaci za uplatu u aplikaciji banke ili na šalteru.</p>
          {payImage ? (
            <img src={payImage} alt="Podaci za bankovnu uplatu" className="pb-wishlistTip__payImage" loading="lazy" />
          ) : null}
          {iban ? (
            <div className="pb-wishlistTip__ibanRow">
              <code className="pb-wishlistTip__iban">{iban}</code>
              <Button type="button" variant="ghost" onClick={() => void copyIban()}>
                {copyDone ? 'Kopirano' : 'Kopiraj IBAN'}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
