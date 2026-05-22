export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="partner-statCard">
      <div className="partner-statCard__label">{label}</div>
      <div className="partner-statCard__value">{value}</div>
    </div>
  )
}
