import type { ReactNode } from 'react'
import Card from '../ui/Card'

type Props = {
  icon: ReactNode
  title: string
  description: string
}

export default function ValueCard({ icon, title, description }: Props) {
  return (
    <Card hover className="pb-valueCard">
      <div className="pb-valueCard__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="pb-valueCard__title">{title}</div>
      <div className="pb-valueCard__desc">{description}</div>
    </Card>
  )
}

