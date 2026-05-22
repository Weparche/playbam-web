import { Link, Navigate } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import '../styles/partner.css'

export default function PartnerLoginPage() {
  const { user, loginAsOwner, loginAsAnimator } = usePartnerAuth()

  if (user) {
    return <Navigate to="/partner" replace />
  }

  return (
    <div className="partner-login ew-grain">
      <div className="partner-login__shell">
        <Link to="/" className="partner-login__logo" aria-label="VidimoSe.hr — početna">
          <img src="/logo.png" alt="" width={180} height={48} />
        </Link>

        <div className="partner-login__card">
          <p className="partner-login__kicker">Partner zona</p>
          <h1 className="partner-login__title">Upravljanje igraonicom</h1>
          <p className="partner-login__text">
            Demo prijava za vlasnika ili animatora. Podaci su lokalni mock dok ne spojimo Cloudflare D1 API.
          </p>
          <div className="partner-login__actions">
            <Button type="button" onClick={loginAsOwner}>
              Prijavi se kao vlasnik
            </Button>
            <Button variant="ghost" type="button" onClick={loginAsAnimator}>
              Prijavi se kao animator
            </Button>
          </div>
          <p className="partner-login__footnote">
            <Link to="/">Natrag na VidimoSe.hr</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
