import { useEffect, useId } from 'react'

import Button from '../ui/Button'
import FamilyProfileForm, { type FamilyProfileDraft } from './FamilyProfileForm'
import type { TemporaryWebIdentity } from '../../lib/tempWebIdentity'
import type { FamilyProfileResponse, MembershipRequest } from '../../lib/invitationApi'

export type GuestModalStep = 'login' | 'profile' | 'request' | 'waiting'

export function getGuestModalStep(
  invitation: { id: string } | null,
  isHost: boolean,
  hasPrivateAccess: boolean,
  user: { email: string } | null,
  hasFamilyProfile: boolean,
  membershipRequest: MembershipRequest | null,
): GuestModalStep | null {
  if (!invitation || isHost || hasPrivateAccess) {
    return null
  }
  if (!user) {
    return 'login'
  }
  if (!hasFamilyProfile) {
    return 'profile'
  }
  if (membershipRequest?.status === 'pending') {
    return 'waiting'
  }
  return 'request'
}

type Props = {
  open: boolean
  onClose: () => void
  step: GuestModalStep
  identityDraft: TemporaryWebIdentity
  onIdentityChange: (draft: TemporaryWebIdentity) => void
  authError: string
  onLogin: () => void
  profileDraft: FamilyProfileDraft
  onProfileChange: (draft: FamilyProfileDraft) => void
  profileError: string
  savingProfile: boolean
  onProfileSave: () => void
  familyProfile: FamilyProfileResponse | null
  selectedChildIds: string[]
  onToggleChild: (childId: string, checked: boolean) => void
  membershipRequest: MembershipRequest | null
  requestError: string
  submittingRequest: boolean
  onRequestSubmit: () => void
}

export default function GuestInvitationModal({
  open,
  onClose,
  step,
  identityDraft,
  onIdentityChange,
  authError,
  onLogin,
  profileDraft,
  onProfileChange,
  profileError,
  savingProfile,
  onProfileSave,
  familyProfile,
  selectedChildIds,
  onToggleChild,
  membershipRequest,
  requestError,
  submittingRequest,
  onRequestSubmit,
}: Props) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (open) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="pb-modalOverlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="pb-modalDialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pb-modalDialog__head">
          <h2 id={titleId} className="pb-modalDialog__title">
            {step === 'login' && 'Prijava za potvrdu dolaska'}
            {step === 'profile' && 'Tvoja obitelj'}
            {step === 'request' && 'Zahtjev za pristup'}
            {step === 'waiting' && 'Zahtjev je poslan'}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">
            ×
          </button>
        </div>

        <div className="pb-modalDialog__body">
          {step === 'login' ? (
            <>
              <p className="pb-modalDialog__lead">
                Za potvrdu dolaska, rezervaciju poklona i privatni sadržaj trebamo tvoj kontakt. Podaci se spremaju u tvoj VidimoSe.hr profil.
              </p>
              <div className="pb-formGrid">
                <label className="pb-formField">
                  <span className="pb-formLabel">E-mail adresa</span>
                  <input
                    className="pb-input"
                    type="email"
                    autoComplete="email"
                    placeholder="ime@primjer.hr"
                    value={identityDraft.email}
                    onChange={(e) => onIdentityChange({ ...identityDraft, email: e.target.value })}
                  />
                </label>
                <label className="pb-formField">
                  <span className="pb-formLabel">Ime mame ili tate</span>
                  <input
                    className="pb-input"
                    type="text"
                    autoComplete="name"
                    placeholder="Ana Horvat"
                    value={identityDraft.parentName}
                    onChange={(e) => onIdentityChange({ ...identityDraft, parentName: e.target.value })}
                  />
                </label>
              </div>
              {authError ? <div className="pb-inlineNote pb-inlineNote--error">{authError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={onLogin}>
                  Nastavi
                </Button>
              </div>
              <p className="pb-helperText pb-helperText--modal">Privremeni web identitet, kasnije zamjena pravom prijavom.</p>
            </>
          ) : null}

          {step === 'profile' ? (
            <>
              <p className="pb-modalDialog__lead">Dodaj djecu koja dolaze na proslavu, podaci se koriste i za zahtjev organizatoru.</p>
              <FamilyProfileForm
                draft={profileDraft}
                error={profileError}
                saving={savingProfile}
                onChange={onProfileChange}
                onSave={onProfileSave}
              />
            </>
          ) : null}

          {step === 'request' && familyProfile ? (
            <>
              <p className="pb-modalDialog__lead">
                {membershipRequest?.status === 'rejected'
                  ? 'Prijašnji zahtjev je odbijen. Možeš odabrati djecu i ponovno poslati novi zahtjev za pristup.'
                  : 'Odaberi koja djeca žele pristup privatnom dijelu pozivnice (lista želja i sl.). Organizator mora odobriti.'}
              </p>
              <div className="pb-summaryCard pb-summaryCard--modal">
                <div className="pb-summaryCard__title">Obiteljski profil</div>
                <div className="pb-summaryCard__line">Roditelj: {familyProfile.profile?.parentName}</div>
                <div className="pb-summaryCard__line">
                  Djeca: {familyProfile.children.map((c) => `${c.name} (${c.age})`).join(', ')}
                </div>
              </div>
              <div className="pb-checkList" role="group" aria-label="Odaberi djecu za zahtjev pristupa">
                {familyProfile.children.map((child) => (
                  <label key={child.id} className="pb-checkItem">
                    <input
                      type="checkbox"
                      checked={selectedChildIds.includes(child.id)}
                      onChange={(e) => onToggleChild(child.id, e.target.checked)}
                      disabled={membershipRequest?.status === 'pending'}
                    />
                    <span>
                      {child.name} ({child.age})
                    </span>
                  </label>
                ))}
              </div>
              {membershipRequest?.status === 'pending' ? (
                <div className="pb-inlineNote pb-inlineNote--info">Zahtjev je već poslan organizatoru.</div>
              ) : null}
              {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button
                  type="button"
                  onClick={onRequestSubmit}
                  disabled={selectedChildIds.length === 0 || membershipRequest?.status === 'pending' || submittingRequest}
                >
                  {submittingRequest ? 'Šaljemo...' : membershipRequest?.status === 'rejected' ? 'Pošalji novi zahtjev' : 'Pošalji zahtjev organizatoru'}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'waiting' ? (
            <>
              <p className="pb-modalDialog__lead">
                Organizator još nije odobrio pristup. Kad odobri, moći ćeš potvrditi dolazak i vidjeti listu želja.
              </p>
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={onClose}>
                  Razumijem
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
