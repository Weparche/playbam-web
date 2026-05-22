import type { ReservationStatus } from '../../types'
import { statusLabel } from '../../lib/status'

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className="partner-statusBadge" data-status={status}>
      {statusLabel(status)}
    </span>
  )
}
