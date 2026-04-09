import { STYLE_PRESETS, TITLE_FONT_OPTIONS, type EffectStyle, type InvitationCreateDraft, type TitleFont, type CoverTheme, type AccentPalette } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onFieldChange: <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => void
  onStylePreset: (theme: CoverTheme, font: TitleFont, effect: EffectStyle, accent: AccentPalette) => void
}

export default function QuickTitleEditor({ draft, onFieldChange, onStylePreset }: Props) {
  const activePreset =
    STYLE_PRESETS.find((preset) => preset.theme === draft.theme && preset.font === draft.titleFont && preset.effect === draft.effect && preset.accent === draft.accentPalette)?.id ?? null

  return (
    <div className="pb-quickEditor">
      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Style preset</span>
        <div className="pb-quickEditor__presetGrid">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`pb-quickEditor__preset ${activePreset === preset.id ? 'is-active' : ''}`}
              onClick={() => onStylePreset(preset.theme, preset.font, preset.effect, preset.accent)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.vibe}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="pb-formField">
        <span className="pb-formLabel">Naslov događaja</span>
        <input className="pb-input" value={draft.title} onChange={(event) => onFieldChange('title', event.target.value)} />
      </label>

      <label className="pb-formField">
        <span className="pb-formLabel">Ime slavljenika</span>
        <input className="pb-input" value={draft.celebrantName} onChange={(event) => onFieldChange('celebrantName', event.target.value)} />
      </label>

      <div className="pb-quickEditor__block">
        <span className="pb-quickEditor__label">Font preview</span>
        <div className="pb-quickEditor__fontGrid">
          {TITLE_FONT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pb-quickEditor__fontCard ${draft.titleFont === option.id ? 'is-active' : ''}`}
              onClick={() => onFieldChange('titleFont', option.id)}
            >
              <span className={`pb-quickEditor__fontPreview pb-quickEditor__fontPreview--${option.id}`}>{option.preview}</span>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
