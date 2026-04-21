import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { unfurlLink, proxyImageUrl } from '../../lib/invitationApi'
import type { InvitationCreateDraft, LinkMeta, WishlistDraftItem } from './createTypes'

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

export type QuickWishlistEditorRef = {
  addPoklon: () => void
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
  const [imgOk, setImgOk] = useState(true)
  const hasOgImage = !!meta.image
  const showImage = hasOgImage && imgOk

  if (!meta.image && !meta.favicon && !meta.domain) return null

  return (
    <div className={`pb-quickEditor__linkPreview${showImage ? ' pb-quickEditor__linkPreview--rich' : ''}`}>
      {showImage ? (
        <img
          className="pb-quickEditor__linkOgImage"
          src={proxyImageUrl(meta.image!)}
          alt=""
          aria-hidden="true"
          onError={() => setImgOk(false)}
        />
      ) : null}
      <div className="pb-quickEditor__linkBar">
        {meta.favicon ? (
          <img
            className="pb-quickEditor__linkFavicon"
            src={proxyImageUrl(meta.favicon)}
            alt=""
            aria-hidden="true"
            onError={(event) => { (event.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}
        <div className="pb-quickEditor__linkMeta">
          {meta.title ? <span className="pb-quickEditor__linkTitle">{meta.title}</span> : null}
          {meta.domain ? <span className="pb-quickEditor__linkDomain">{meta.domain}</span> : null}
        </div>
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
  forceTitleFocus,
}: {
  item: WishlistDraftItem
  index: number
  onUpdate: (id: string, field: keyof WishlistDraftItem, value: string) => void
  onRemove: (id: string) => void
  onLinkMetaChange: (id: string, meta: LinkMeta | undefined) => void
  forceTitleFocus?: boolean
}) {
  const [fetching, setFetching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchedUrlRef = useRef(item.link)
  const onLinkMetaChangeRef = useRef(onLinkMetaChange)
  onLinkMetaChangeRef.current = onLinkMetaChange
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    if (forceTitleFocus) {
      titleInputRef.current?.focus()
    }
  }, [forceTitleFocus])

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
        <span className="pb-formLabel">Naziv poklona <span className="pb-formLabel__required">*</span></span>
        <input
          ref={titleInputRef}
          className="pb-input"
          required
          aria-required="true"
          value={item.title}
          onChange={(event) => onUpdate(item.id, 'title', event.target.value)}
        />
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

const QuickWishlistEditor = forwardRef<QuickWishlistEditorRef, Props>(function QuickWishlistEditor(
  { draft, onFieldChange, onWishlistChange },
  ref,
) {
  const [addGiftError, setAddGiftError] = useState('')
  const [focusTitleItemId, setFocusTitleItemId] = useState<string | null>(null)

  const updateItem = (id: string, field: keyof WishlistDraftItem, value: string) => {
    if (field === 'title') {
      setAddGiftError('')
      setFocusTitleItemId(null)
    }
    onWishlistChange(draft.wishlistItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const updateLinkMeta = (id: string, meta: LinkMeta | undefined) => {
    onWishlistChange(draft.wishlistItems.map((item) => (item.id === id ? { ...item, linkMeta: meta } : item)))
  }

  const addItem = useCallback(() => {
    const last = draft.wishlistItems[draft.wishlistItems.length - 1]
    if (last && !last.title.trim()) {
      setAddGiftError('Upiši naziv poklona prije dodavanja novog.')
      setFocusTitleItemId(last.id)
      return
    }
    setAddGiftError('')
    setFocusTitleItemId(null)
    onWishlistChange([
      ...draft.wishlistItems,
      { id: `wish-${Date.now()}`, title: '', note: '', link: '' },
    ])
  }, [draft.wishlistItems, onWishlistChange])

  useImperativeHandle(ref, () => ({ addPoklon: addItem }), [addItem])

  const removeItem = (id: string) => {
    onWishlistChange(draft.wishlistItems.filter((item) => item.id !== id))
  }

  return (
    <div className="pb-quickEditor">
      <label className="pb-quickEditor__toggle">
        <input type="checkbox" checked={draft.wishlistEnabled} onChange={(event) => onFieldChange('wishlistEnabled', event.target.checked)} />
        <span>Uključi listu želja</span>
      </label>

      {draft.wishlistEnabled ? (
        <div className="pb-quickEditor__list">
          <div className="pb-quickEditor__hint">Polje <strong>Naziv poklona</strong> je obavezno za svaku stavku.</div>
          {draft.wishlistItems.map((item, index) => (
            <WishlistItemEditor
              key={item.id}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={removeItem}
              onLinkMetaChange={updateLinkMeta}
              forceTitleFocus={focusTitleItemId === item.id}
            />
          ))}
          {addGiftError ? <div className="pb-inlineNote pb-inlineNote--error">{addGiftError}</div> : null}
        </div>
      ) : null}
    </div>
  )
})

export default QuickWishlistEditor
