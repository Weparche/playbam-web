import Button from '../ui/Button'

export type FamilyDraftChild = {
  id?: string
  name: string
  age: string
}

export type FamilyProfileDraft = {
  parentName: string
  children: FamilyDraftChild[]
}

type Props = {
  draft: FamilyProfileDraft
  error: string
  saving: boolean
  onChange: (draft: FamilyProfileDraft) => void
  onSave: () => void
}

export default function FamilyProfileForm({ draft, error, saving, onChange, onSave }: Props) {
  return (
    <div className="pb-profileForm">
      <div className="pb-formGrid">
        <label className="pb-formField">
          <span className="pb-formLabel">Ime mame ili tate</span>
          <input
            className="pb-input"
            type="text"
            value={draft.parentName}
            onChange={(event) => onChange({ ...draft, parentName: event.target.value })}
          />
        </label>
        {draft.children.map((child, index) => (
          <div key={child.id ?? `child-${index}`} className="pb-childEditor">
            <label className="pb-formField">
              <span className="pb-formLabel">Ime djeteta</span>
              <input
                className="pb-input"
                type="text"
                value={child.name}
                onChange={(event) => {
                  const nextChildren = [...draft.children]
                  nextChildren[index] = { ...child, name: event.target.value }
                  onChange({ ...draft, children: nextChildren })
                }}
              />
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Koliko godina ima dijete?</span>
              <input
                className="pb-input"
                type="number"
                min="1"
                max="18"
                value={child.age}
                onChange={(event) => {
                  const nextChildren = [...draft.children]
                  nextChildren[index] = { ...child, age: event.target.value }
                  onChange({ ...draft, children: nextChildren })
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="pb-flowActions">
        <Button
          variant="ghost"
          type="button"
          onClick={() => onChange({ ...draft, children: [...draft.children, { name: '', age: '' }] })}
        >
          Dodaj još jedno dijete
        </Button>
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? 'Spremamo...' : 'Spremi profil'}
        </Button>
      </div>
      {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
    </div>
  )
}
