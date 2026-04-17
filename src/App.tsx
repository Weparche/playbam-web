import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import CreateInvitationPage from './pages/CreateInvitationPage'
import LandingPage from './pages/LandingPage'
import SharedInvitationPage from './pages/SharedInvitationPage'
import VenueDetailPage from './pages/VenueDetailPage'
import VenuesPage from './pages/VenuesPage'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kreiraj-pozivnicu" element={<CreateInvitationPage />} />
          <Route path="/igraonice" element={<VenuesPage />} />
          <Route path="/igraonice/:slug" element={<VenueDetailPage />} />
          <Route path="/pozivnica-demo" element={<Navigate to="/pozivnica/luka-istrazivaci" replace />} />
          <Route path="/pozivnica/:token" element={<SharedInvitationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
