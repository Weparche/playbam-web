import CTABanner from '../components/landing/CTABanner'
import DualFormatNotes from '../components/landing/DualFormatNotes'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import InvitationsSection from '../components/landing/InvitationsSection'
import Navbar from '../components/landing/Navbar'
import Testimonials from '../components/landing/Testimonials'
import VenuesSection from '../components/landing/VenuesSection'

export default function LandingPage() {
  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>

      <Navbar />

      <main id="main">
        <Hero />
        <DualFormatNotes />
        <InvitationsSection />
        <VenuesSection />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>

      <Footer />
    </div>
  )
}
