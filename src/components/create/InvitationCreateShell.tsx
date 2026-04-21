import { useRef, type ReactNode } from 'react'

type Props = {
  autosaveLabel: string
  saveState: 'idle' | 'saving' | 'saved'
  progressPercent: number
  progressLabel: string
  preview: ReactNode
  rail?: ReactNode
  headerActions?: ReactNode
  children: ReactNode
}

export default function InvitationCreateShell({
  autosaveLabel,
  saveState,
  preview,
  rail,
  headerActions,
  children,
}: Props) {
  const headerRef = useRef<HTMLElement | null>(null)

  const autosaveIconClass = saveState === 'saving'
    ? 'pb-createShell__autosaveIcon pb-createShell__autosaveIcon--spinning'
    : 'pb-createShell__autosaveIcon pb-createShell__autosaveIcon--check'

  return (
    <div className="pb-createShell">
      <header className="pb-createShell__header" ref={headerRef}>
<h1 className="pb-createShell__title">Jednostavno kreiranje pozivnice za tulume!</h1>
        <div className="pb-createShell__statusRow">
          <span className={`pb-createShell__autosave ${saveState === 'saved' ? 'pb-createShell__autosave--saved' : ''}`}>
            <span className={autosaveIconClass} aria-hidden="true">
              {saveState === 'saving' ? (
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 1.5a6.5 6.5 0 1 1-4.6 1.9" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              )}
            </span>
            {autosaveLabel}
          </span>
          {headerActions ? <div className="pb-createShell__headerActions">{headerActions}</div> : null}
        </div>
      </header>
      <div className="pb-createShell__body">
        <div className="pb-createShell__layout">
          <div className="pb-createShell__main">{children}</div>
          <div className="pb-createShell__preview">{preview}</div>
        </div>
        {rail}
      </div>
    </div>
  )
}
