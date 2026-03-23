import type { ReactNode } from 'react'
import Card from '../ui/Card'

type Props = {
  step: string
  title: string
  description: string
  icon: ReactNode
}

export default function FeatureStep({ step, title, description, icon }: Props) {
  return (
    <Card hover className="pb-step">
      <div className="pb-step__top">
        <div className="pb-step__icon" aria-hidden="true">
          {icon}
        </div>
        <div className="pb-step__step">{step}</div>
      </div>
      <div className="pb-step__title">{title}</div>
      <div className="pb-step__desc">{description}</div>
    </Card>
  )
}

