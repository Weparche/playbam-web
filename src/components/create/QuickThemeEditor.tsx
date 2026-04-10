import { COVER_THEME_OPTIONS, type CoverTheme, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onThemeChange: (theme: CoverTheme) => void
}

export default function QuickThemeEditor({ draft, onThemeChange }: Props) {
  const activeTheme = COVER_THEME_OPTIONS.some((option) => option.id === draft.theme)
    ? draft.theme
    : COVER_THEME_OPTIONS[0].id

  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Tema</span>
        <div className="pb-quickEditor__themeGrid">
          {COVER_THEME_OPTIONS.map((option) => {
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
