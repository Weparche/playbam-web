import type { ShortcutId } from './createTypes'

type Props = {
  id: ShortcutId
  icon: string
  label: string
  active?: boolean
  onClick: (id: ShortcutId) => void
}

export default function ShortcutButton({ id, icon, label, active, onClick }: Props) {
  return (
    <button
      type="button"
      className={`pb-shortcutButton ${active ? 'is-active' : ''}`}
      data-label={label}
      aria-label={label}
      title={label}
      onClick={() => onClick(id)}
    >
      <span className="pb-shortcutButton__icon" aria-hidden="true">{icon}</span>
    </button>
  )
}
