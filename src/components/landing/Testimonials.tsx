import { testimonials } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

export default function Testimonials() {
  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()

  return (
    <section className="ew-section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="ew-container">
        <div ref={headerRef} className="ew-reveal">
          <div className="ew-eyebrow" style={{ marginBottom: 24 }}>Roditelji</div>
          <h2 className="ew-h2" style={{ maxWidth: '20ch' }}>Što kažu oni koji su već probali.</h2>
        </div>

        <div ref={gridRef} className="ew-testimonials__grid ew-reveal">
          {testimonials.map(t => (
            <article key={t.name} className="ew-testimonial-card">
              <p className="ew-testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="ew-testimonial-card__author">
                <div className="ew-testimonial-card__monogram" aria-hidden="true">{t.monogram}</div>
                <div>
                  <div className="ew-testimonial-card__name">{t.name}</div>
                  <div className="ew-testimonial-card__detail">{t.childAge} · {t.city}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
