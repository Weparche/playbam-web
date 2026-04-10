import { TITLE_FONT_OPTIONS, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickTitleEditor({ draft, onFieldChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <label className="pb-formField">
        <span className="pb-formLabel">Naslov pozivnice</span>
        <input className="pb-input" value={draft.title} onChange={(event) => onFieldChange('title', event.target.value)} />
      </label>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Font preview</span>
        <div className="pb-quickEditor__fontGrid">
          {TITLE_FONT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__fontCard ${draft.titleFont === option.id ? 'is-active' : ''}`}
              onClick={() => onFieldChange('titleFont', option.id)}
            >
              <span className={`pb-fontOption__name pb-fontOption__name--${option.id}`}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
