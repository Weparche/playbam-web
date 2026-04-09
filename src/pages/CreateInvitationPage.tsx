import { useEffect, useMemo, useState } from 'react'

import InvitationCreateShell from '../components/create/InvitationCreateShell'
import InvitationLivePreview from '../components/create/InvitationLivePreview'
import InvitationMainEditor from '../components/create/InvitationMainEditor'
import InvitationPreviewCard from '../components/create/InvitationPreviewCard'
import FloatingEditPanel from '../components/create/FloatingEditPanel'
import QuickDateTimeEditor from '../components/create/QuickDateTimeEditor'
import QuickLocationEditor from '../components/create/QuickLocationEditor'
import QuickMessageEditor from '../components/create/QuickMessageEditor'
import QuickRSVPEditor from '../components/create/QuickRSVPEditor'
import QuickThemeEditor from '../components/create/QuickThemeEditor'
import QuickTitleEditor from '../components/create/QuickTitleEditor'
import QuickWishlistEditor from '../components/create/QuickWishlistEditor'
import ShortcutRail from '../components/create/ShortcutRail'
import {
  buildTimeRangeValue,
  DEFAULT_CREATE_DRAFT,
  type AccentPalette,
  type CoverTheme,
  type EffectStyle,
  type InvitationCreateDraft,
  type ShortcutId,
  type TitleFont,
  type WishlistDraftItem,
} from '../components/create/createTypes'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { createInvitation } from '../lib/invitationApi'

const LOCAL_STORAGE_KEY = 'playbam.quick-create.draft'

function readStoredDraft() {
  if (typeof window === 'undefined') {
    return DEFAULT_CREATE_DRAFT
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return DEFAULT_CREATE_DRAFT

    const parsed = JSON.parse(raw) as Partial<InvitationCreateDraft>
    return {
      ...DEFAULT_CREATE_DRAFT,
      ...parsed,
      wishlistItems: Array.isArray(parsed.wishlistItems) ? parsed.wishlistItems : DEFAULT_CREATE_DRAFT.wishlistItems,
    }
  } catch {
    return DEFAULT_CREATE_DRAFT
  }
}

export default function CreateInvitationPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [draft, setDraft] = useState<InvitationCreateDraft>(() => readStoredDraft())
  const [activeShortcut, setActiveShortcut] = useState<ShortcutId | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('saved')
  const [savingInvitation, setSavingInvitation] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setSaveState('saving')
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft))
      setSaveState('saved')
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [draft])

  const autosaveLabel = saveState === 'saving' ? 'Autosave u tijeku…' : 'Spremljeno lokalno'

  const updateField = <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const updateWishlistItems = (items: WishlistDraftItem[]) => {
    setDraft((current) => ({ ...current, wishlistItems: items }))
  }

  const applyStylePreset = (theme: CoverTheme, font: TitleFont, effect: EffectStyle, accent: AccentPalette) => {
    setDraft((current) => ({
      ...current,
      theme,
      titleFont: font,
      effect,
      accentPalette: accent,
    }))
  }

  const handleShortcutClick = (shortcut: ShortcutId) => {
    setActiveShortcut((current) => (current === shortcut ? null : shortcut))
  }

  const handleCreateInvitation = async () => {
    if (!draft.title.trim() || !draft.celebrantName.trim() || !draft.date.trim() || !draft.time.trim() || !draft.timeEnd.trim() || !draft.locationName.trim()) {
      setFormError('Upiši naslov, ime slavljenika, datum, vrijeme od-do i naziv lokacije.')
      return
    }

    if (draft.timeEnd <= draft.time) {
      setFormError('Vrijeme završetka mora biti nakon vremena početka.')
      return
    }

    setSavingInvitation(true)
    setFormError('')

    try {
      const created = await createInvitation({
        title: draft.title.trim(),
        celebrantName: draft.celebrantName.trim(),
        date: draft.date,
        time: buildTimeRangeValue(draft.time, draft.timeEnd),
        location: [draft.locationName.trim(), draft.locationAddress.trim()].filter(Boolean).join(', '),
        message: draft.message.trim() || undefined,
        coverImage: draft.theme,
        theme: draft.theme,
      })

      window.location.assign(`/pozivnica/${created.publicSlug || created.shareToken}`)
    } catch {
      setFormError('Spremanje pozivnice trenutno nije uspjelo.')
    } finally {
      setSavingInvitation(false)
    }
  }

  const renderPanel = () => {
    switch (activeShortcut) {
      case 'title':
        return (
          <FloatingEditPanel
            open
            title="Naslov i font"
            description="Najvažniji dio editora. Ovdje nastaje prvi dojam pozivnice."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickTitleEditor draft={draft} onFieldChange={updateField} onStylePreset={applyStylePreset} />
          </FloatingEditPanel>
        )
      case 'dateTime':
        return (
          <FloatingEditPanel
            open
            title="Datum i vrijeme"
            description="Brzi picker za osnovne informacije koje gost vidi prve."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickDateTimeEditor draft={draft} today={today} onFieldChange={updateField} />
          </FloatingEditPanel>
        )
      case 'location':
        return (
          <FloatingEditPanel
            open
            title="Lokacija"
            description="Naziv igraonice, adresa i kontekst lokacije."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickLocationEditor draft={draft} onFieldChange={updateField} />
          </FloatingEditPanel>
        )
      case 'message':
        return (
          <FloatingEditPanel
            open
            title="Poruka"
            description="Topla kratka poruka koja pozivnici daje osobni ton."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickMessageEditor draft={draft} onFieldChange={updateField} />
          </FloatingEditPanel>
        )
      case 'wishlist':
        return (
          <FloatingEditPanel
            open
            title="Wishlist i dodatci"
            description="Uključi listu želja, dodaj prijedloge poklona i po želji grupni poklon."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickWishlistEditor draft={draft} onFieldChange={updateField} onWishlistChange={updateWishlistItems} />
          </FloatingEditPanel>
        )
      case 'theme':
        return (
          <FloatingEditPanel
            open
            title="Cover i tema"
            description="Biraj poster smjer i osnovnu atmosferu pozivnice."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickThemeEditor
              draft={draft}
              mode="theme"
              onThemeChange={(value) => updateField('theme', value)}
              onEffectChange={(value) => updateField('effect', value)}
              onAccentChange={(value) => updateField('accentPalette', value)}
            />
          </FloatingEditPanel>
        )
      case 'style':
        return (
          <FloatingEditPanel
            open
            title="Stil i boje"
            description="Fino podešavanje efekta i akcent boja bez gubljenja konteksta."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickThemeEditor
              draft={draft}
              mode="style"
              onThemeChange={(value) => updateField('theme', value)}
              onEffectChange={(value) => updateField('effect', value)}
              onAccentChange={(value) => updateField('accentPalette', value)}
            />
          </FloatingEditPanel>
        )
      case 'rsvp':
        return (
          <FloatingEditPanel
            open
            title="RSVP"
            description="Uključi potvrdu dolaska i odaberi mood ikonica koje gost vidi."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickRSVPEditor draft={draft} onFieldChange={updateField} />
          </FloatingEditPanel>
        )
      case 'settings':
        return (
          <FloatingEditPanel
            open
            title="Postavke"
            description="Priprema za napredne postavke koje ćemo kasnije spojiti na backend draft logiku."
            onClose={() => setActiveShortcut(null)}
          >
            <div className="pb-quickEditor">
              <label className="pb-quickEditor__toggle">
                <input type="checkbox" checked={draft.rsvpEnabled} onChange={(event) => updateField('rsvpEnabled', event.target.checked)} />
                <span>RSVP uključen</span>
              </label>
              <label className="pb-quickEditor__toggle">
                <input type="checkbox" checked={draft.wishlistEnabled} onChange={(event) => updateField('wishlistEnabled', event.target.checked)} />
                <span>Wishlist uključen</span>
              </label>
              <label className="pb-quickEditor__toggle">
                <input type="checkbox" checked={draft.savingsEnabled} onChange={(event) => updateField('savingsEnabled', event.target.checked)} />
                <span>Grupni poklon / štednja uključena</span>
              </label>
              <p className="pb-quickEditor__hint">
                Kasnije ovdje spajamo privatnost, share settings, reminder logiku i pravi autosave draft endpoint.
              </p>
            </div>
          </FloatingEditPanel>
        )
      case 'preview':
        return (
          <FloatingEditPanel
            open
            title="Pregled"
            description="Brzi pregled kako pozivnica izgleda gostu bez napuštanja editora."
            onClose={() => setActiveShortcut(null)}
          >
            <InvitationLivePreview draft={draft} compact />
          </FloatingEditPanel>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <main className="pb-main pb-main--createV2">
        <InvitationCreateShell
          autosaveLabel={autosaveLabel}
          preview={<InvitationPreviewCard draft={draft} compact />}
          rail={<ShortcutRail activeShortcut={activeShortcut} onShortcutClick={handleShortcutClick} />}
        >
          <InvitationMainEditor draft={draft} onOpenShortcut={handleShortcutClick} />

          <Card className="pb-createFooterAction">
            <div className="pb-createFooterAction__copy">
              <strong>Spremno za objavu</strong>
              <span>Osnovni podaci i preview su povezani. Wishlist, stil i RSVP se već vide uživo u editoru.</span>
            </div>
            <Button variant="amber" type="button" onClick={handleCreateInvitation} disabled={savingInvitation}>
              {savingInvitation ? 'Spremamo…' : 'Izradi pozivnicu'}
            </Button>
          </Card>

          {formError ? <div className="pb-inlineNote pb-inlineNote--error">{formError}</div> : null}
        </InvitationCreateShell>
        {renderPanel()}
      </main>
      <Footer />
    </>
  )
}
