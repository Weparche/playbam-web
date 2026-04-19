import { useEffect, useId, useState } from 'react'

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
  const { sessionLogin } = useAuth()
  const titleId = useId()
  const [loginSubStep, setLoginSubStep] = useState<'email_name' | 'verify_code'>('email_name')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpCode, setOtpCode] = useState('')

  useEffect(() => {
    if (!open) {
      setLoginSubStep('email_name')
      setOtpCode('')
      setOtpError('')
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

  const handleSendOtp = async () => {
    const email = identityDraft.email.trim().toLowerCase()
    const parentName = identityDraft.parentName.trim()
    if (!email || !parentName) {
      setOtpError('Upiši e-mail adresu i ime.')
      return
    }
    setOtpSending(true)
    setOtpError('')
    try {
      await sendOtp(email, parentName)
      setLoginSubStep('verify_code')
    } catch (err) {
      setOtpError(isApiError(err) ? (err as Error).message : 'Greška pri slanju koda. Pokušaj ponovno.')
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
    } catch (err) {
      setOtpError(isApiError(err) ? (err as Error).message : 'Netočan kod. Pokušaj ponovno.')
    } finally {
      setOtpVerifying(false)
    }
  }

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
            {step === 'login' && loginSubStep === 'email_name' && 'Prijava za potvrdu dolaska'}
            {step === 'login' && loginSubStep === 'verify_code' && 'Unesi kod'}
            {step === 'profile' && 'Tvoja obitelj'}
            {step === 'request' && 'Zahtjev za pristup'}
            {step === 'waiting' && 'Zahtjev je poslan'}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">
            ×
          </button>
        </div>

        <div className="pb-modalDialog__body">
          {step === 'login' && loginSubStep === 'email_name' ? (
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
              {(otpError || authError) ? <div className="pb-inlineNote pb-inlineNote--error">{otpError || authError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleSendOtp} disabled={otpSending}>
                  {otpSending ? 'Šaljemo...' : 'Pošalji kod na e-mail'}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'login' && loginSubStep === 'verify_code' ? (
            <>
              <p className="pb-modalDialog__lead">
                Poslali smo kod na <strong>{identityDraft.email}</strong>. Unesi ga ispod — vrijedi 10 minuta.
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
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
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
                  onClick={() => { setLoginSubStep('email_name'); setOtpCode(''); setOtpError('') }}
                >
                  Promijeni e-mail ili zatraži novi kod
                </button>
              </p>
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
