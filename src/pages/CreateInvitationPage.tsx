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
import QuickWishlistEditor from '../components/create/QuickWishlistEditor'
import ShortcutRail from '../components/create/ShortcutRail'
import {
  buildCreateProgress,
  buildTimeRangeValue,
  DEFAULT_CREATE_DRAFT,
  normalizeCreateTheme,
  normalizeRsvpMood,
  normalizeTitleColor,
  normalizeTitleFont,
  normalizeTitleOutline,
  normalizeTitleSize,
  RSVP_GUEST_HEADLINE,
  type InvitationCreateDraft,
  type ShortcutId,
  type WishlistDraftItem,
} from '../components/create/createTypes'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { createInvitation } from '../lib/invitationApi'
import { readStoredHostToken, writeStoredHostToken } from '../lib/hostWebSession'
import { writeStoredTemporaryIdentity } from '../lib/tempWebIdentity'

const LOCAL_STORAGE_KEY = 'playbam.quick-create.draft'
const DEV_HOST_AUTH_TOKEN =
  typeof import.meta.env.VITE_DEV_HOST_AUTH_TOKEN === 'string'
    ? import.meta.env.VITE_DEV_HOST_AUTH_TOKEN.trim()
    : ''

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
      theme: normalizeCreateTheme(typeof parsed.theme === 'string' ? parsed.theme : DEFAULT_CREATE_DRAFT.theme),
      titleFont: normalizeTitleFont(typeof parsed.titleFont === 'string' ? parsed.titleFont : DEFAULT_CREATE_DRAFT.titleFont),
      titleColor: normalizeTitleColor(typeof parsed.titleColor === 'string' ? parsed.titleColor : DEFAULT_CREATE_DRAFT.titleColor),
      titleOutline: normalizeTitleOutline(typeof parsed.titleOutline === 'string' ? parsed.titleOutline : DEFAULT_CREATE_DRAFT.titleOutline),
      titleSize: normalizeTitleSize(typeof parsed.titleSize === 'string' ? parsed.titleSize : DEFAULT_CREATE_DRAFT.titleSize),
      rsvpMood: normalizeRsvpMood(typeof parsed.rsvpMood === 'string' ? parsed.rsvpMood : DEFAULT_CREATE_DRAFT.rsvpMood),
      rsvpEnabled: true,
      rsvpPrompt: RSVP_GUEST_HEADLINE,
      wishlistItems: Array.isArray(parsed.wishlistItems) ? parsed.wishlistItems : DEFAULT_CREATE_DRAFT.wishlistItems,
    }
  } catch {
    return DEFAULT_CREATE_DRAFT
  }
}

function buildCelebrantFallback(title: string, fallbackName: string) {
  return title.trim() || fallbackName.trim() || 'Slavljenik'
}

export default function CreateInvitationPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [draft, setDraft] = useState<InvitationCreateDraft>(() => readStoredDraft())
  const [activeShortcut, setActiveShortcut] = useState<ShortcutId | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('saved')
  const [savingInvitation, setSavingInvitation] = useState(false)
  const [formError, setFormError] = useState('')

  const { completedSteps, totalSteps, progressPercent, titleReady, dateReady, locationReady } = buildCreateProgress(draft)
  const progressLabel = completedSteps === totalSteps ? 'Spremno za objavu' : `${totalSteps - completedSteps} koraka do objave`

  const missingSteps: string[] = []
  if (!titleReady) missingSteps.push('naslov')
  if (!dateReady) missingSteps.push('datum i vrijeme')
  if (!locationReady) missingSteps.push('lokaciju')

  const footerHeadline = completedSteps === totalSteps
    ? 'Spremno za objavu'
    : missingSteps.length > 0
      ? `Popuni: ${missingSteps.join(', ')}`
      : `Još ${totalSteps - completedSteps} koraka`

  const footerDescription = completedSteps === totalSteps
    ? 'Svi koraci su gotovi. Klikni za objavu pozivnice!'
    : 'Naslov, datum, vrijeme i lokacija su obavezni za objavu.'

  useEffect(() => {
    setSaveState('saving')
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ ...draft, rsvpEnabled: true, rsvpPrompt: RSVP_GUEST_HEADLINE }),
      )
      setSaveState('saved')
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [draft])

  const autosaveLabel = saveState === 'saving' ? 'Autosave u tijeku…' : 'Spremljeno lokalno'

  const updateField = <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => {
    const nextValue = (field === 'rsvpEnabled' ? true : value) as InvitationCreateDraft[K]
    setDraft((current) => ({
      ...current,
      [field]: nextValue,
    }))
  }

  const updateWishlistItems = (items: WishlistDraftItem[]) => {
    setDraft((current) => ({ ...current, wishlistItems: items }))
  }

  const handleShortcutClick = (shortcut: ShortcutId) => {
    setActiveShortcut((current) => (current === shortcut ? null : shortcut))
  }

  const handleCreateInvitation = async () => {
    if (!draft.title.trim() || !draft.date.trim() || !draft.time.trim() || !draft.timeEnd.trim() || !draft.locationName.trim()) {
      setFormError('Upiši naslov, datum, vrijeme od-do i naziv lokacije.')
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
        celebrantName: buildCelebrantFallback(draft.title, draft.celebrantName),
        titleFont: draft.titleFont,
        titleColor: draft.titleColor,
        titleOutline: draft.titleOutline,
        titleSize: draft.titleSize,
        date: draft.date,
        time: buildTimeRangeValue(draft.time, draft.timeEnd),
        location: [draft.locationName.trim(), draft.locationAddress.trim()].filter(Boolean).join(', '),
        message: draft.message.trim() || undefined,
        coverImage: draft.theme,
        theme: draft.theme,
      }, null)

      const nextHostToken = created.hostAuthToken || readStoredHostToken() || DEV_HOST_AUTH_TOKEN
      if (nextHostToken) {
        writeStoredHostToken(nextHostToken)
      }
      writeStoredTemporaryIdentity(null)

      window.location.assign(`/pozivnica/${created.publicSlug || created.shareToken}`)
    } catch {
      setFormError('Spremanje pozivnice trenutno nije uspjelo.')
    } finally {
      setSavingInvitation(false)
    }
  }

  const renderPanel = () => {
    switch (activeShortcut) {
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
            title="Tema"
            description="Odaberi jednu od pet gotovih naslovnica za pozivnicu."
            onClose={() => setActiveShortcut(null)}
          >
            <QuickThemeEditor draft={draft} onThemeChange={(value) => updateField('theme', value)} />
          </FloatingEditPanel>
        )
      case 'rsvp':
        return (
          <FloatingEditPanel
            open
            title="RSVP ikone"
            description="Odaberi jedan od setova ikonica za tri odgovora gosta."
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
            description="Dodatne opcije koje još ostaju povezane uz wishlist i grupni poklon."
            onClose={() => setActiveShortcut(null)}
          >
            <div className="pb-quickEditor">
              <label className="pb-quickEditor__toggle">
                <input type="checkbox" checked={draft.wishlistEnabled} onChange={(event) => updateField('wishlistEnabled', event.target.checked)} />
                <span>Wishlist uključen</span>
              </label>
              <label className="pb-quickEditor__toggle">
                <input type="checkbox" checked={draft.savingsEnabled} onChange={(event) => updateField('savingsEnabled', event.target.checked)} />
                <span>Grupni poklon / štednja uključena</span>
              </label>
              <p className="pb-quickEditor__hint">
                RSVP ostaje uključen, a ovdje kasnije možemo spojiti privatnost, share settings i pravi autosave draft endpoint.
              </p>
            </div>
          </FloatingEditPanel>
        )
      case 'preview':
        return (
          <FloatingEditPanel
            open
            title="Pregled"
            description="Brzi pregled kako pozivnica izgleda gostu."
            panelClassName="pb-floatingPanel--preview"
            onClose={() => setActiveShortcut(null)}
          >
            <div className="pb-createStudio__previewPopup">
              <InvitationLivePreview draft={draft} compact />
            </div>
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
          saveState={saveState}
          progressPercent={progressPercent}
          progressLabel={progressLabel}
          preview={<InvitationPreviewCard draft={draft} compact />}
          rail={<ShortcutRail activeShortcut={activeShortcut} onShortcutClick={(id) => handleShortcutClick(id as ShortcutId)} />}
        >
          <InvitationMainEditor draft={draft} onFieldChange={updateField} onOpenShortcut={handleShortcutClick} />

          <Card className="pb-createFooterAction">
            <div className="pb-createFooterAction__stack">
              <div className="pb-createEditor__progress pb-createFooterAction__progress">
                <div className="pb-createEditor__progressMeta">
                  <span>{completedSteps} od {totalSteps} koraka spremno</span>
                  <span>{progressLabel}</span>
                </div>
                <div className="pb-createEditor__progressTrack" aria-hidden="true">
                  <span className="pb-createEditor__progressFill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="pb-createFooterAction__row">
                <div className="pb-createFooterAction__copy">
                  <strong>{footerHeadline}</strong>
                  <span>{footerDescription}</span>
                </div>
                <Button variant="amber" type="button" onClick={handleCreateInvitation} disabled={savingInvitation}>
                  {savingInvitation ? 'Spremamo…' : 'Izradi pozivnicu'}
                </Button>
              </div>
            </div>
          </Card>

          {formError ? <div className="pb-inlineNote pb-inlineNote--error">{formError}</div> : null}
        </InvitationCreateShell>
        {renderPanel()}
      </main>
      <Footer />
    </>
  )
}
