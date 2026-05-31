import { useEffect, useMemo, useRef, useState } from 'react'
import { COVER_THEME_MODAL_TABS, COVER_THEME_OPTIONS, getThemeTab, type CoverTheme, type CoverThemeTab, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onThemeChange: (theme: CoverTheme) => void
}

export default function QuickThemeEditor({ draft, onThemeChange }: Props) {
  const activeTheme = COVER_THEME_OPTIONS.some((option) => option.id === draft.theme)
    ? draft.theme
    : COVER_THEME_OPTIONS[0].id
  const [activeTab, setActiveTab] = useState<CoverThemeTab>(() => getThemeTab(activeTheme))
  const previousThemeRef = useRef<CoverTheme>(activeTheme)
  const filteredThemes = useMemo(() => COVER_THEME_OPTIONS.filter((option) => option.tab === activeTab), [activeTab])

  useEffect(() => {
    if (previousThemeRef.current !== activeTheme) {
      previousThemeRef.current = activeTheme
      queueMicrotask(() => setActiveTab(getThemeTab(activeTheme)))
    }
  }, [activeTheme])

  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__block">
        <div className="pb-quickEditor__tabs" role="tablist" aria-label="Vrsta pozivnice">
          {COVER_THEME_MODAL_TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`pb-quickEditor__tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="pb-quickEditor__themeGrid">
          {filteredThemes.map((option) => {
            const isActive = activeTheme === option.id
            return (
              <button
                key={option.id}
                type="button"
                className={`pb-quickEditor__themeCard ${isActive ? 'is-active' : ''}`}
                onClick={() => onThemeChange(option.id)}
              >
                <div className="pb-quickEditor__themeImageWrap">
                  <img className="pb-quickEditor__themeImage" src={option.image} alt="" aria-hidden="true" />
                  {isActive ? (
                    <span className="pb-quickEditor__themeCheck" aria-hidden="true">
                      <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="#5b3df5" />
                        <path d="M6 10.5l2.8 2.8 5.2-5.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <div className="pb-quickEditor__themeCopy">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
