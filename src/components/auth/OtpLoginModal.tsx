import { useEffect, useId, useState } from 'react'

import { useAuth, markProfilePending, clearProfilePending } from '../../context/AuthContext'
import {
  clearGoogleAuthCallbackState,
  completeGoogleAuth,
  createFamilyProfile,
  getFamilyProfile,
  isApiError,
  readGoogleAuthCallbackState,
  sendOtp,
  startGoogleAuth,
  updateFamilyProfile,
  verifyOtp,
} from '../../lib/invitationApi'
import { writeStoredSession } from '../../lib/vidimoseSession'
import FamilyProfileForm, { type FamilyProfileDraft } from '../invitation/FamilyProfileForm'
import Button from '../ui/Button'

type Props = {
  open: boolean
  onSuccess: () => void
  onClose?: () => void
}

type Step = 'method_select' | 'email' | 'verify_code' | 'complete_profile'

const emptyDraft: FamilyProfileDraft = { parentName: '', children: [{ name: '', age: '' }] }

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

export default function OtpLoginModal({ open, onSuccess, onClose }: Props) {
  const { sessionLogin } = useAuth()
  const titleId = useId()

  const [step, setStep] = useState<Step>('method_select')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileDraft, setProfileDraft] = useState<FamilyProfileDraft>(emptyDraft)
  const [profileHasExisting, setProfileHasExisting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep('method_select')
      setEmail('')
      setCode('')
      setError('')
      setProfileDraft(emptyDraft)
      setProfileHasExisting(false)
      setGoogleLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !onClose || step === 'complete_profile') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  useEffect(() => {
    if (!open) {
      return
    }

    const callbackState = readGoogleAuthCallbackState()
    if (callbackState.status !== 'callback' || callbackState.modal !== 'otp') {
      return
    }

    let cancelled = false
    setStep('method_select')
    setGoogleLoading(true)
    setError('')

    void (async () => {
      try {
        const session = await completeGoogleAuth(callbackState)
        if (cancelled) {
          return
        }

        writeStoredSession(session)
        sessionLogin(session)

        const profileRes = await getFamilyProfile(null)
        if (cancelled) {
          return
        }

        const hasParentName = !!profileRes.profile?.parentName?.trim()
        const hasChildren = profileRes.children.length > 0

        clearGoogleAuthCallbackState()

        if (hasParentName && hasChildren) {
          onSuccess()
          return
        }

        setProfileHasExisting(!!profileRes.profile)
        if (profileRes.profile) {
          setProfileDraft({
            parentName: profileRes.profile.parentName || '',
            children: profileRes.children.length > 0
              ? profileRes.children.map((child) => ({
                  id: child.id,
                  name: child.name,
                  age: child.age == null ? '' : String(child.age),
                }))
              : [{ name: '', age: '' }],
          })
        }
        markProfilePending()
        setStep('complete_profile')
      } catch (err) {
        if (cancelled) {
          return
        }
        const fallback = 'Google prijava trenutno nije uspjela. Pokušaj ponovno.'
        setError(err instanceof Error && err.message.trim() ? err.message : fallback)
        clearGoogleAuthCallbackState()
      } finally {
        if (!cancelled) {
          setGoogleLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, onSuccess, sessionLogin])

  if (!open && step !== 'complete_profile') return null

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSendOtp = async () => {
    if (!isEmailValid) {
      setError('Upiši ispravnu e-mail adresu.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendOtp(email.trim().toLowerCase())
      setStep('verify_code')
    } catch (err) {
      setError(isApiError(err) ? (err as Error).message : 'Greška pri slanju koda. Pokušaj ponovno.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      setError('Upiši kod.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const session = await verifyOtp(email.trim().toLowerCase(), code.trim())
      writeStoredSession(session)
      sessionLogin(session)

      const profileRes = await getFamilyProfile(null)
      const hasParentName = !!profileRes.profile?.parentName?.trim()
      const hasChildren = profileRes.children.length > 0

      if (hasParentName && hasChildren) {
        onSuccess()
      } else {
        setProfileHasExisting(!!profileRes.profile)
        if (profileRes.profile) {
          setProfileDraft({
            parentName: profileRes.profile.parentName || '',
            children: profileRes.children.length > 0
              ? profileRes.children.map((child) => ({
                  id: child.id,
                  name: child.name,
                  age: child.age == null ? '' : String(child.age),
                }))
              : [{ name: '', age: '' }],
          })
        }
        markProfilePending()
        setStep('complete_profile')
      }
    } catch (err) {
      setError(isApiError(err) ? (err as Error).message : 'Netočan kod. Pokušaj ponovno.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    const parentName = profileDraft.parentName.trim()
    if (!parentName) {
      setError('Upiši ime mame ili tate.')
      return
    }
    const resolvedChildren = profileDraft.children
      .map((child) => ({
        ...(child.id ? { id: child.id } : {}),
        name: child.name.trim(),
        age: child.age.trim() === '' ? null : Number(child.age),
      }))
      .filter((child) => child.name || (child.age != null && Number.isFinite(child.age)))
    setSavingProfile(true)
    setError('')
    try {
      const payload = {
        parentName,
        children: resolvedChildren,
      }
      if (profileHasExisting) {
        await updateFamilyProfile(payload, null)
      } else {
        await createFamilyProfile(payload, null)
      }
      clearProfilePending()
      onSuccess()
    } catch (err) {
      setError(isApiError(err) ? (err as Error).message : 'Greška pri spremanju profila.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    if (step === 'email') handleSendOtp()
    else if (step === 'verify_code') handleVerifyOtp()
  }

  const title =
    step === 'method_select' ? 'Prijava za VidimoSe.hr'
    : step === 'email' ? 'Prijava e-mailom'
    : step === 'verify_code' ? 'Unesi kod'
    : 'Tvoja obitelj'

  return (
    <div className="pb-modalOverlay" role="presentation">
      <div className="pb-modalDialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pb-modalDialog__head">
          <h2 id={titleId} className="pb-modalDialog__title">{title}</h2>
          {onClose && step !== 'complete_profile' && (
            <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">×</button>
          )}
        </div>

        <div className="pb-modalDialog__body">
          {step === 'method_select' && (
            <>
              <p className="pb-modalDialog__lead">
                Odaberi način prijave. Ako odabereš e-mail, poslat ćemo ti jednokratni OTP kod.
              </p>
              <div className="pb-flowActions pb-flowActions--modal">
                <Button
                  type="button"
                  variant="ghost"
                  className="pb-authMethodButton"
                  leftIcon={<GoogleIcon />}
                  onClick={() => startGoogleAuth('otp')}
                  disabled={googleLoading}
                >
                  {googleLoading ? 'Povezujemo Google...' : 'Nastavi s Googleom'}
                </Button>
                <div className="pb-authMethodDivider" aria-hidden="true">
                  <span>ili</span>
                </div>
                <Button type="button" onClick={() => { setStep('email'); setError('') }}>
                  Nastavi e-mailom
                </Button>
              </div>
              <p className="pb-helperText pb-helperText--modal">
                Za prijavu e-mail adresom poslat ćemo ti jednokratni OTP kod.
              </p>
              {error && <div className="pb-inlineNote pb-inlineNote--error">{error}</div>}
            </>
          )}

          {step === 'email' && (
            <>
              <p className="pb-modalDialog__lead">
                Za prijavu e-mail adresom poslat ćemo ti jednokratni OTP kod.
              </p>
              <div className="pb-formGrid" onKeyDown={handleKeyDown}>
                <label className="pb-formField">
                  <span className="pb-formLabel">E-mail adresa</span>
                  <input
                    className="pb-input"
                    type="email"
                    autoComplete="email"
                    placeholder="ime@primjer.hr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </label>
                {error && <div className="pb-inlineNote pb-inlineNote--error">{error}</div>}
                <div className="pb-flowActions pb-flowActions--modal">
                  <Button type="button" onClick={handleSendOtp} disabled={loading || !isEmailValid}>
                    {loading ? 'Šaljemo...' : 'Prijavi se'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setStep('method_select'); setError('') }} disabled={loading}>
                    Natrag
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'verify_code' && (
            <>
              <p className="pb-modalDialog__lead">
                Poslali smo kod na <strong>{email}</strong>. Unesi ga ispod, vrijedi 10 minuta.
              </p>
              <div className="pb-formGrid" onKeyDown={handleKeyDown}>
                <label className="pb-formField">
                  <span className="pb-formLabel">Kod (6 znamenki)</span>
                  <input
                    className="pb-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </label>
              </div>
              {error && <div className="pb-inlineNote pb-inlineNote--error">{error}</div>}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? 'Provjeravamo...' : 'Potvrdi kod'}
                </Button>
              </div>
              <p className="pb-helperText pb-helperText--modal">
                <button
                  type="button"
                  className="pb-inlineLink"
                  onClick={() => { setStep('email'); setCode(''); setError('') }}
                >
                  Promijeni e-mail ili zatraži novi kod
                </button>
              </p>
            </>
          )}

          {step === 'complete_profile' && (
            <>
              <p className="pb-modalDialog__lead">
                Dodaj ime mame ili tate i djecu, koristimo za potvrdu dolaska.
              </p>
              <FamilyProfileForm
                draft={profileDraft}
                error={error}
                saving={savingProfile}
                onChange={setProfileDraft}
                onSave={handleSaveProfile}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
