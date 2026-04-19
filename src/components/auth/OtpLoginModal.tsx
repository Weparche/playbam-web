import { useEffect, useId, useState } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import {
  isApiError,
  sendOtp,
  verifyOtp,
  getFamilyProfile,
  createFamilyProfile,
  updateFamilyProfile,
} from '../../lib/invitationApi'
import { writeStoredSession } from '../../lib/vidimoseSession'
import FamilyProfileForm, { type FamilyProfileDraft } from '../invitation/FamilyProfileForm'

type Props = {
  open: boolean
  onSuccess: () => void
  onClose?: () => void
}

type Step = 'email' | 'verify_code' | 'complete_profile'

const emptyDraft: FamilyProfileDraft = { parentName: '', children: [{ name: '', age: '' }] }

export default function OtpLoginModal({ open, onSuccess, onClose }: Props) {
  const { sessionLogin } = useAuth()
  const titleId = useId()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileDraft, setProfileDraft] = useState<FamilyProfileDraft>(emptyDraft)
  const [profileHasExisting, setProfileHasExisting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep('email')
      setEmail('')
      setCode('')
      setError('')
      setProfileDraft(emptyDraft)
      setProfileHasExisting(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !onClose || step === 'complete_profile') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  if (!open) return null

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSendOtp = async () => {
    if (!isEmailValid) { setError('Upiši ispravnu e-mail adresu.'); return }
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
    if (!code.trim()) { setError('Upiši kod.'); return }
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
              ? profileRes.children.map((c) => ({ id: c.id, name: c.name, age: String(c.age) }))
              : [{ name: '', age: '' }],
          })
        }
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
    const validChildren = profileDraft.children.filter((c) => c.name.trim() && c.age)
    if (!parentName) { setError('Upiši ime mame ili tate.'); return }
    if (validChildren.length === 0) { setError('Dodaj barem jedno dijete.'); return }
    setSavingProfile(true)
    setError('')
    try {
      const payload = {
        parentName,
        children: validChildren.map((c) => ({ ...(c.id ? { id: c.id } : {}), name: c.name.trim(), age: Number(c.age) })),
      }
      if (profileHasExisting) {
        await updateFamilyProfile(payload, null)
      } else {
        await createFamilyProfile(payload, null)
      }
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
    step === 'email' ? 'Prijava za VidimoSe.hr'
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
          {step === 'email' && (
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
              </div>
            </div>
          )}

          {step === 'verify_code' && (
            <>
              <p className="pb-modalDialog__lead">
                Poslali smo kod na <strong>{email}</strong>. Unesi ga ispod — vrijedi 10 minuta.
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
                Dodaj ime mame ili tate i djecu — koristimo za potvrdu dolaska.
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
