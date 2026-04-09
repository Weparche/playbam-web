import type { InvitationCreateDraft, WishlistDraftItem } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
  onWishlistChange: (items: WishlistDraftItem[]) => void
}

export default function QuickWishlistEditor({ draft, onFieldChange, onWishlistChange }: Props) {
  const updateItem = (id: string, field: keyof WishlistDraftItem, value: string) => {
    onWishlistChange(draft.wishlistItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addItem = () => {
    onWishlistChange([
      ...draft.wishlistItems,
      { id: `wish-${Date.now()}`, title: '', note: '', link: '' },
    ])
  }

  const removeItem = (id: string) => {
    onWishlistChange(draft.wishlistItems.filter((item) => item.id !== id))
  }

  return (
    <div className="pb-quickEditor">
      <label className="pb-quickEditor__toggle">
        <input type="checkbox" checked={draft.wishlistEnabled} onChange={(event) => onFieldChange('wishlistEnabled', event.target.checked)} />
        <span>Uključi wishlist</span>
      </label>

      {draft.wishlistEnabled ? (
        <div className="pb-quickEditor__list">
          {draft.wishlistItems.map((item) => (
            <div key={item.id} className="pb-quickEditor__listItem">
              <label className="pb-formField">
                <span className="pb-formLabel">Naziv poklona</span>
                <input className="pb-input" value={item.title} onChange={(event) => updateItem(item.id, 'title', event.target.value)} />
              </label>
              <label className="pb-formField">
                <span className="pb-formLabel">Kratka napomena</span>
                <input className="pb-input" value={item.note} onChange={(event) => updateItem(item.id, 'note', event.target.value)} />
              </label>
              <label className="pb-formField">
                <span className="pb-formLabel">Link poklona</span>
                <input className="pb-input" value={item.link} onChange={(event) => updateItem(item.id, 'link', event.target.value)} />
              </label>
              <button type="button" className="pb-quickEditor__remove" onClick={() => removeItem(item.id)}>Makni</button>
            </div>
          ))}
          <button type="button" className="pb-quickEditor__add" onClick={addItem}>+ Dodaj poklon</button>
        </div>
      ) : null}

      <label className="pb-quickEditor__toggle">
        <input type="checkbox" checked={draft.savingsEnabled} onChange={(event) => onFieldChange('savingsEnabled', event.target.checked)} />
        <span>Dodaj i grupni poklon / štednju</span>
      </label>

      {draft.savingsEnabled ? (
        <label className="pb-formField">
          <span className="pb-formLabel">Label za štednju</span>
          <input className="pb-input" value={draft.savingsLabel} onChange={(event) => onFieldChange('savingsLabel', event.target.value)} />
        </label>
      ) : null}
    </div>
  )
}
