type SkeletonProps = {
  /** Width — any CSS length. Defaults to 100%. */
  width?: string
  /** Height — any CSS length. Defaults to 1rem. */
  height?: string
  /** Render as a rounded text line (pill radius) instead of a block. */
  variant?: 'block' | 'text' | 'circle'
  className?: string
}

/**
 * Low-level shimmer placeholder. Decorative — hidden from assistive tech
 * (the surrounding region should expose an aria-busy / loading label).
 */
export default function PartnerSkeleton({
  width = '100%',
  height = '1rem',
  variant = 'block',
  className = '',
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={['partner-skeleton', `partner-skeleton--${variant}`, className].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  )
}

/** A vertical stack of skeleton rows for list/table placeholders. */
export function PartnerSkeletonRows({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={['partner-skeletonRows', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="partner-skeletonRow">
          <PartnerSkeleton variant="circle" width="2.6rem" height="2.6rem" />
          <div className="partner-skeletonRow__body">
            <PartnerSkeleton variant="text" width="42%" height="0.85rem" />
            <PartnerSkeleton variant="text" width="68%" height="0.7rem" />
          </div>
        </div>
      ))}
    </div>
  )
}
