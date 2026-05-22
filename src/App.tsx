import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import MobileFooterNav from './components/layout/MobileFooterNav'
import PwaInstallPrompt from './components/layout/PwaInstallPrompt'
import { PartnerAuthProvider } from './partner/context/PartnerAuthContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const CreateInvitationPage = lazy(() => import('./pages/CreateInvitationPage'))
const VenuesPage = lazy(() => import('./pages/VenuesPage'))
const VenueDetailPage = lazy(() => import('./pages/VenueDetailPage'))
const ParksPage = lazy(() => import('./pages/ParksPage'))
const ParkDetailPage = lazy(() => import('./pages/ParkDetailPage'))
const MojVidimosePage = lazy(() => import('./pages/MojVidimosePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const SharedInvitationPage = lazy(() => import('./pages/SharedInvitationPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const CookiesPage = lazy(() => import('./pages/CookiesPage'))

const PartnerLayout = lazy(() => import('./partner/components/layout/PartnerLayout'))
const PartnerLoginPage = lazy(() => import('./partner/pages/PartnerLoginPage'))
const PartnerDashboardPage = lazy(() => import('./partner/pages/PartnerDashboardPage'))
const PartnerCalendarPage = lazy(() => import('./partner/pages/PartnerCalendarPage'))
const PartnerReservationsPage = lazy(() => import('./partner/pages/PartnerReservationsPage'))
const PartnerReservationDetailPage = lazy(() => import('./partner/pages/PartnerReservationDetailPage'))
const PartnerPackagesPage = lazy(() => import('./partner/pages/PartnerPackagesPage'))
const PartnerAddonsPage = lazy(() => import('./partner/pages/PartnerAddonsPage'))
const PartnerAnimatorsPage = lazy(() => import('./partner/pages/PartnerAnimatorsPage'))
const PartnerCustomersPage = lazy(() => import('./partner/pages/PartnerCustomersPage'))
const PartnerCustomerDetailPage = lazy(() => import('./partner/pages/PartnerCustomerDetailPage'))
const PartnerSettingsPage = lazy(() => import('./partner/pages/PartnerSettingsPage'))
const PartnerOwnerGate = lazy(() => import('./partner/components/layout/PartnerOwnerGate'))

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
            <Route path="/djecji-parkovi/:slug" element={<ParkDetailPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/uvjeti-koristenja" element={<TermsPage />} />
            <Route path="/privatnost" element={<PrivacyPage />} />
            <Route path="/kolacici" element={<CookiesPage />} />
            <Route path="/moj-vidimose" element={<MojVidimosePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pozivnica-demo" element={<Navigate to="/kreiraj-pozivnicu" replace />} />
            <Route path="/pozivnica/:token" element={<SharedInvitationPage />} />

            <Route
              path="/partner/login"
              element={
                <PartnerAuthProvider>
                  <PartnerLoginPage />
                </PartnerAuthProvider>
              }
            />
            <Route
              path="/partner"
              element={
                <PartnerAuthProvider>
                  <PartnerLayout />
                </PartnerAuthProvider>
              }
            >
              <Route index element={<PartnerDashboardPage />} />
              <Route path="calendar" element={<PartnerCalendarPage />} />
              <Route path="reservations" element={<PartnerReservationsPage />} />
              <Route path="reservations/:id" element={<PartnerReservationDetailPage />} />
              <Route path="packages" element={<PartnerOwnerGate><PartnerPackagesPage /></PartnerOwnerGate>} />
              <Route path="addons" element={<PartnerOwnerGate><PartnerAddonsPage /></PartnerOwnerGate>} />
              <Route path="animators" element={<PartnerOwnerGate><PartnerAnimatorsPage /></PartnerOwnerGate>} />
              <Route path="customers" element={<PartnerOwnerGate><PartnerCustomersPage /></PartnerOwnerGate>} />
              <Route path="customers/:id" element={<PartnerOwnerGate><PartnerCustomerDetailPage /></PartnerOwnerGate>} />
              <Route path="settings" element={<PartnerOwnerGate><PartnerSettingsPage /></PartnerOwnerGate>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <PwaInstallPrompt />
        <MobileFooterNav />
      </BrowserRouter>
    </AuthProvider>
  )
}
