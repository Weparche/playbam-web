import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export default function FloatingEditPanel({ open, title, description, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="pb-floatingPanel__backdrop" aria-hidden="true">
      <div className="pb-floatingPanel" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <div className="pb-floatingPanel__header">
          <div>
            <h2 className="pb-floatingPanel__title">{title}</h2>
            {description ? <p className="pb-floatingPanel__description">{description}</p> : null}
          </div>
          <button type="button" className="pb-floatingPanel__close" onClick={onClose}>
            Zatvori
          </button>
        </div>
        <div className="pb-floatingPanel__body">{children}</div>
      </div>
    </div>
  )
}
