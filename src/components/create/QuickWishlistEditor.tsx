import { useEffect, useRef, useState } from 'react'
import type { InvitationCreateDraft, LinkMeta, WishlistDraftItem } from './createTypes'
import { unfurlLink } from '../../lib/invitationApi'

const ITEM_ACCENT_COLORS = ['#5b3df5', '#2e9e5e', '#d97706', '#e04d6b', '#0891b2', '#7c3aed']
const LINK_DEBOUNCE_MS = 600

function isValidUrl(value: string) {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

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

function LinkPreviewSpinner() {
  return (
    <span className="pb-quickEditor__linkSpinner" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 1.5a6.5 6.5 0 1 1-4.6 1.9" />
      </svg>
    </span>
  )
}

function LinkPreview({ meta }: { meta: LinkMeta }) {
  const imageSrc = meta.image || meta.favicon
  if (!imageSrc && !meta.domain) return null

  return (
    <div className="pb-quickEditor__linkPreview">
      {imageSrc ? (
        <img
          className="pb-quickEditor__linkThumb"
          src={imageSrc}
          alt=""
          aria-hidden="true"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : null}
      <div className="pb-quickEditor__linkMeta">
        {meta.title ? <span className="pb-quickEditor__linkTitle">{meta.title}</span> : null}
        {meta.domain ? <span className="pb-quickEditor__linkDomain">{meta.domain}</span> : null}
      </div>
    </div>
  )
}

function WishlistItemEditor({
  item,
  index,
  onUpdate,
  onRemove,
  onLinkMetaChange,
}: {
  item: WishlistDraftItem
  index: number
  onUpdate: (id: string, field: keyof WishlistDraftItem, value: string) => void
  onRemove: (id: string) => void
  onLinkMetaChange: (id: string, meta: LinkMeta | undefined) => void
}) {
  const [fetching, setFetching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const lastFetchedUrlRef = useRef(item.link)
  const onLinkMetaChangeRef = useRef(onLinkMetaChange)
  onLinkMetaChangeRef.current = onLinkMetaChange

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleLinkChange = (value: string) => {
    onUpdate(item.id, 'link', value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!isValidUrl(value)) {
      if (item.linkMeta) onLinkMetaChange(item.id, undefined)
      setFetching(false)
      lastFetchedUrlRef.current = ''
      return
    }

    if (value === lastFetchedUrlRef.current && item.linkMeta) return

    const itemId = item.id
    setFetching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await unfurlLink(value)
        lastFetchedUrlRef.current = value
        onLinkMetaChangeRef.current(itemId, {
          title: result.title ?? undefined,
          image: result.image ?? undefined,
          domain: result.domain ?? undefined,
          favicon: result.favicon ?? undefined,
        })
      } catch {
        onLinkMetaChangeRef.current(itemId, undefined)
      } finally {
        setFetching(false)
      }
    }, LINK_DEBOUNCE_MS)
  }

  return (
    <div
      className="pb-quickEditor__listItem pb-quickEditor__listItem--accented"
      style={{ '--pb-wishlist-accent': ITEM_ACCENT_COLORS[index % ITEM_ACCENT_COLORS.length] } as React.CSSProperties}
    >
      <div className="pb-quickEditor__listItemHeader">
        <span className="pb-quickEditor__listItemIndex">{index + 1}</span>
        <button type="button" className="pb-quickEditor__remove pb-quickEditor__remove--icon" onClick={() => onRemove(item.id)} aria-label="Makni poklon">
          <TrashIcon />
          <span>Makni</span>
        </button>
      </div>
      <label className="pb-formField">
        <span className="pb-formLabel">Naziv poklona</span>
        <input className="pb-input" value={item.title} onChange={(event) => onUpdate(item.id, 'title', event.target.value)} />
      </label>
      <label className="pb-formField">
        <span className="pb-formLabel">Kratka napomena</span>
        <input className="pb-input" value={item.note} onChange={(event) => onUpdate(item.id, 'note', event.target.value)} />
      </label>
      <div className="pb-formField">
        <span className="pb-formLabel">Link poklona</span>
        {fetching ? <LinkPreviewSpinner /> : null}
        {!fetching && item.linkMeta ? <LinkPreview meta={item.linkMeta} /> : null}
        <input className="pb-input" value={item.link} onChange={(event) => handleLinkChange(event.target.value)} placeholder="https://..." />
      </div>
    </div>
  )
}

export default function QuickWishlistEditor({ draft, onFieldChange, onWishlistChange }: Props) {
  const itemsRef = useRef(draft.wishlistItems)
  itemsRef.current = draft.wishlistItems

  const updateItem = (id: string, field: keyof WishlistDraftItem, value: string) => {
    onWishlistChange(itemsRef.current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const updateLinkMeta = (id: string, meta: LinkMeta | undefined) => {
    onWishlistChange(itemsRef.current.map((item) => (item.id === id ? { ...item, linkMeta: meta } : item)))
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
            <WishlistItemEditor
              key={item.id}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={removeItem}
              onLinkMetaChange={updateLinkMeta}
            />
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
