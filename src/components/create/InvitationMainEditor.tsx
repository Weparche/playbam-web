import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties as ReactCSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import Card from '../ui/Card'
import { resolveInvitationBackgroundImage } from '../invitation/invitationHeroContent'
import {
  buildCreateProgress,
  buildPreviewLocation,
  formatPreviewDate,
  formatPreviewTime,
  getTitleColorValue,
  getRsvpSymbol,
  getThemeLabel,
  TITLE_COLOR_OPTIONS,
  TITLE_FONT_OPTIONS,
  TITLE_OUTLINE_OPTIONS,
  TITLE_SIZE_OPTIONS,
  type InvitationCreateDraft,
  type ShortcutId,
} from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
  onOpenShortcut: (shortcut: ShortcutId) => void
  hideWishlistCard?: boolean
}

type StatusTone = 'ready' | 'accent' | 'pending' | 'muted'

const FONT_SCROLL_THRESHOLD = 6

function handleActionKeyDown(event: KeyboardEvent<HTMLElement>, onActivate: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onActivate()
  }
}

function getStatusChipClass(tone: StatusTone) {
  return `pb-createEditor__statusChip pb-createEditor__statusChip--${tone}`
}

function ChevronIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} focusable="false">
      <path
        d="M6 3.5L10.5 8L6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditorChevron() {
  return (
    <span className="pb-createEditor__chevron" aria-hidden="true">
      <ChevronIcon className="pb-createEditor__chevronIcon" />
    </span>
  )
}

function FactChevron() {
  return (
    <span className="pb-createEditor__factChevron" aria-hidden="true">
      <ChevronIcon className="pb-createEditor__factChevronIcon" />
    </span>
  )
}

function FontStripChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <ChevronIcon
      className={`pb-createEditor__fontScrollerChevron ${
        direction === 'left' ? 'pb-createEditor__fontScrollerChevron--left' : ''
      }`}
    />
  )
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" className="pb-createEditor__cardIcon" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="8" r="1.5" fill="currentColor" />
      <circle cx="13" cy="8" r="1.5" fill="currentColor" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" className="pb-createEditor__cardIcon" aria-hidden="true">
      <rect x="3" y="8" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4.5" y="11" width="11" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8v8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 8c-1-2.5-3.5-3-4-2s1.5 2 4 2zM10 8c1-2.5 3.5-3 4-2s-1.5 2-4 2z" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  )
}

function CalendarIcon({ ready }: { ready: boolean }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" className={`pb-createEditor__factIcon ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <rect x="2.5" y="3.5" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 7.5h13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 2v2.5M12 2v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon({ ready }: { ready: boolean }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" className={`pb-createEditor__factIcon ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 5v4.5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon({ ready }: { ready: boolean }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" className={`pb-createEditor__factIcon ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <path d="M9 16s-5.5-4.5-5.5-8a5.5 5.5 0 1 1 11 0c0 3.5-5.5 8-5.5 8z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function getFontScrollStep(scroller: HTMLDivElement) {
  const firstCard = scroller.querySelector<HTMLElement>('.pb-createEditor__fontCard')
  const styles = window.getComputedStyle(scroller)
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '0')
  const cardWidth = firstCard?.getBoundingClientRect().width ?? scroller.clientWidth
  const naturalStep = scroller.clientWidth * 0.34
  const minimumStep = (cardWidth * 0.24) + (Number.isNaN(gap) ? 0 : gap)
  return Math.max(naturalStep, minimumStep)
}

export default function InvitationMainEditor({ draft, onFieldChange, onOpenShortcut, hideWishlistCard = false }: Props) {
  const fontScrollerRef = useRef<HTMLDivElement | null>(null)
  const dragPointerIdRef = useRef<number | null>(null)
  const dragStartXRef = useRef(0)
  const dragScrollLeftRef = useRef(0)
  const dragMovedRef = useRef(false)
  const [isDraggingFonts, setIsDraggingFonts] = useState(false)
  const [canScrollFontsLeft, setCanScrollFontsLeft] = useState(false)
  const [canScrollFontsRight, setCanScrollFontsRight] = useState(true)

  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const { titleReady, dateReady, locationReady } = buildCreateProgress(draft)
  const titleStyle = {
    ['--pb-create-title-color' as string]: getTitleColorValue(draft.titleColor),
  } as ReactCSSProperties

  const titleStatus = titleReady ? { label: 'Popunjeno', tone: 'ready' as const } : { label: 'Dodaj naslov', tone: 'pending' as const }
  const scheduleStatus = dateReady && locationReady
    ? { label: 'Spremno', tone: 'ready' as const }
    : { label: 'Nedostaje detalj', tone: 'pending' as const }
  const themeStatus = { label: 'Odabrana tema', tone: 'accent' as const }
  const wishlistStatus = draft.wishlistEnabled
    ? { label: draft.wishlistItems.length > 0 ? `${draft.wishlistItems.length} želje` : 'Wishlist uključen', tone: 'accent' as const }
    : { label: 'Isključen', tone: 'muted' as const }

  useEffect(() => {
    const scroller = fontScrollerRef.current
    if (!scroller) {
      return undefined
    }

    const syncScrollState = () => {
      const maxScrollLeft = Math.max(scroller.scrollWidth - scroller.clientWidth, 0)
      const nextCanScrollLeft = scroller.scrollLeft > FONT_SCROLL_THRESHOLD
      const nextCanScrollRight = maxScrollLeft - scroller.scrollLeft > FONT_SCROLL_THRESHOLD

      setCanScrollFontsLeft((current) => (current === nextCanScrollLeft ? current : nextCanScrollLeft))
      setCanScrollFontsRight((current) => (current === nextCanScrollRight ? current : nextCanScrollRight))
    }

    syncScrollState()
    scroller.addEventListener('scroll', syncScrollState, { passive: true })
    window.addEventListener('resize', syncScrollState)

    return () => {
      scroller.removeEventListener('scroll', syncScrollState)
      window.removeEventListener('resize', syncScrollState)
    }
  }, [draft.title, draft.titleFont])

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return
      }

      const scroller = fontScrollerRef.current
      if (!scroller) {
        return
      }

      const delta = event.clientX - dragStartXRef.current
      if (Math.abs(delta) <= 5) {
        return
      }

      if (!dragMovedRef.current) {
        dragMovedRef.current = true
        setIsDraggingFonts(true)
      }

      scroller.scrollLeft = dragScrollLeftRef.current - delta
      event.preventDefault()
    }

    const finishWindowPointer = (event: PointerEvent) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return
      }

      dragPointerIdRef.current = null
      setIsDraggingFonts(false)

      if (dragMovedRef.current) {
        window.setTimeout(() => {
          dragMovedRef.current = false
        }, 0)
      }
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', finishWindowPointer)
    window.addEventListener('pointercancel', finishWindowPointer)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', finishWindowPointer)
      window.removeEventListener('pointercancel', finishWindowPointer)
    }
  }, [])

  const handleFactClick = (event: ReactMouseEvent<HTMLButtonElement>, shortcut: ShortcutId) => {
    event.stopPropagation()
    onOpenShortcut(shortcut)
  }

  const handleChevronClick = (event: ReactMouseEvent<HTMLButtonElement>, shortcut: ShortcutId) => {
    event.stopPropagation()
    onOpenShortcut(shortcut)
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('title', event.target.value)
  }

  const handleFontStripPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return
    }

    const scroller = fontScrollerRef.current
    if (!scroller) {
      return
    }

    dragPointerIdRef.current = event.pointerId
    dragStartXRef.current = event.clientX
    dragScrollLeftRef.current = scroller.scrollLeft
    dragMovedRef.current = false
  }

  const handleFontStepScroll = (direction: 'left' | 'right') => {
    const scroller = fontScrollerRef.current
    if (!scroller) {
      return
    }

    const step = getFontScrollStep(scroller)
    const multiplier = direction === 'right' ? 1 : -1
    scroller.scrollBy({ left: step * multiplier, behavior: 'smooth' })
  }

  const handleFontStripWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const scroller = fontScrollerRef.current
    if (!scroller || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }

    scroller.scrollBy({ left: event.deltaY, behavior: 'auto' })
    event.preventDefault()
  }

  const handleFontSelect = (event: ReactMouseEvent<HTMLButtonElement>, fontId: InvitationCreateDraft['titleFont']) => {
    if (dragMovedRef.current) {
      event.preventDefault()
      return
    }

    onFieldChange('titleFont', fontId)
  }

  const heroThemeImage = resolveInvitationBackgroundImage(draft.theme, draft.theme)

  return (
    <div className="pb-createEditor">
      <Card
        className="pb-createEditor__heroCard pb-createEditor__heroCard--mobileTheme"
        style={
          {
            ['--pb-create-hero-theme-url' as string]: `url(${JSON.stringify(heroThemeImage)})`,
          } as ReactCSSProperties
        }
      >
        <div className="pb-createEditor__cardHeader pb-createEditor__cardHeader--hero">
          <div className="pb-createEditor__heroHeaderStack">
            <div className="pb-createEditor__heroTopRow">
              <span className="pb-createEditor__eyebrow">Naslov pozivnice</span>
              <div className="pb-createEditor__cardMeta pb-createEditor__cardMeta--heroChip">
                <span className={getStatusChipClass(titleStatus.tone)}>{titleStatus.label}</span>
              </div>
            </div>
            <label className="pb-createEditor__titleField pb-createEditor__titleField--hero">
              <span className="pb-visuallyHidden">Naslov pozivnice</span>
              <input
                className={`pb-createEditor__titleInput pb-createEditor__title--${draft.titleFont} pb-createEditor__titleOutline--${draft.titleOutline} pb-createEditor__titleSize--${draft.titleSize}`}
                style={titleStyle}
                value={draft.title}
                onChange={handleTitleChange}
                placeholder="Upiši naslov pozivnice"
              />
            </label>
          </div>
        </div>

        <div className="pb-createEditor__fontBlock">
          <span className="pb-createEditor__eyebrow">Font preview</span>
          <div className="pb-createEditor__fontStrip">
            <button
              type="button"
              className={`pb-createEditor__fontScrollerButton ${!canScrollFontsLeft ? 'is-muted' : ''}`}
              aria-label="Prethodni font"
              onClick={() => handleFontStepScroll('left')}
            >
              <FontStripChevron direction="left" />
            </button>

            <div
              ref={fontScrollerRef}
              className={`pb-createEditor__fontScroller ${isDraggingFonts ? 'is-dragging' : ''}`}
              role="list"
              aria-label="Odabir fonta za naslov"
              onWheel={handleFontStripWheel}
              onPointerDown={handleFontStripPointerDown}
            >
              {TITLE_FONT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`pb-quickEditor__fontCard pb-createEditor__fontCard ${draft.titleFont === option.id ? 'is-active' : ''}`}
                  onClick={(event) => handleFontSelect(event, option.id)}
                  draggable={false}
                >
                  <span className={`pb-fontOption__name pb-fontOption__name--${option.id}`}>{option.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`pb-createEditor__fontScrollerButton ${!canScrollFontsRight ? 'is-muted' : ''}`}
              aria-label="Sljedeći font"
              onClick={() => handleFontStepScroll('right')}
            >
              <FontStripChevron direction="right" />
            </button>
          </div>
          <div className="pb-createEditor__titleStyleStack">
            <div className="pb-createEditor__titleStyleGroup">
              <span className="pb-createEditor__heroRsvpLabel">Boja naslova</span>
              <div className="pb-createEditor__titleSwatches">
                {TITLE_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pb-createEditor__titleSwatch ${draft.titleColor === option.id ? 'is-active' : ''}`}
                    style={{ ['--pb-title-swatch' as string]: option.swatch } as ReactCSSProperties}
                    onClick={() => onFieldChange('titleColor', option.id)}
                    aria-label={option.label}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            <div className="pb-createEditor__titleStyleGroup">
              <span className="pb-createEditor__heroRsvpLabel">Outline</span>
              <div className="pb-createEditor__styleChipRow">
                {TITLE_OUTLINE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pb-createEditor__styleChip ${draft.titleOutline === option.id ? 'is-active' : ''}`}
                    onClick={() => onFieldChange('titleOutline', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-createEditor__titleStyleGroup">
              <span className="pb-createEditor__heroRsvpLabel">Veličina</span>
              <div className="pb-createEditor__styleChipRow">
                {TITLE_SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pb-createEditor__styleChip ${draft.titleSize === option.id ? 'is-active' : ''}`}
                    onClick={() => onFieldChange('titleSize', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className="pb-createEditor__heroRsvpPreview"
            role="button"
            tabIndex={0}
            aria-label="Uredi RSVP ikone"
            onClick={() => onOpenShortcut('rsvp')}
            onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('rsvp'))}
          >
            <div className="pb-createEditor__heroRsvpInner">
              <div>
                <span className="pb-createEditor__heroRsvpLabel">RSVP preview</span>
                <div className="pb-previewCard__rsvpRow" aria-hidden="true">
                  {(['going', 'maybe', 'not_going'] as const).map((choice) => (
                    <span
                      key={choice}
                      className={`pb-previewCard__rsvpPill pb-previewCard__rsvpPill--${choice.replace('_', '-')}`}
                    >
                      <span className="pb-previewCard__rsvpGlyph">{getRsvpSymbol(draft.rsvpMood, choice)}</span>
                      <span>{choice === 'going' ? 'Dolazimo' : choice === 'maybe' ? 'Možda' : 'Ne dolazimo'}</span>
                    </span>
                  ))}
                </div>
              </div>
              <EditorChevron />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="pb-createEditor__mobileThemeChip"
          onClick={() => onOpenShortcut('theme')}
          aria-label="Promijeni temu"
        >
          <PaletteIcon />
          <span>Promijeni temu</span>
        </button>
      </Card>

      <Card
        className="pb-createEditor__highlightCard pb-createEditor__panelCard"
        role="button"
        tabIndex={0}
        aria-label="Uredi datum, vrijeme i lokaciju"
        onClick={() => onOpenShortcut('dateTime')}
        onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('dateTime'))}
      >
        <div className="pb-createEditor__cardHeader">
          <div>
            <span className="pb-createEditor__eyebrow">Kada i gdje</span>
            <h3 className="pb-createEditor__sectionTitle">Najvažnije informacije</h3>
          </div>
          <div className="pb-createEditor__cardMeta">
            <span className={getStatusChipClass(scheduleStatus.tone)}>{scheduleStatus.label}</span>
            <button
              type="button"
              className="pb-createEditor__chevronButton"
              aria-label="Uredi lokaciju"
              onClick={(event) => handleChevronClick(event, 'location')}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <EditorChevron />
            </button>
          </div>
        </div>
        {!dateReady && !locationReady ? (
          <div className="pb-createEditor__emptyHint">
            <span>Klikni da dodaš datum, vrijeme i lokaciju</span>
          </div>
        ) : null}
        <div className="pb-createEditor__facts">
          <button type="button" className="pb-createEditor__fact" onClick={(event) => handleFactClick(event, 'dateTime')}>
            <CalendarIcon ready={dateReady} />
            <span className="pb-createEditor__factBody">
              <span>Datum</span>
              <strong>{formatPreviewDate(draft.date)}</strong>
            </span>
            <FactChevron />
          </button>
          <button type="button" className="pb-createEditor__fact" onClick={(event) => handleFactClick(event, 'dateTime')}>
            <ClockIcon ready={dateReady} />
            <span className="pb-createEditor__factBody">
              <span>Vrijeme</span>
              <strong>{formatPreviewTime(draft.time, draft.timeEnd)}</strong>
            </span>
            <FactChevron />
          </button>
          <button type="button" className="pb-createEditor__fact pb-createEditor__fact--wide" onClick={(event) => handleFactClick(event, 'location')}>
            <PinIcon ready={locationReady} />
            <span className="pb-createEditor__factBody">
              <span>Lokacija</span>
              <strong>{location}</strong>
            </span>
            <FactChevron />
          </button>
        </div>
      </Card>

      <div className="pb-createEditor__grid">
        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard pb-createEditor__infoCard--theme"
          role="button"
          tabIndex={0}
          aria-label="Uredi temu pozivnice"
          onClick={() => onOpenShortcut('theme')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('theme'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow"><PaletteIcon /> Tema</span>
              <h3 className="pb-createEditor__sectionTitle">Naslovnica pozivnice</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(themeStatus.tone)}>{themeStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <div className="pb-createEditor__themePreviewRow">
            <img className="pb-createEditor__themeThumbnail" src={heroThemeImage} alt="" aria-hidden="true" />
            <p className="pb-createEditor__bodyText">{getThemeLabel(draft.theme)}</p>
          </div>
        </Card>

        {/*
        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard pb-createEditor__infoCard--message"
          role="button"
          tabIndex={0}
          aria-label="Uredi poruku za goste"
          onClick={() => onOpenShortcut('message')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('message'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow"><ChatBubbleIcon /> Poruka</span>
              <h3 className="pb-createEditor__sectionTitle">Kratki opis za goste</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(messageStatus.tone)}>{messageStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">{draft.message.trim() || 'Dodaj kratku poruku za goste.'}</p>
        </Card>
        */}

        {!hideWishlistCard ? (
          <Card
            className="pb-createEditor__infoCard pb-createEditor__panelCard pb-createEditor__infoCard--wishlist"
            role="button"
            tabIndex={0}
            aria-label="Uredi wishlist i dodatke"
            onClick={() => onOpenShortcut('wishlist')}
            onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('wishlist'))}
          >
            <div className="pb-createEditor__cardHeader">
              <div>
                <span className="pb-createEditor__eyebrow"><GiftIcon /> Pokloni</span>
                <h3 className="pb-createEditor__sectionTitle">Wishlist i dodatci</h3>
              </div>
              <div className="pb-createEditor__cardMeta">
                <span className={getStatusChipClass(wishlistStatus.tone)}>{wishlistStatus.label}</span>
                <EditorChevron />
              </div>
            </div>
            <p className="pb-createEditor__bodyText">
              {draft.wishlistEnabled
                ? `${draft.wishlistItems.length} prijedloga poklona${draft.savingsEnabled ? ' + uključen grupni poklon' : ''}`
                : 'Wishlist je trenutno isključen.'}
            </p>
          </Card>
        ) : null}

        {/*
        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard pb-createEditor__infoCard--rsvp"
          role="button"
          tabIndex={0}
          aria-label="Uredi potvrdu dolaska"
          onClick={() => onOpenShortcut('rsvp')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('rsvp'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow"><CheckCircleIcon /> RSVP</span>
              <h3 className="pb-createEditor__sectionTitle">Potvrda dolaska</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(rsvpStatus.tone)}>{rsvpStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">Promijenite ikone RSVP-a po vašoj želji.</p>
        </Card>
        */}
      </div>
    </div>
  )
}
