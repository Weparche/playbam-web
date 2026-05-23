import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CTABanner from '../components/landing/CTABanner'
import Footer from '../components/landing/Footer'
import Hero from '../components/landing/Hero'
import InvitationFeaturesSection from '../components/landing/InvitationFeaturesSection'
import HowItWorks from '../components/landing/HowItWorks'
import Navbar from '../components/landing/Navbar'

const InvitationsSection = lazy(() => import('../components/landing/InvitationsSection'))
const VenuesSection = lazy(() => import('../components/landing/VenuesSection'))
const Testimonials = lazy(() => import('../components/landing/Testimonials'))
const FAQ = lazy(() => import('../components/landing/FAQ'))

export default function LandingPage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const el = document.getElementById(id)
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }, [hash])

  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>

      <Navbar opaque />

      <main id="main">
        <Hero />
        <InvitationFeaturesSection />
        <Suspense fallback={null}>
          <InvitationsSection />
          <VenuesSection />
        </Suspense>
        <HowItWorks />
        <Suspense fallback={null}>
          <Testimonials />
          <FAQ />
        </Suspense>
        <CTABanner />
      </main>

      <Footer />
    </div>
  )
}
