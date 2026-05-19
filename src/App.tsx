import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const CreateInvitationPage = lazy(() => import('./pages/CreateInvitationPage'))
const VenuesPage = lazy(() => import('./pages/VenuesPage'))
const VenueDetailPage = lazy(() => import('./pages/VenueDetailPage'))
const ParksPage = lazy(() => import('./pages/ParksPage'))
const MojVidimosePage = lazy(() => import('./pages/MojVidimosePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const SharedInvitationPage = lazy(() => import('./pages/SharedInvitationPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const CookiesPage = lazy(() => import('./pages/CookiesPage'))

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

function RouteFallback() {
  return (
    <main className="pb-main pb-routeFallback" aria-live="polite">
      <div className="pb-container">
        Učitavam...
      </div>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/kreiraj-pozivnicu" element={<CreateInvitationPage />} />
            <Route path="/igraonice" element={<VenuesPage />} />
            <Route path="/igraonice/:slug" element={<VenueDetailPage />} />
            <Route path="/djecji-parkovi" element={<ParksPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/uvjeti-koristenja" element={<TermsPage />} />
            <Route path="/privatnost" element={<PrivacyPage />} />
            <Route path="/kolacici" element={<CookiesPage />} />
            <Route path="/moj-vidimose" element={<MojVidimosePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pozivnica-demo" element={<Navigate to="/pozivnica/luka-istrazivaci" replace />} />
            <Route path="/pozivnica/:token" element={<SharedInvitationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
