import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import OtpLoginModal from '../auth/OtpLoginModal'

type MobileFooterItem = {
  label: string
  to: string
  match: (pathname: string) => boolean
  icon: 'plus' | 'venues' | 'parks' | 'account'
}

const items: MobileFooterItem[] = [
  {
    label: 'Napravi pozivnicu',
    to: '/kreiraj-pozivnicu',
    match: (pathname) => pathname === '/kreiraj-pozivnicu',
    icon: 'plus',
  },
  {
    label: 'Igraonice',
    to: '/igraonice',
    match: (pathname) => pathname.startsWith('/igraonice'),
    icon: 'venues',
  },
  {
    label: 'Dječji parkovi',
    to: '/djecji-parkovi',
    match: (pathname) => pathname === '/djecji-parkovi',
    icon: 'parks',
  },
  {
    label: 'Moj VidimoSe',
    to: '/moj-vidimose',
    match: (pathname) => pathname === '/moj-vidimose',
    icon: 'account',
  },
]

function MobileFooterIcon({ icon }: { icon: MobileFooterItem['icon'] }) {
  if (icon === 'plus') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8.5h12.5v9H4z" />
        <path d="m4 9 6.25 4.5L16.5 9" />
        <path d="M18.5 4.5v4" />
        <path d="M16.5 6.5h4" />
        <path d="m19.9 10.2.9.9" />
      </svg>
    )
  }

  if (icon === 'venues') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-7h6v7" />
        <path d="M4 9h16" />
      </svg>
    )
  }

  if (icon === 'parks') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20V9" />
        <path d="M7 12a5 5 0 0 1 10 0" />
        <path d="M5 16c2.2-1.8 4.4-1.8 7 0 2.6-1.8 4.8-1.8 7 0" />
        <path d="M4 20h16" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

export default function MobileFooterNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <>
      <OtpLoginModal
        open={loginOpen}
        onSuccess={() => {
          setLoginOpen(false)
          navigate('/moj-vidimose')
        }}
        onClose={() => setLoginOpen(false)}
      />
      <nav className="pb-mobileFooterNav" aria-label="Brza mobilna navigacija">
        {items.map((item) => {
          const active = item.match(pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`pb-mobileFooterNav__link pb-mobileFooterNav__link--${item.icon} ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (item.icon !== 'account' || session) {
                  return
                }
                event.preventDefault()
                setLoginOpen(true)
              }}
            >
              <span className="pb-mobileFooterNav__icon">
                <MobileFooterIcon icon={item.icon} />
              </span>
              <span className="pb-mobileFooterNav__label">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
