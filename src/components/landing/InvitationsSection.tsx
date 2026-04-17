import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { invitationTemplates } from '../../lib/landing-data'
import type { InvitationTemplate } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

function InviteLightbox({
  template,
  onClose,
}: {
  template: InvitationTemplate
  onClose: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="ew-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Pozivnica — ${template.theme}`}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="ew-lightbox__panel">
        <button
          className="ew-lightbox__close"
          onClick={onClose}
          aria-label="Zatvori"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="ew-lightbox__img-wrap">
          <img
            src={template.fullImage}
            alt={`Pozivnica ${template.theme} — ${template.childName}`}
            className="ew-lightbox__img"
            draggable={false}
          />
        </div>

        <div className="ew-lightbox__footer">
          <div className="ew-lightbox__info">
            <span className="ew-lightbox__theme">{template.theme}</span>
            <span className="ew-lightbox__detail">
              {template.childName} · {template.date} · {template.time}
            </span>
          </div>
          <Link
            to="/kreiraj-pozivnicu"
            className="ew-btn-primary ew-lightbox__cta"
            onClick={onClose}
          >
            Napravi ovakvu pozivnicu
          </Link>
        </div>
      </div>
    </div>
  )
}

function InviteMockup({
  template,
  onOpen,
}: {
  template: InvitationTemplate
  onOpen: () => void
}) {
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
        <button
          className="ew-invite-mockup__preview-btn"
          onClick={onOpen}
          aria-label={`Pogledaj pozivnicu ${template.theme} u punoj veličini`}
        >
          <img
            className="ew-invite-mockup__art"
            src={template.image}
            alt={`Tema ${template.theme}`}
            loading="lazy"
            decoding="async"
          />
          <span className="ew-invite-mockup__zoom-hint" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 6.5v5M6.5 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Pogledaj pozivnicu
          </span>
        </button>
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
  const [openTemplate, setOpenTemplate] = useState<InvitationTemplate | null>(null)
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
            <InviteMockup
              key={t.id}
              template={t}
              onOpen={() => setOpenTemplate(t)}
            />
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

      {openTemplate && (
        <InviteLightbox
          template={openTemplate}
          onClose={() => setOpenTemplate(null)}
        />
      )}
    </section>
  )
}
