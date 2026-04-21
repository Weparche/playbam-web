import ShortcutButton from './ShortcutButton'
import { SHORTCUT_ITEMS } from './createTypes'

type Props = {
  activeShortcut: string | null
  onShortcutClick: (id: string) => void
  items?: ReadonlyArray<{ id: string; label: string; icon: string }>
}

export default function ShortcutRail({ activeShortcut, onShortcutClick, items = SHORTCUT_ITEMS }: Props) {
  return (
    <aside className="pb-shortcutRail" aria-label="Brzi shortcuti za uređivanje">
      {items.map((item) => (
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
