import { Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import MobileFooterNav from './components/layout/MobileFooterNav'
import PwaInstallPrompt from './components/layout/PwaInstallPrompt'
import RouteErrorBoundary from './components/layout/RouteErrorBoundary'
import { lazyWithRetry } from './lib/lazyWithRetry'
import { PartnerAuthProvider } from './partner/context/PartnerAuthContext'

const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'))
const CreateInvitationPage = lazyWithRetry(() => import('./pages/CreateInvitationPage'))
const VenuesPage = lazyWithRetry(() => import('./pages/VenuesPage'))
const VenueDetailPage = lazyWithRetry(() => import('./pages/VenueDetailPage'))
const ParksPage = lazyWithRetry(() => import('./pages/ParksPage'))
const ParkDetailPage = lazyWithRetry(() => import('./pages/ParkDetailPage'))
const MojVidimosePage = lazyWithRetry(() => import('./pages/MojVidimosePage'))
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'))
const SharedInvitationPage = lazyWithRetry(() => import('./pages/SharedInvitationPage'))
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'))
const ImpressumPage = lazyWithRetry(() => import('./pages/ImpressumPage'))
const TermsPage = lazyWithRetry(() => import('./pages/TermsPage'))
const PrivacyPage = lazyWithRetry(() => import('./pages/PrivacyPage'))
const CookiesPage = lazyWithRetry(() => import('./pages/CookiesPage'))

const PartnerLayout = lazyWithRetry(() => import('./partner/components/layout/PartnerLayout'))
const PartnerLoginPage = lazyWithRetry(() => import('./partner/pages/PartnerLoginPage'))
const PartnerDashboardPage = lazyWithRetry(() => import('./partner/pages/PartnerDashboardPage'))
const PartnerCalendarPage = lazyWithRetry(() => import('./partner/pages/PartnerCalendarPage'))
const PartnerReservationsPage = lazyWithRetry(() => import('./partner/pages/PartnerReservationsPage'))
const PartnerReservationDetailPage = lazyWithRetry(() => import('./partner/pages/PartnerReservationDetailPage'))
const PartnerPackagesPage = lazyWithRetry(() => import('./partner/pages/PartnerPackagesPage'))
const PartnerAddonsPage = lazyWithRetry(() => import('./partner/pages/PartnerAddonsPage'))
const PartnerAnimatorsPage = lazyWithRetry(() => import('./partner/pages/PartnerAnimatorsPage'))
const PartnerCustomersPage = lazyWithRetry(() => import('./partner/pages/PartnerCustomersPage'))
const PartnerCustomerDetailPage = lazyWithRetry(() => import('./partner/pages/PartnerCustomerDetailPage'))
const PartnerSettingsPage = lazyWithRetry(() => import('./partner/pages/PartnerSettingsPage'))
const PartnerOwnerGate = lazyWithRetry(() => import('./partner/components/layout/PartnerOwnerGate'))

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
        <RouteErrorBoundary>
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
        </RouteErrorBoundary>
        <PwaInstallPrompt />
        <MobileFooterNav />
      </BrowserRouter>
    </AuthProvider>
  )
}
