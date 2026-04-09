import { LOCATION_TYPES, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickLocationEditor({ draft, onFieldChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <label className="pb-formField">
        <span className="pb-formLabel">Naziv lokacije</span>
        <input className="pb-input" value={draft.locationName} onChange={(event) => onFieldChange('locationName', event.target.value)} placeholder="npr. Igraonica Jogica" />
      </label>

      <label className="pb-formField">
        <span className="pb-formLabel">Adresa ili detalji</span>
        <input className="pb-input" value={draft.locationAddress} onChange={(event) => onFieldChange('locationAddress', event.target.value)} placeholder="Lastovska 2, Zagreb" />
      </label>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Tip lokacije</span>
        <div className="pb-quickEditor__chipRow">
          {LOCATION_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              className={`pb-quickEditor__chip ${draft.locationType === option ? 'is-active' : ''}`}
              onClick={() => onFieldChange('locationType', option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
