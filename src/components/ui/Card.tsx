import { forwardRef, type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean
  tone?: 'default' | 'warm' | 'soft' | 'danger'
}

const Card = forwardRef<HTMLDivElement, Props>(function Card({ children, className = '', hover, tone = 'default', style, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={['pb-card', tone !== 'default' ? `pb-card--${tone}` : '', hover ? 'pb-hover' : '', className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
})

export default Card
