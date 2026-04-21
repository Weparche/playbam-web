import { createPortal } from 'react-dom'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

import { formatPreviewDate, formatPreviewTime, getUpcomingDateOptions, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  today: string
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="2.4" y="3.1" width="13.2" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.4 6.9h13.2M6.1 1.8v3.1M11.9 1.8v3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 5.2v4.05l2.55 1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M3.5 6 8 10.5 12.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function buildTimeOptionValue(index: number) {
  const totalMinutes = index * 30
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

function openNativePicker(input: HTMLInputElement | null) {
  if (!input) {
    return
  }

  input.focus()

  const pickerInput = input as HTMLInputElement & { showPicker?: () => void }
  if (typeof pickerInput.showPicker === 'function') {
    try {
      pickerInput.showPicker()
    } catch {
      // Fallback ostaje fokus na polju.
    }
  }
}

function TimeComboField({
  label,
  value,
  min,
  icon,
  onChange,
}: {
  label: string
  value: string
  min?: string
  icon: ReactNode
  onChange: (value: string) => void
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 })

  const allOptions = useMemo(() => Array.from({ length: 48 }, (_, index) => buildTimeOptionValue(index)), [])

  const options = useMemo(() => {
    if (!min) {
      return allOptions
    }
    return allOptions.filter((option) => option > min)
  }, [allOptions, min])

  const updateMenuRect = useCallback(() => {
    const shell = shellRef.current
    if (!shell) {
      return
    }
    const rect = shell.getBoundingClientRect()
    setMenuRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  useLayoutEffect(() => {
    if (!menuOpen) {
      return
    }
    updateMenuRect()
  }, [menuOpen, updateMenuRect])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }
    const onScrollOrResize = () => {
      updateMenuRect()
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [menuOpen, updateMenuRect])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (shellRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const toggleMenu = () => {
    setMenuOpen((open) => !open)
  }

  const handleShellKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleMenu()
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setMenuOpen(true)
    }
  }

  const menu = menuOpen
    ? createPortal(
        <div
          ref={menuRef}
          className="pb-quickEditor__timeMenu"
          style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
          role="listbox"
          aria-label={`Brzi odabir za ${label.toLowerCase()}`}
          onMouseDown={(event) => {
            event.stopPropagation()
          }}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`pb-quickEditor__timeMenuOption ${value === option ? 'is-active' : ''}`}
              onClick={() => {
                onChange(option)
                setMenuOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <label className="pb-formField pb-quickEditor__pickerField">
        <span className="pb-formLabel">{label}</span>
        <div
          ref={shellRef}
          className="pb-quickEditor__pickerShell"
          role="button"
          tabIndex={0}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Otvori odabir za ${label.toLowerCase()}`}
          onClick={toggleMenu}
          onKeyDown={handleShellKeyDown}
        >
          <span className="pb-quickEditor__pickerLeading" aria-hidden="true">
            {icon}
          </span>
          <input
            className="pb-input pb-quickEditor__pickerInput"
            type="text"
            value={value}
            autoComplete="off"
            inputMode="none"
            readOnly
            placeholder="Odaberi vrijeme"
          />
          <button
            type="button"
            className="pb-quickEditor__pickerTrigger"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            aria-label={`Otvori brzi odabir za ${label.toLowerCase()}`}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleMenu()
            }}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </label>
      {menu}
    </>
  )
}

function PickerField({
  label,
  type,
  value,
  min,
  step,
  list,
  icon,
  onChange,
}: {
  label: string
  type: 'date' | 'time'
  value: string
  min?: string
  step?: number
  list?: string
  icon: ReactNode
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <label className="pb-formField pb-quickEditor__pickerField">
      <span className="pb-formLabel">{label}</span>
      <div className="pb-quickEditor__pickerShell">
        <span className="pb-quickEditor__pickerLeading" aria-hidden="true">
          {icon}
        </span>
        <input
          ref={inputRef}
          className="pb-input pb-quickEditor__pickerInput"
          type={type}
          min={min}
          step={step}
          list={list}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="pb-quickEditor__pickerTrigger"
          aria-label={`Otvori odabir za ${label.toLowerCase()}`}
          onClick={(event) => {
            event.preventDefault()
            openNativePicker(inputRef.current)
          }}
        >
          <ChevronDownIcon />
        </button>
      </div>
    </label>
  )
}

export default function QuickDateTimeEditor({ draft, today, onFieldChange }: Props) {
  const dateOptions = getUpcomingDateOptions(today)

  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__dateTimeLayout">
        <div className="pb-quickEditor__dateTimeDateField">
          <PickerField
            label="Datum"
            type="date"
            min={today}
            value={draft.date}
            icon={<CalendarIcon />}
            onChange={(value) => onFieldChange('date', value)}
          />
        </div>
      </div>

      <div className="pb-quickEditor__chipRow pb-quickEditor__chipRow--dates">
        {dateOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`pb-quickEditor__dateChip ${draft.date === option.value ? 'is-active' : ''}`}
            onClick={() => onFieldChange('date', option.value)}
          >
            <span className="pb-quickEditor__dateChipDay">{option.dayNumber}</span>
            <span className="pb-quickEditor__dateChipLabel">{option.label}</span>
            <span className="pb-quickEditor__dateChipRelative">{option.relative}</span>
          </button>
        ))}
      </div>

      <div className="pb-quickEditor__dateTimeLayout">
        <div className="pb-quickEditor__dateTimeTimeRow">
          <TimeComboField
            label="Vrijeme od"
            value={draft.time}
            icon={<ClockIcon />}
            onChange={(value) => onFieldChange('time', value)}
          />
          <TimeComboField
            label="Vrijeme do"
            min={draft.time || undefined}
            value={draft.timeEnd}
            icon={<ClockIcon />}
            onChange={(value) => onFieldChange('timeEnd', value)}
          />
        </div>
      </div>

      <div className="pb-quickEditor__hint">Brzi izbor nudi termine na puni sat i pola sata preko dropdowna.</div>
      <div className="pb-quickEditor__hint">Termin se odmah vidi na live previewu kao raspon od-do.</div>
      <div className="pb-quickEditor__summary">
        <strong>{formatPreviewDate(draft.date)}</strong>
        <span>{formatPreviewTime(draft.time, draft.timeEnd)}</span>
      </div>
    </div>
  )
}
