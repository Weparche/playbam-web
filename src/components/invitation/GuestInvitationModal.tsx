import { useEffect, useId, useState } from 'react'

import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import Button from '../ui/Button'
import FamilyProfileForm, { type FamilyProfileDraft } from './FamilyProfileForm'
import type { TemporaryWebIdentity } from '../../lib/tempWebIdentity'
import type { FamilyProfileResponse, MembershipRequest } from '../../lib/invitationApi'
import { isApiError, sendOtp, verifyOtp } from '../../lib/invitationApi'
import { writeStoredSession } from '../../lib/vidimoseSession'
import { useAuth } from '../../context/AuthContext'

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
  isBirthInvitation: boolean
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
  isBirthInvitation,
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
  const { sessionLogin } = useAuth()
  const titleId = useId()
  const [loginSubStep, setLoginSubStep] = useState<'email' | 'verify_code'>('email')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpCode, setOtpCode] = useState('')

  useEffect(() => {
    if (!open) {
      setLoginSubStep('email')
      setOtpCode('')
      setOtpError('')
      return
    }
    lockScroll()
    return () => {
      unlockScroll()
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    if (open) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityDraft.email.trim())

  const handleSendOtp = async () => {
    const email = identityDraft.email.trim().toLowerCase()
    if (!email) {
      setOtpError('Upiši e-mail adresu.')
      return
    }

    setOtpSending(true)
    setOtpError('')

    try {
      await sendOtp(email)
      setLoginSubStep('verify_code')
    } catch (error) {
      setOtpError(isApiError(error) ? (error as Error).message : 'Greška pri slanju koda. Pokušaj ponovno.')
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setOtpError('Upiši kod.')
      return
    }

    setOtpVerifying(true)
    setOtpError('')

    try {
      const session = await verifyOtp(identityDraft.email.trim().toLowerCase(), otpCode.trim())
      writeStoredSession(session)
      sessionLogin(session)
      onLogin()
    } catch (error) {
      setOtpError(isApiError(error) ? (error as Error).message : 'Netočan kod. Pokušaj ponovno.')
    } finally {
      setOtpVerifying(false)
    }
  }

  if (!open) {
    return null
  }

  const familySummary =
    familyProfile && familyProfile.children.length > 0
      ? familyProfile.children.map((child) => `${child.name} (${child.age})`).join(', ')
      : 'Bez prijavljene djece'

  return (
    <div
      className="pb-modalOverlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="pb-modalDialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pb-modalDialog__head">
          <h2 id={titleId} className="pb-modalDialog__title">
            {step === 'login' && loginSubStep === 'email' && 'Prijava za potvrdu dolaska'}
            {step === 'login' && loginSubStep === 'verify_code' && 'Unesi kod'}
            {step === 'profile' && (isBirthInvitation ? 'Tvoji podaci' : 'Tvoja obitelj')}
            {step === 'request' && 'Zahtjev za pristup'}
            {step === 'waiting' && 'Zahtjev je poslan'}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">
            ×
          </button>
        </div>

        <div className="pb-modalDialog__body">
          {step === 'login' && loginSubStep === 'email' ? (
            <>
              <p className="pb-modalDialog__lead">
                Za potvrdu dolaska i pristup privatnom dijelu trebamo tvoj kontakt. Poslat ćemo ti jednokratni kod.
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
                    onChange={(event) => onIdentityChange({ ...identityDraft, email: event.target.value })}
                  />
                </label>
              </div>
              {otpError || authError ? <div className="pb-inlineNote pb-inlineNote--error">{otpError || authError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleSendOtp} disabled={otpSending || !isEmailValid}>
                  {otpSending ? 'Šaljemo...' : 'Prijavi se'}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'login' && loginSubStep === 'verify_code' ? (
            <>
              <p className="pb-modalDialog__lead">
                Poslali smo kod na <strong>{identityDraft.email}</strong>. Unesi ga ispod, vrijedi 10 minuta.
              </p>
              <div className="pb-formGrid">
                <label className="pb-formField">
                  <span className="pb-formLabel">Kod (6 znamenki)</span>
                  <input
                    className="pb-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </label>
              </div>
              {otpError ? <div className="pb-inlineNote pb-inlineNote--error">{otpError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleVerifyOtp} disabled={otpVerifying}>
                  {otpVerifying ? 'Provjeravamo...' : 'Potvrdi kod'}
                </Button>
              </div>
              <p className="pb-helperText pb-helperText--modal">
                <button
                  type="button"
                  className="pb-inlineLink"
                  onClick={() => {
                    setLoginSubStep('email')
                    setOtpCode('')
                    setOtpError('')
                  }}
                >
                  Promijeni e-mail ili zatraži novi kod
                </button>
              </p>
            </>
          ) : null}

          {step === 'profile' ? (
            <>
              <p className="pb-modalDialog__lead">
                {isBirthInvitation
                  ? 'Upiši kako želiš da te domaćin prepozna u potvrdi dolaska.'
                  : 'Dodaj djecu koja dolaze na proslavu, podaci se koriste i za zahtjev organizatoru.'}
              </p>
              <FamilyProfileForm
                draft={profileDraft}
                error={profileError}
                saving={savingProfile}
                mode={isBirthInvitation ? 'birth' : 'standard'}
                onChange={onProfileChange}
                onSave={onProfileSave}
              />
            </>
          ) : null}

          {step === 'request' && familyProfile ? (
            <>
              <p className="pb-modalDialog__lead">
                {membershipRequest?.status === 'rejected'
                  ? isBirthInvitation
                    ? 'Prijašnji zahtjev je odbijen. Možeš poslati novi zahtjev za pristup privatnom dijelu pozivnice.'
                    : 'Prijašnji zahtjev je odbijen. Možeš odabrati djecu i ponovno poslati novi zahtjev za pristup.'
                  : isBirthInvitation
                    ? 'Pošalji zahtjev organizatoru kako bi dobio pristup privatnom dijelu pozivnice.'
                    : 'Odaberi koja djeca žele pristup privatnom dijelu pozivnice. Organizator mora odobriti.'}
              </p>

              <div className="pb-summaryCard pb-summaryCard--modal">
                <div className="pb-summaryCard__title">{isBirthInvitation ? 'Tvoji podaci' : 'Obiteljski profil'}</div>
                <div className="pb-summaryCard__line">
                  {isBirthInvitation ? 'Ime' : 'Roditelj'}: {familyProfile.profile?.parentName}
                </div>
                {!isBirthInvitation ? <div className="pb-summaryCard__line">Djeca: {familySummary}</div> : null}
              </div>

              {!isBirthInvitation ? (
                <div className="pb-checkList" role="group" aria-label="Odaberi djecu za zahtjev pristupa">
                  {familyProfile.children.map((child) => (
                    <label key={child.id} className="pb-checkItem">
                      <input
                        type="checkbox"
                        checked={selectedChildIds.includes(child.id)}
                        onChange={(event) => onToggleChild(child.id, event.target.checked)}
                        disabled={membershipRequest?.status === 'pending'}
                      />
                      <span>
                        {child.name} ({child.age})
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {membershipRequest?.status === 'pending' ? (
                <div className="pb-inlineNote pb-inlineNote--info">Zahtjev je već poslan organizatoru.</div>
              ) : null}
              {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button
                  type="button"
                  onClick={onRequestSubmit}
                  disabled={
                    (!isBirthInvitation && selectedChildIds.length === 0) ||
                    membershipRequest?.status === 'pending' ||
                    submittingRequest
                  }
                >
                  {submittingRequest
                    ? 'Šaljemo...'
                    : membershipRequest?.status === 'rejected'
                      ? 'Pošalji novi zahtjev'
                      : 'Pošalji zahtjev organizatoru'}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'waiting' ? (
            <>
              <p className="pb-modalDialog__lead">
                Organizator još nije odobrio pristup. Kad odobri, moći ćeš potvrditi dolazak i vidjeti privatni dio pozivnice.
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
