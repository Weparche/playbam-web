import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { venues } from '../../lib/landing-data'
import HeroInvitationPreview from './HeroInvitationPreview'

export default function Hero() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Trigger staggered reveal on mount
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const stagger = (delayMs: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 800ms cubic-bezier(0.4,0,0.2,1) ${delayMs}ms, transform 800ms cubic-bezier(0.4,0,0.2,1) ${delayMs}ms`,
  })

  const visualStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(40px)',
    transition: `opacity 1000ms cubic-bezier(0.4,0,0.2,1) 300ms, transform 1000ms cubic-bezier(0.4,0,0.2,1) 300ms`,
  }

  return (
    <section className="ew-hero ew-grain" ref={sectionRef}>
      <div className="ew-container ew-hero__grid">
        <div>
          <div className="ew-eyebrow ew-hero__eyebrow" style={stagger(0)}>
            Rođendani · Bez stresa
          </div>

          <h1 className="ew-h1 ew-hero__title" style={stagger(150)}>
            Rođendan kao{' '}
            <span className="ew-hero__title-accent">
              <em>mali ritual.</em>
            </span>
          </h1>

          <p className="ew-hero__sub" style={stagger(300)}>
            Kreiraj pozivnicu u dvije minute — pošalji linkom ili isprintaj i ubaci
            u vrtićki ormarić. Pronađi igraonicu u svom gradu. Sve na jednom mjestu.
          </p>

          <div className="ew-hero__ctas" style={stagger(450)}>
            <Link to="/kreiraj-pozivnicu" className="ew-btn-primary">
              Napravi pozivnicu
            </Link>
            <Link to="/igraonice" className="ew-hero__venue-pill">
              <span className="ew-hero__venue-avatars" aria-hidden="true">
                {venues.slice(0, 3).map(v => (
                  <img
                    key={v.id}
                    src={v.coverPhoto}
                    alt=""
                    className="ew-hero__venue-avatar"
                    loading="eager"
                    decoding="async"
                  />
                ))}
              </span>
              <span className="ew-hero__venue-pill-text">
                Pronađi igraonicu
              </span>
              <svg className="ew-hero__venue-pill-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="ew-hero__social" style={stagger(600)}>
            Više od 500 roditelja · 80+ igraonica diljem Hrvatske
          </div>
        </div>

        <div style={visualStyle}>
          <HeroInvitationPreview />
        </div>
      </div>
    </section>
  )
}
