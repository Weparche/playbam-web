import { useEffect, useRef, useState, type ReactNode } from 'react'
import Card from '../ui/Card'

type Props = {
  icon: ReactNode
  title: string
  description: string
  revealDelayMs?: number
}

export default function ValueCard({ icon, title, description, revealDelayMs = 0 }: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = cardRef.current
    if (!node || isVisible) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px 18% 0px',
      },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [isVisible])

  return (
    <Card
      hover
      ref={cardRef}
      className={`pb-valueCard ${isVisible ? 'pb-cardReveal' : 'pb-cardRevealPending'}`}
      style={isVisible ? { animationDelay: `${revealDelayMs}ms` } : undefined}
    >
      <div className="pb-valueCard__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="pb-valueCard__title">{title}</div>
      <div className="pb-valueCard__desc">{description}</div>
    </Card>
  )
}
