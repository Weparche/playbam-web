import { useId, useRef, type ReactNode } from 'react'

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
      // showPicker nije dostupan svugdje; fokus ostaje fallback.
    }
  }
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
  const timeSuggestionsId = useId()

  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__summary">
        <strong>{formatPreviewDate(draft.date)}</strong>
        <span>{formatPreviewTime(draft.time, draft.timeEnd)}</span>
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

      <div className="pb-quickEditor__twoCol">
        <PickerField
          label="Datum"
          type="date"
          min={today}
          value={draft.date}
          icon={<CalendarIcon />}
          onChange={(value) => onFieldChange('date', value)}
        />
        <PickerField
          label="Vrijeme od"
          type="time"
          value={draft.time}
          step={1800}
          list={timeSuggestionsId}
          icon={<ClockIcon />}
          onChange={(value) => onFieldChange('time', value)}
        />
        <PickerField
          label="Vrijeme do"
          type="time"
          min={draft.time || undefined}
          value={draft.timeEnd}
          step={1800}
          list={timeSuggestionsId}
          icon={<ClockIcon />}
          onChange={(value) => onFieldChange('timeEnd', value)}
        />
      </div>

      <datalist id={timeSuggestionsId}>
        {Array.from({ length: 48 }, (_, index) => {
          const value = buildTimeOptionValue(index)
          return <option key={value} value={value} />
        })}
      </datalist>

      <div className="pb-quickEditor__hint">Brzi izbor nudi termine na puni sat i pola sata, a točno vrijeme možeš i ručno upisati.</div>
      <div className="pb-quickEditor__hint">Termin se odmah vidi na live previewu kao raspon od-do.</div>
    </div>
  )
}
