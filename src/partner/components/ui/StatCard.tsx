type Props = {
  label: string
  value: string | number
  helper?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export default function StatCard({ label, value, helper, tone = 'neutral' }: Props) {
  return (
    <div className="partner-statCard" data-tone={tone}>
      <div className="partner-statCard__label">{label}</div>
      <div className="partner-statCard__value">{value}</div>
      {helper ? <div className="partner-statCard__helper">{helper}</div> : null}
    </div>
  )
}
