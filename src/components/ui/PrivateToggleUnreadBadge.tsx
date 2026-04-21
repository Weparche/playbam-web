type Props = {
  count: number
}

export default function PrivateToggleUnreadBadge({ count }: Props) {
  const hasNew = count > 0
  return (
    <span
      className={`pb-privateToggle__badge${hasNew ? ' pb-privateToggle__badge--new' : ' pb-privateToggle__badge--zero'}`}
      aria-hidden
    >
      {hasNew ? count : 0}
    </span>
  )
}
