import { useCallback, useRef, useState } from 'react'

type PreviewMode = 'digital' | 'print'

export default function HeroInvitationPreview() {
  const [mode, setMode] = useState<PreviewMode>('digital')
  const [locked, setLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const captions: Record<PreviewMode, string> = {
    digital: 'Ovako je gosti dobivaju linkom',
    print: 'Ovako ide u vrtićki ormarić',
  }

  const handleHover = useCallback((target: PreviewMode) => {
    if (!locked) setMode(target)
  }, [locked])

  const handleClick = useCallback((target: PreviewMode) => {
    setMode(target)
    setLocked(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next: PreviewMode = mode === 'digital' ? 'print' : 'digital'
      setMode(next)
      setLocked(true)
      // Focus the correct button
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('.ew-hero-visual__dot')
      if (buttons) {
        const idx = next === 'digital' ? 0 : 1
        buttons[idx]?.focus()
      }
    }
  }, [mode])

  return (
    <div className="ew-hero-visual" ref={containerRef}>
      {/* Digital preview */}
      <div
        className={`ew-hero-visual__preview ${mode === 'digital' ? 'ew-hero-visual__preview--active' : 'ew-hero-visual__preview--inactive'}`}
        aria-hidden={mode !== 'digital'}
        id="preview-digital"
      >
        <div className="ew-digital-card">
          <div className="ew-digital-card__bar">
            <span>9:41</span>
            <div className="ew-digital-card__bar-dots">
              <span /><span /><span />
            </div>
          </div>
          <div className="ew-digital-card__chat-head">
            <div className="ew-digital-card__avatar">M</div>
            <div>
              <span className="ew-digital-card__chat-name">Maja poslala pozivnicu</span>
              <small className="ew-digital-card__chat-url">vidimose.hr/lara-6</small>
            </div>
          </div>
          <div className="ew-digital-card__invite">
            <div className="ew-digital-card__invite-label">Pozivnica</div>
            <div>
              <div className="ew-digital-card__invite-sublabel">Slaviš</div>
              <div className="ew-digital-card__invite-title">Lara<br />puni šest.</div>
            </div>
            <div className="ew-digital-card__invite-when">
              Subota, 14.5.<br />
              Balončić, Zagreb<br />
              15:00
            </div>
          </div>
          <div className="ew-digital-card__rsvp">
            <button className="ew-digital-card__rsvp-btn ew-digital-card__rsvp-btn--yes" tabIndex={-1}>Dolazimo</button>
            <button className="ew-digital-card__rsvp-btn ew-digital-card__rsvp-btn--no" tabIndex={-1}>Ne možemo</button>
          </div>
        </div>
      </div>

      {/* Print preview */}
      <div
        className={`ew-hero-visual__preview ${mode === 'print' ? 'ew-hero-visual__preview--active' : 'ew-hero-visual__preview--inactive'}`}
        aria-hidden={mode !== 'print'}
        id="preview-print"
      >
        <div className="ew-print-wrapper">
          <div className="ew-print-card">
            <div className="ew-print-card__header">
              <div className="ew-print-card__small">Pozivnica</div>
              <div className="ew-print-card__number">06</div>
            </div>
            <div className="ew-print-card__main">
              <div className="ew-print-card__eyebrow">Slaviš sa mnom</div>
              <div className="ew-print-card__title">Lara<br />puni šest.</div>
              <div className="ew-print-card__divider" />
              <div className="ew-print-card__detail">
                Subota, 14. svibnja<br />
                Igraonica Balončić, Zagreb<br />
                Ilica 142 · 15:00 — 17:30
              </div>
            </div>
            <div className="ew-print-card__footer">vidimose.hr · potvrdi dolazak</div>
          </div>
        </div>
      </div>

      {/* Caption + toggle dots */}
      <div className="ew-hero-visual__caption-area">
        <div className="ew-hero-visual__caption" aria-live="polite">
          {captions[mode]}
        </div>
        <div className="ew-hero-visual__dots" role="group" aria-label="Odaberi vrstu pregleda" onKeyDown={handleKeyDown}>
          <button
            className={`ew-hero-visual__dot${mode === 'digital' ? ' ew-hero-visual__dot--active' : ''}`}
            aria-pressed={mode === 'digital'}
            aria-controls="preview-digital"
            onMouseEnter={() => handleHover('digital')}
            onClick={() => handleClick('digital')}
          >
            Digitalno
          </button>
          <button
            className={`ew-hero-visual__dot${mode === 'print' ? ' ew-hero-visual__dot--active' : ''}`}
            aria-pressed={mode === 'print'}
            aria-controls="preview-print"
            onMouseEnter={() => handleHover('print')}
            onClick={() => handleClick('print')}
          >
            Za print
          </button>
        </div>
      </div>
    </div>
  )
}
