import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr } from '../lib/dates'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import PartnerIcon, { type IconName } from './ui/PartnerIcon'

export type PaletteNavItem = { to: string; label: string; icon: IconName }

type Command = {
  id: string
  group: string
  title: string
  meta?: string
  icon: IconName
  run: () => void
}

type Props = {
  open: boolean
  onClose: () => void
  navItems: PaletteNavItem[]
}

export default function PartnerCommandPalette({ open, onClose, navItems }: Props) {
  const navigate = useNavigate()
  const { reservations, customers, getCustomer } = usePartnerData()
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 120)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  const commands = useMemo<Command[]>(() => {
    const q = debounced.trim().toLowerCase()
    const matches = (text: string) => !q || text.toLowerCase().includes(q)

    const actions: Command[] = matches('nova rezervacija')
      ? [
          {
            id: 'act-new',
            group: 'Akcije',
            title: 'Nova rezervacija',
            icon: 'plus',
            run: () => go('/partner/reservations?new=1'),
          },
        ]
      : []

    const nav: Command[] = navItems
      .filter((n) => matches(n.label))
      .map((n) => ({ id: `nav-${n.to}`, group: 'Navigacija', title: n.label, icon: n.icon, run: () => go(n.to) }))

    const res: Command[] = q
      ? reservations
          .filter((r) => {
            const c = getCustomer(r.customerId)
            return r.childName.toLowerCase().includes(q) || !!c?.fullName.toLowerCase().includes(q)
          })
          .slice(0, 6)
          .map((r) => {
            const c = getCustomer(r.customerId)
            return {
              id: `res-${r.id}`,
              group: 'Rezervacije',
              title: r.childName,
              meta: `${formatDateHr(r.date)} · ${c?.fullName ?? 'Nepoznat roditelj'}`,
              icon: 'reservations' as IconName,
              run: () => go(`/partner/reservations/${r.id}`),
            }
          })
      : []

    const cust: Command[] = q
      ? customers
          .filter((c) => c.fullName.toLowerCase().includes(q) || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
          .slice(0, 6)
          .map((c) => ({
            id: `cust-${c.id}`,
            group: 'Kupci',
            title: c.fullName,
            meta: c.phone,
            icon: 'customers' as IconName,
            run: () => go(`/partner/customers/${c.id}`),
          }))
      : []

    return [...actions, ...nav, ...res, ...cust]
    // go is stable enough for this list; deps cover the data inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, navItems, reservations, customers, getCustomer])

  // Reset highlight whenever the result set changes.
  useEffect(() => {
    setActiveIndex(0)
  }, [debounced])

  // Open/close lifecycle: focus the input, reset query, restore focus on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null
      setQuery('')
      setActiveIndex(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
    restoreRef.current?.focus?.()
    return undefined
  }, [open])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (commands.length === 0 ? 0 : (i + 1) % commands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (commands.length === 0 ? 0 : (i - 1 + commands.length) % commands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commands[activeIndex]?.run()
    }
  }

  let lastGroup = ''

  return (
    <div className="partner-palette" role="presentation">
      <button type="button" className="partner-palette__backdrop" aria-label="Zatvori" onClick={onClose} />
      <div
        className="partner-palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Brza naredba"
        onKeyDown={onKeyDown}
      >
        <div className="partner-palette__inputWrap">
          <PartnerIcon name="reservations" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="partner-palette__input"
            placeholder="Traži stranicu, rezervaciju ili kupca…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="partner-palette-list"
            aria-activedescendant={commands[activeIndex]?.id}
            aria-autocomplete="list"
            aria-label="Brza naredba"
          />
        </div>

        <ul id="partner-palette-list" className="partner-palette__list" role="listbox" aria-label="Rezultati">
          {commands.length === 0 ? (
            <li className="partner-palette__empty">Nema rezultata za „{debounced}”.</li>
          ) : (
            commands.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup
              lastGroup = cmd.group
              return (
                <li key={cmd.id} role="presentation">
                  {showGroup ? (
                    <div className="partner-palette__groupLabel" role="presentation">
                      {cmd.group}
                    </div>
                  ) : null}
                  <div
                    id={cmd.id}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`partner-palette__item${i === activeIndex ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={cmd.run}
                  >
                    <PartnerIcon name={cmd.icon} size={18} />
                    <span className="partner-palette__itemBody">
                      <span className="partner-palette__itemTitle">{cmd.title}</span>
                      {cmd.meta ? <span className="partner-palette__itemMeta">{cmd.meta}</span> : null}
                    </span>
                    <PartnerIcon name="chevronRight" size={16} />
                  </div>
                </li>
              )
            })
          )}
        </ul>

        <div className="partner-palette__footer">
          <span><kbd className="partner-kbd">↑</kbd> <kbd className="partner-kbd">↓</kbd> kretanje</span>
          <span><kbd className="partner-kbd">↵</kbd> otvori</span>
          <span><kbd className="partner-kbd">esc</kbd> zatvori</span>
        </div>
      </div>
    </div>
  )
}
