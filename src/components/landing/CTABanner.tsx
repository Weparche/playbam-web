import { Link } from 'react-router-dom'

import { useScrollReveal } from './useScrollReveal'

export default function CTABanner() {
  const ref = useScrollReveal()

  return (
    <section className="ew-cta-banner ew-grain">
      <div ref={ref} className="ew-cta-banner__inner ew-reveal">
        <h2 className="ew-h2 ew-cta-banner__title">
          Sljedeći rođendan ne mora biti <em>projekt</em>.
        </h2>
        <p className="ew-cta-banner__sub">
          Napravi pozivnicu u dvije minute, pronađi igraonicu u svom gradu,
          i ostavi si vrijeme za ono što zapravo želiš — dan s djetetom.
        </p>
        <Link to="/kreiraj-pozivnicu" className="ew-btn-primary">
          Započni besplatno
        </Link>
      </div>
    </section>
  )
}
