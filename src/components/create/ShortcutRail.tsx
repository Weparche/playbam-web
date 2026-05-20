import { useEffect, useRef, useState } from 'react'

import ShortcutButton from './ShortcutButton'
import { SHORTCUT_ITEMS } from './createTypes'

type Props = {
  activeShortcut: string | null
  onShortcutClick: (id: string) => void
  items?: ReadonlyArray<{ id: string; label: string; icon: string }>
}

export default function ShortcutRail({ activeShortcut, onShortcutClick, items = SHORTCUT_ITEMS }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const railRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (railRef.current?.contains(target)) {
        return
      }
      setMobileOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [mobileOpen])

  const handleShortcutClick = (id: string) => {
    onShortcutClick(id)
    setMobileOpen(false)
  }

  return (
    <aside
      ref={railRef}
      className={`pb-shortcutRail ${mobileOpen ? 'is-mobile-open' : ''}`}
      aria-label="Brzi shortcuti za uredjivanje"
    >
      <button
        type="button"
        className="pb-shortcutRail__toggle"
        aria-label={mobileOpen ? 'Zatvori brze alate' : 'Otvori brze alate'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((current) => !current)}
      >
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="pb-shortcutRail__items">
        {items.map((item) => (
          <ShortcutButton
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            active={activeShortcut === item.id}
            onClick={handleShortcutClick}
          />
        ))}
      </div>
    </aside>
  )
}
