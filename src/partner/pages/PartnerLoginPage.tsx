import { Navigate } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import '../styles/partner.css'

export default function PartnerLoginPage() {
  const { user, loginAsOwner, loginAsAnimator } = usePartnerAuth()

  if (user) {
    return <Navigate to="/partner" replace />
  }

  return (
    <div className="partner-login">
      <div className="partner-login__card">
        <h1 className="partner-login__title">Partner Console</h1>
        <p className="partner-login__text">
          Demo prijava za vlasnika igraonice ili animatora. Podaci su lokalni mock — kasnije Cloudflare D1 API.
        </p>
        <div className="partner-login__actions">
          <Button type="button" onClick={loginAsOwner}>
            Prijavi se kao vlasnik
          </Button>
          <Button variant="ghost" type="button" onClick={loginAsAnimator}>
            Prijavi se kao animator
          </Button>
        </div>
      </div>
    </div>
  )
}
