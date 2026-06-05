import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** desktop placement: 'right' drawer (default) or 'center' dialog */
  placement?: 'right' | 'center'
}

export default function PartnerSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'right',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const { body } = document
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ;(focusable ?? panelRef.current)?.focus()
    }, 20)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="partner-sheet" data-placement={placement}>
      <button
        type="button"
        className="partner-sheet__backdrop"
        aria-label="Zatvori"
        onClick={onClose}
      />
      <div
        className="partner-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="partner-sheet__header">
          <div>
            <h2 className="partner-sheet__title">{title}</h2>
            {description ? <p className="partner-sheet__desc">{description}</p> : null}
          </div>
          <button type="button" className="partner-sheet__close" onClick={onClose} aria-label="Zatvori">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="partner-sheet__body">{children}</div>
        {footer ? <footer className="partner-sheet__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
