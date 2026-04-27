type Props = {
  total: number
  newCount: number
  /** Pojedinačna imenica u aria-labelu, npr. "želja" → "5 želja" (pojednostavljeno) */
  segmentLabel: string
}

export default function PrivateToggleSectionCounts({ total, newCount, segmentLabel }: Props) {
  const label =
    newCount > 0
      ? `Ukupno ${total} ${segmentLabel}, ${newCount} novih.`
      : `Ukupno ${total} ${segmentLabel}, nema novih.`
  return (
    <span className="pb-privateToggle__countGroup" role="img" aria-label={label}>
      <span className="pb-privateToggle__count pb-privateToggle__count--total" aria-hidden>
        {total}
      </span>
      {newCount > 0 ? (
        <span className="pb-privateToggle__count pb-privateToggle__count--new" aria-hidden>
          +{newCount}
        </span>
      ) : null}
    </span>
  )
}
