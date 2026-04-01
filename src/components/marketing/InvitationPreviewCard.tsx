import LinkButton from '../ui/LinkButton'
import Card from '../ui/Card'
import type { MouseEvent } from 'react'

export default function InvitationPreviewCard() {
  const onOpen = (e: MouseEvent) => {
    // Pure client navigation is handled by router link, but keep hook here if needed.
    void e
  }

  return (
    <Card hover className="pb-invitePreview">
      <div className="pb-invitePreview__banner">
        <div className="pb-invitePreview__badge">Digitalna pozivnica</div>
        <div className="pb-invitePreview__title">
          Pozivamo te na rođendan
        </div>
        <div className="pb-invitePreview__meta">
          <div className="pb-invitePreview__row">
            <span className="pb-invitePreview__k">Ime</span>
            <span className="pb-invitePreview__v">Luka</span>
          </div>
          <div className="pb-invitePreview__row">
            <span className="pb-invitePreview__k">Datum</span>
            <span className="pb-invitePreview__v">22. rujna</span>
          </div>
          <div className="pb-invitePreview__row">
            <span className="pb-invitePreview__k">Vrijeme</span>
            <span className="pb-invitePreview__v">17:00</span>
          </div>
        </div>
      </div>

      <div className="pb-invitePreview__actions">
        <div className="pb-invitePreview__small">
          Pozvani vide javni pregled i prijavljuju se za pristup.
        </div>
        <LinkButton
          variant="amber"
          href="/pozivnica-demo"
          onClick={onOpen}
          className="pb-invitePreview__btn"
        >
          Otvori demo pozivnicu
        </LinkButton>
      </div>
    </Card>
  )
}


