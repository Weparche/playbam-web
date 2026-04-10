import { RSVP_MOOD_OPTIONS, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickRSVPEditor({ draft, onFieldChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <label className="pb-formField">
        <span className="pb-formLabel">Tekst za goste</span>
        <textarea
          className="pb-input pb-quickEditor__textarea"
          value={draft.rsvpPrompt}
          onChange={(event) => onFieldChange('rsvpPrompt', event.target.value)}
        />
      </label>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Icon mood</span>
        <div className="pb-quickEditor__optionGrid">
          {RSVP_MOOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__optionCard ${draft.rsvpMood === option.id ? 'is-active' : ''}`}
              onClick={() => onFieldChange('rsvpMood', option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.symbols.going} {option.symbols.maybe} {option.symbols.not_going}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
