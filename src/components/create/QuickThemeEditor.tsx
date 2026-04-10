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
          {COVER_THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__themeCard ${activeTheme === option.id ? 'is-active' : ''}`}
              onClick={() => onThemeChange(option.id)}
            >
              <img className="pb-quickEditor__themeImage" src={option.image} alt="" aria-hidden="true" />
              <div className="pb-quickEditor__themeCopy">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
