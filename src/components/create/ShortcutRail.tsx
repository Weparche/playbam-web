import ShortcutButton from './ShortcutButton'
import { SHORTCUT_ITEMS, type ShortcutId } from './createTypes'

type Props = {
  activeShortcut: ShortcutId | null
  onShortcutClick: (id: ShortcutId) => void
}

export default function ShortcutRail({ activeShortcut, onShortcutClick }: Props) {
  return (
    <aside className="pb-shortcutRail" aria-label="Quick create shortcuts">
      {SHORTCUT_ITEMS.map((item) => (
        <ShortcutButton
          key={item.id}
          id={item.id}
          icon={item.icon}
          label={item.label}
          active={activeShortcut === item.id}
          onClick={onShortcutClick}
        />
      ))}
    </aside>
  )
}
