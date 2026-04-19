import { useEffect, useId, useState } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { isApiError, sendOtp, verifyOtp } from '../../lib/invitationApi'
import { writeStoredSession } from '../../lib/vidimoseSession'

type Props = {
  open: boolean
  title?: string
  lead?: string
  onSuccess: () => void
  onClose?: () => void
}

export default function OtpLoginModal({ open, title = 'Prijava', lead, onSuccess, onClose }: Props) {
  const { sessionLogin } = useAuth()
  const titleId = useId()

  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  const [step, setStep] = useState<'email_name' | 'verify_code'>('email_name')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSubmit = isEmailValid && name.trim().length > 0

  if (!open) return null

  const handleSendOtp = async () => {
    if (!email.trim() || !name.trim()) {
      setError('Upiši e-mail adresu i ime.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendOtp(email.trim().toLowerCase(), name.trim())
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
      onSuccess()
    } catch (err) {
      setError(isApiError(err) ? (err as Error).message : 'Netočan kod. Pokušaj ponovno.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'email_name') handleSendOtp()
      else handleVerifyOtp()
    }
  }

  return (
    <div
      className="pb-modalOverlay"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="pb-modalDialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pb-modalDialog__head">
          <h2 id={titleId} className="pb-modalDialog__title">
            {step === 'email_name' ? title : 'Unesi kod'}
          </h2>
          {onClose && (
            <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori">×</button>
          )}
        </div>
        <div className="pb-modalDialog__body">
          {step === 'email_name' ? (
            <>
              {lead && <p className="pb-modalDialog__lead">{lead}</p>}
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
                <label className="pb-formField">
                  <span className="pb-formLabel">Ime mame ili tate</span>
                  <input
                    className="pb-input"
                    type="text"
                    autoComplete="name"
                    placeholder="Ana Horvat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </div>
              {error && <div className="pb-inlineNote pb-inlineNote--error">{error}</div>}
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" onClick={handleSendOtp} disabled={loading || !canSubmit}>
                  {loading ? 'Šaljemo...' : 'Prijavi se'}
                </Button>
              </div>
            </>
          ) : (
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
                  onClick={() => { setStep('email_name'); setCode(''); setError('') }}
                >
                  Promijeni e-mail ili zatraži novi kod
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
