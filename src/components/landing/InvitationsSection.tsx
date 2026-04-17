import { useState } from 'react'
import { Link } from 'react-router-dom'

import { invitationTemplates } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

function InviteMockup({ template }: { template: typeof invitationTemplates[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="ew-invite-mockup"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div className="ew-invite-mockup__label">
          {hovered ? 'Print verzija' : 'Digitalna verzija'}
        </div>
        <div className="ew-invite-mockup__theme">{template.theme}</div>
        <img
          className="ew-invite-mockup__art"
          src={template.image}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="ew-invite-mockup__detail">
          {template.childName} puni {template.age}.<br />
          {template.date}<br />
          {template.venue}
        </div>
      </div>
      <div className="ew-invite-mockup__format-label">
        {hovered ? '↳ Print · PDF za pisač' : '↳ Link · WhatsApp / Viber'}
      </div>
    </article>
  )
}

export default function InvitationsSection() {
  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()

  return (
    <section id="pozivnice" className="ew-section ew-grain">
      <div className="ew-container">
        <div ref={headerRef} className="ew-invitations__header ew-reveal">
          <div>
            <div className="ew-eyebrow" style={{ marginBottom: 24 }}>Pozivnice</div>
            <h2 className="ew-h2">Kreiraj pozivnicu</h2>
          </div>
          <p className="ew-invitations__desc">
            Odaberi temu, unesi detalje, podijeli. Svaka pozivnica postoji i kao link i kao PDF za print.
          </p>
        </div>

        <div ref={gridRef} className="ew-invitations__grid ew-reveal">
          {invitationTemplates.map(t => (
            <InviteMockup key={t.id} template={t} />
          ))}
        </div>

        <div className="ew-invitations__benefits">
          <span className="ew-invitations__benefit">
            <svg className="ew-invitations__benefit-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Gotova za 2 minute
          </span>
          <span className="ew-invitations__benefit">
            <svg className="ew-invitations__benefit-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dijeli linkom
          </span>
          <span className="ew-invitations__benefit">
            <svg className="ew-invitations__benefit-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Gosti potvrđuju dolazak
          </span>
        </div>

        <Link to="/kreiraj-pozivnicu" className="ew-btn-primary">
          Isprobaj besplatno
        </Link>
      </div>
    </section>
  )
}
