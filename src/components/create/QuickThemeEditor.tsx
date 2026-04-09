import {
  ACCENT_OPTIONS,
  COVER_THEME_OPTIONS,
  EFFECT_OPTIONS,
  type AccentPalette,
  type CoverTheme,
  type EffectStyle,
  type InvitationCreateDraft,
} from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  mode: 'theme' | 'style'
  onThemeChange: (theme: CoverTheme) => void
  onEffectChange: (effect: EffectStyle) => void
  onAccentChange: (accent: AccentPalette) => void
}

export default function QuickThemeEditor({ draft, mode, onThemeChange, onEffectChange, onAccentChange }: Props) {
  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">{mode === 'theme' ? 'Cover / tema' : 'Poster i efekt'}</span>
        <div className="pb-quickEditor__optionGrid">
          {COVER_THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__optionCard ${draft.theme === option.id ? 'is-active' : ''}`}
              onClick={() => onThemeChange(option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Effect</span>
        <div className="pb-quickEditor__optionGrid">
          {EFFECT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__optionCard ${draft.effect === option.id ? 'is-active' : ''}`}
              onClick={() => onEffectChange(option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Akcent boje</span>
        <div className="pb-quickEditor__optionGrid">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__optionCard ${draft.accentPalette === option.id ? 'is-active' : ''}`}
              onClick={() => onAccentChange(option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
