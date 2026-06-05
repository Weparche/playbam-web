import { useEffect } from 'react'

type Props = {
  message: string | null
  onDismiss: () => void
  duration?: number
}

export default function PartnerToast({ message, onDismiss, duration = 2500 }: Props) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="partner-toast" role="status" aria-live="polite">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
