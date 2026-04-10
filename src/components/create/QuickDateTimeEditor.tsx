import { formatPreviewDate, formatPreviewTime, getUpcomingDateOptions, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  today: string
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickDateTimeEditor({ draft, today, onFieldChange }: Props) {
  const dateOptions = getUpcomingDateOptions(today)

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
        <label className="pb-formField">
          <span className="pb-formLabel">Datum</span>
          <input className="pb-input" type="date" min={today} value={draft.date} onChange={(event) => onFieldChange('date', event.target.value)} />
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Vrijeme od</span>
          <input className="pb-input" type="time" value={draft.time} onChange={(event) => onFieldChange('time', event.target.value)} />
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Vrijeme do</span>
          <input
            className="pb-input"
            type="time"
            min={draft.time || undefined}
            value={draft.timeEnd}
            onChange={(event) => onFieldChange('timeEnd', event.target.value)}
          />
        </label>
      </div>
      <div className="pb-quickEditor__hint">Termin se odmah vidi na live previewu kao raspon od-do.</div>
    </div>
  )
}
