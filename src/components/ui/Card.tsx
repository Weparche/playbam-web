import { forwardRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  hover?: boolean
  style?: React.CSSProperties
}

const Card = forwardRef<HTMLDivElement, Props>(function Card({ children, className = '', hover, style }, ref) {
  return <div ref={ref} className={['pb-card', hover ? 'pb-hover' : '', className].join(' ')} style={style}>{children}</div>
})

export default Card
