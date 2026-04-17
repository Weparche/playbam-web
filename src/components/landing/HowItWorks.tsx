import { Fragment } from 'react'

import { useScrollReveal } from './useScrollReveal'

const steps = [
  { number: '01', title: 'Odaberi datum i temu' },
  { number: '02', title: 'Pozovi goste linkom' },
  { number: '03', title: 'Rezerviraj igraonicu' },
] as const

export default function HowItWorks() {
  const headerRef = useScrollReveal()
  const stepsRef = useScrollReveal()

  return (
    <section id="kako-radi" className="ew-section">
      <div className="ew-container">
        <div ref={headerRef} className="ew-reveal">
          <div className="ew-eyebrow" style={{ marginBottom: 24 }}>Kako radi</div>
          <h2 className="ew-h2" style={{ maxWidth: '18ch' }}>Tri koraka do mirnijeg rođendana.</h2>
        </div>

        <div ref={stepsRef} className="ew-how__steps ew-reveal">
          {steps.map((step, i) => (
            <Fragment key={step.number}>
              <div className="ew-how__step">
                <div className="ew-how__step-number">{step.number}</div>
                <div className="ew-how__step-title">{step.title}</div>
              </div>
              {i < steps.length - 1 && <div className="ew-how__divider" aria-hidden="true" />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
