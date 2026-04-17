import { useState } from 'react'

import { venues } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

const ageChips = ['3–5', '6–8', '9–12'] as const

export default function VenuesSection() {
  const [city, setCity] = useState('')
  const [activeAges, setActiveAges] = useState<Set<string>>(new Set())
  const [priceMax, setPriceMax] = useState(200)

  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()

  const toggleAge = (age: string) => {
    setActiveAges(prev => {
      const next = new Set(prev)
      if (next.has(age)) next.delete(age)
      else next.add(age)
      return next
    })
  }

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

        {/* Search mockup */}
        <div className="ew-venues__search">
          <input
            type="text"
            className="ew-venues__search-input"
            placeholder="Zagreb, Split, Rijeka..."
            value={city}
            onChange={e => setCity(e.target.value)}
            aria-label="Pretraži grad"
          />
          <div className="ew-venues__chips">
            {ageChips.map(age => (
              <button
                key={age}
                className={`ew-venues__chip${activeAges.has(age) ? ' ew-venues__chip--active' : ''}`}
                onClick={() => toggleAge(age)}
                aria-pressed={activeAges.has(age)}
              >
                {age}
              </button>
            ))}
          </div>
          <div className="ew-venues__range">
            <span>20€</span>
            <input
              type="range"
              min={20}
              max={200}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              aria-label="Maksimalna cijena po djetetu"
            />
            <span>{priceMax}€/dijete</span>
          </div>
        </div>

        {/* Venue cards grid */}
        <div ref={gridRef} className="ew-venues__grid ew-reveal">
          {venues.map(venue => (
            <article key={venue.name} className="ew-venue-card">
              <div className="ew-venue-card__pattern" />
              <div className="ew-venue-card__body">
                <div className="ew-venue-card__name">{venue.name}</div>
                <div className="ew-venue-card__meta">
                  {venue.city} · ★ {venue.rating} · {venue.pricePerChild}€/dijete · dob {venue.ageRange}
                </div>
              </div>
            </article>
          ))}
        </div>

        <a href="#igraonice" className="ew-btn-primary">Istraži sve igraonice</a>
      </div>
    </section>
  )
}
