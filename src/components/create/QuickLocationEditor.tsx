import { type InvitationCreateDraft } from './createTypes'

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

    </div>
  )
}
