import { Link } from 'react-router-dom'

import { venues } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

export default function VenuesSection() {
  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()

  return (
    <section id="igraonice" className="ew-section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="ew-container">
        <div ref={headerRef} className="ew-venues__header ew-reveal">
          <div className="ew-eyebrow" style={{ marginBottom: 24 }}>Igraonice</div>
          <h2 className="ew-h2" style={{ marginBottom: 16 }}>Pronađi igraonicu</h2>
          <p className="ew-body-lg" style={{ maxWidth: '52ch' }}>
            Pretraži po gradu, dobi djeteta i cijeni. Pronađi mjesto koje odgovara vašem danu.
          </p>
        </div>

        <div ref={gridRef} className="ew-venues__grid ew-reveal">
          {venues.slice(0, 6).map(venue => (
            <Link key={venue.id} to={`/igraonice/${venue.slug}`} className="ew-venue-card">
              <div className="ew-venue-card__img-wrap">
                <img
                  src={venue.coverPhoto}
                  alt={venue.name}
                  className="ew-venue-card__img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="ew-venue-card__overlay">
                  <span className="ew-venue-card__overlay-cta">Pogledaj →</span>
                </div>
              </div>
              <div className="ew-venue-card__body">
                <div className="ew-venue-card__name">{venue.name}</div>
                <div className="ew-venue-card__meta">
                  ★ {venue.rating} · {venue.pricePerChild}€/dijete · dob {venue.ageRange}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/igraonice" className="ew-btn-primary">Istraži sve igraonice</Link>
      </div>
    </section>
  )
}
