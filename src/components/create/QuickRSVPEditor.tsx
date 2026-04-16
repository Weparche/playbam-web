import { RSVP_MOOD_OPTIONS, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickRSVPEditor({ draft, onFieldChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Set ikonica za RSVP</span>
        <div className="pb-quickEditor__optionGrid">
          {RSVP_MOOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__optionCard ${draft.rsvpMood === option.id ? 'is-active' : ''}`}
              onClick={() => onFieldChange('rsvpMood', option.id)}
            >
              <strong>{option.label}</strong>
              <span className="pb-quickEditor__rsvpGlyphs">
                {option.symbols.going} {option.symbols.not_going} {option.symbols.maybe}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
