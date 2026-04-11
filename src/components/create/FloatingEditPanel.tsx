import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export default function FloatingEditPanel({ open, title, description, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [closing, setClosing] = useState(false)

  const startClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    const timer = window.setTimeout(() => {
      setClosing(false)
      onClose()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [closing, onClose])

  useEffect(() => {
    if (!open || closing) return undefined

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        startClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        startClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open, closing, startClose])

  if (!open && !closing) return null

  const backdropClass = `pb-floatingPanel__backdrop${closing ? ' is-closing' : ''}`
  const panelClass = `pb-floatingPanel${closing ? ' is-closing' : ''}`

  return (
    <div className={backdropClass}>
      <div className={panelClass} role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <div className="pb-floatingPanel__header">
          <div>
            <h2 className="pb-floatingPanel__title">{title}</h2>
            {description ? <p className="pb-floatingPanel__description">{description}</p> : null}
          </div>
          <button type="button" className="pb-floatingPanel__close" onClick={startClose} aria-label="Zatvori">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeWidth="1.8" opacity="0.18" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        </div>
        <div className="pb-floatingPanel__body">{children}</div>
      </div>
    </div>
  )
}
