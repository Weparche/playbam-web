import type { InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
}

export default function QuickMessageEditor({ draft, onFieldChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <label className="pb-formField">
        <span className="pb-formLabel">Poruka za goste</span>
        <textarea
          className="pb-input pb-quickEditor__textarea"
          value={draft.message}
          onChange={(event) => onFieldChange('message', event.target.value)}
          placeholder="Vidimo se na tulumu!"
        />
      </label>
    </div>
  )
}
