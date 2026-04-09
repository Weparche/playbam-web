import type { ReactNode } from 'react'

type Props = {
  autosaveLabel: string
  rail: ReactNode
  children: ReactNode
}

export default function InvitationCreateShell({ autosaveLabel, rail, children }: Props) {
  return (
    <div className="pb-createShell">
      <header className="pb-createShell__header">
        <span className="pb-createShell__eyebrow">VidimOse create</span>
        <h1 className="pb-createShell__title">Jednostavno kreiranje pozivnice za tulume!</h1>
        <span className="pb-createShell__autosave">{autosaveLabel}</span>
      </header>
      <div className="pb-createShell__layout">
        <div className="pb-createShell__main">{children}</div>
        {rail}
      </div>
    </div>
  )
}
