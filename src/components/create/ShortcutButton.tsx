type Props = {
  id: string
  icon: string
  label: string
  active?: boolean
  onClick: (id: string) => void
}

export default function ShortcutButton({ id, icon, label, active, onClick }: Props) {
  return (
    <button
      type="button"
      className={`pb-shortcutButton ${active ? 'is-active' : ''}`}
      data-label={label}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={() => onClick(id)}
    >
      <span className="pb-shortcutButton__icon" aria-hidden="true">{icon}</span>
      <span className="pb-shortcutButton__label">{label}</span>
    </button>
  )
}
