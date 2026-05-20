import { useEffect, useId, useRef, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import {
  clearGoogleAuthCallbackState,
  completeGoogleAuth,
  isApiError,
  readGoogleAuthCallbackState,
  sendOtp,
  startGoogleAuth,
  verifyOtp,
} from '../../lib/invitationApi'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import type { TemporaryWebIdentity } from '../../lib/tempWebIdentity'
import { writeStoredSession } from '../../lib/vidimoseSession'
import Button from '../ui/Button'
import FamilyProfileForm, { type FamilyProfileDraft } from './FamilyProfileForm'
import type { GuestModalStep } from './guestModalStep'

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
}

type LoginSubStep = 'method_select' | 'email' | 'verify_code'

let guestGoogleCallbackInFlight = false

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.1 0 10.1-4.3 10.1-10.3 0-.7-.1-1.2-.2-1.7H12Z" />
      <path fill="#4285F4" d="M21.8 10.3H12v3.9h5.4c-.3 1.5-1.2 2.8-2.5 3.7l3 2.3c1.8-1.7 2.9-4.2 2.9-7.2 0-.7-.1-1.2-.2-1.7Z" />
      <path fill="#FBBC05" d="M6.1 14.3c-.2-.6-.4-1.4-.4-2.2s.1-1.5.4-2.2L3 7.5C2.4 8.8 2 10.3 2 12s.4 3.2 1 4.5l3.1-2.2Z" />
      <path fill="#34A853" d="M12 21.5c2.7 0 5-.9 6.6-2.4l-3-2.3c-.8.6-2 1.1-3.6 1.1-3.1 0-5.7-2.1-6.6-4.9L2.2 15.5c1.8 3.6 5.5 6 9.8 6Z" />
    </svg>
  )
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
}: Props) {
  const { sessionLogin } = useAuth()
  const titleId = useId()
  const onLoginRef = useRef(onLogin)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onLoginRef.current = onLogin
  }, [onLogin])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const [loginSubStep, setLoginSubStep] = useState<LoginSubStep>('method_select')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setLoginSubStep('method_select')
      setOtpCode('')
      setOtpError('')
      setGoogleLoading(false)
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
        onCloseRef.current()
      }
    }
    if (open) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open || step !== 'login' || guestGoogleCallbackInFlight) {
      return
    }

    const callbackState = readGoogleAuthCallbackState()
    if (callbackState.status !== 'callback' || callbackState.modal !== 'guest') {
      return
    }

    guestGoogleCallbackInFlight = true
    clearGoogleAuthCallbackState()

    let cancelled = false
    setLoginSubStep('method_select')
    setGoogleLoading(true)
    setOtpError('')

    void (async () => {
      try {
        const session = await completeGoogleAuth(callbackState)
        if (cancelled) {
          return
        }
        writeStoredSession(session)
        sessionLogin(session)
        onLoginRef.current()
      } catch (error) {
        if (cancelled) {
          return
        }
        const fallback = 'Google prijava trenutno nije uspjela. Pokušaj ponovno.'
        setOtpError(error instanceof Error && error.message.trim() ? error.message : fallback)
      } finally {
        guestGoogleCallbackInFlight = false
        if (!cancelled) {
          setGoogleLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, sessionLogin, step])

  if (!open) {
    return null
  }

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
    const email = identityDraft.email.trim().toLowerCase()
    if (!otpCode.trim()) {
      setOtpError('Upiši kod.')
      return
    }

    setOtpVerifying(true)
    setOtpError('')

    try {
      const session = await verifyOtp(email, otpCode.trim())
      writeStoredSession(session)
      sessionLogin(session)
      onLoginRef.current()
    } catch (error) {
      setOtpError(isApiError(error) ? (error as Error).message : 'Netočan kod. Pokušaj ponovno.')
    } finally {
      setOtpVerifying(false)
    }
  }

  const modalSteps: { id: GuestModalStep; label: string }[] = [
    { id: 'login', label: 'Prijava' },
    { id: 'profile', label: isBirthInvitation ? 'Podaci' : 'Obitelj' },
  ]
  const activeStepIndex = Math.max(modalSteps.findIndex((item) => item.id === step), 0)

  return (
    <div className="pb-modalOverlay pb-modalOverlay--guestFlow" role="presentation">
      <div className="pb-modalDialog pb-modalDialog--guestFlow" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pb-modalDialog__head">
          <h2 id={titleId} className="pb-modalDialog__title">
            {step === 'login' && loginSubStep === 'method_select' && 'Prijava za potvrdu dolaska'}
            {step === 'login' && loginSubStep === 'email' && 'Prijava e-mailom'}
            {step === 'login' && loginSubStep === 'verify_code' && 'Unesi kod'}
            {step === 'profile' && (isBirthInvitation ? 'Tvoji podaci' : 'Tvoja obitelj')}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">
            ×
          </button>
        </div>
        <ol className="pb-modalSteps pb-modalSteps--guestFlow" aria-label="Koraci prijave">
          {modalSteps.map((item, index) => (
            <li
              key={item.id}
              className={[
                'pb-modalSteps__item',
                index < activeStepIndex ? 'is-complete' : '',
                index === activeStepIndex ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              aria-current={index === activeStepIndex ? 'step' : undefined}
            >
              <span className="pb-modalSteps__dot">{index + 1}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>

        <div className="pb-modalDialog__body">
          {step === 'login' && loginSubStep === 'method_select' ? (
            <>
              <p className="pb-modalDialog__lead">
                Prijavi se kako bi potvrdio dolazak i otvorio privatni dio pozivnice.
              </p>
              <div className="pb-flowActions pb-flowActions--modal">
                <Button
                  type="button"
                  variant="ghost"
                  className="pb-authMethodButton"
                  leftIcon={<GoogleIcon />}
                  onClick={() => startGoogleAuth('guest')}
                  disabled={googleLoading}
                >
                  {googleLoading ? 'Povezujemo Google...' : 'Nastavi s Googleom'}
                </Button>
                <div className="pb-authMethodDivider" aria-hidden="true">
                  <span>ili</span>
                </div>
                <Button type="button" onClick={() => { setLoginSubStep('email'); setOtpError('') }}>
                  Nastavi e-mailom
                </Button>
              </div>
              <p className="pb-helperText pb-helperText--modal">
                Za prijavu e-mail adresom poslat ćemo ti jednokratni OTP kod.
              </p>
              {otpError || authError ? <div className="pb-inlineNote pb-inlineNote--error">{otpError || authError}</div> : null}
            </>
          ) : null}

          {step === 'login' && loginSubStep === 'email' ? (
            <>
              <p className="pb-modalDialog__lead">
                Za prijavu e-mail adresom poslat ćemo ti jednokratni OTP kod.
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
                    autoFocus
                  />
                </label>
              </div>
              {otpError || authError ? <div className="pb-inlineNote pb-inlineNote--error">{otpError || authError}</div> : null}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleSendOtp} disabled={otpSending || !isEmailValid}>
                  {otpSending ? 'Šaljemo...' : 'Prijavi se'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setLoginSubStep('method_select'); setOtpError('') }} disabled={otpSending}>
                  Natrag
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
                  ? 'Upiši kako te domaćin prepoznaje — odmah nakon spremanja možeš potvrditi dolazak.'
                  : 'Dodaj djecu koja dolaze. Nakon spremanja odmah ulaziš u pozivnicu.'}
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
        </div>
      </div>
    </div>
  )
}
