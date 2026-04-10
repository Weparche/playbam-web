import type { InvitationCreateDraft, WishlistDraftItem } from './createTypes'

const ITEM_ACCENT_COLORS = ['#5b3df5', '#2e9e5e', '#d97706', '#e04d6b', '#0891b2', '#7c3aed']

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
  onWishlistChange: (items: WishlistDraftItem[]) => void
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 5h11M6 5V3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V5M7.5 8v4.5M10.5 8v4.5" />
      <path d="M4.5 5l.6 8.5a1.5 1.5 0 0 0 1.5 1.4h4.8a1.5 1.5 0 0 0 1.5-1.4l.6-8.5" />
    </svg>
  )
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
          {draft.wishlistItems.map((item, index) => (
            <div
              key={item.id}
              className="pb-quickEditor__listItem pb-quickEditor__listItem--accented"
              style={{ '--pb-wishlist-accent': ITEM_ACCENT_COLORS[index % ITEM_ACCENT_COLORS.length] } as React.CSSProperties}
            >
              <div className="pb-quickEditor__listItemHeader">
                <span className="pb-quickEditor__listItemIndex">{index + 1}</span>
                <button type="button" className="pb-quickEditor__remove pb-quickEditor__remove--icon" onClick={() => removeItem(item.id)} aria-label="Makni poklon">
                  <TrashIcon />
                  <span>Makni</span>
                </button>
              </div>
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
            </div>
          ))}
          <button type="button" className="pb-quickEditor__add" onClick={addItem}>
            + Dodaj poklon
            {draft.wishlistItems.length > 0 ? (
              <span className="pb-quickEditor__addBadge">{draft.wishlistItems.length}</span>
            ) : null}
          </button>
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
