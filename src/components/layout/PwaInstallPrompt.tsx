import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISSED_KEY = 'vidimose-pwa-install-dismissed-at'
const DISMISS_DAYS = 7

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function recentlyDismissed() {
  const raw = window.localStorage.getItem(DISMISSED_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (!Number.isFinite(dismissedAt)) return false
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandaloneDisplay() || recentlyDismissed()) {
      return
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallEvent(null)
      window.localStorage.removeItem(DISMISSED_KEY)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (!visible || !installEvent) {
    return null
  }

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
  }

  const install = async () => {
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    setInstallEvent(null)
    setVisible(false)
    if (choice.outcome !== 'accepted') {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
  }

  return (
    <section className="pb-pwaInstall" aria-label="Instaliraj VidimoSe aplikaciju">
      <div className="pb-pwaInstall__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M10 17h4" />
          <path d="M12 7v6" />
          <path d="m9.5 10.5 2.5 2.5 2.5-2.5" />
        </svg>
      </div>
      <div className="pb-pwaInstall__copy">
        <strong>Želiš da ti je VidimoSe odmah na dohvat ruke?</strong>
        <span>Instaliraj VidimoSe na svoj mobilni uređaj.</span>
      </div>
      <button type="button" className="pb-pwaInstall__button" onClick={install}>
        Instaliraj
      </button>
      <button type="button" className="pb-pwaInstall__close" aria-label="Sakrij instalaciju" onClick={dismiss}>
        ×
      </button>
    </section>
  )
}
