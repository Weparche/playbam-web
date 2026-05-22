import type { ReservationStatus } from '../../types'
import { statusColor, statusLabel } from '../../lib/status'

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className="partner-statusBadge" style={{ backgroundColor: statusColor(status) }}>
      {statusLabel(status)}
    </span>
  )
}
