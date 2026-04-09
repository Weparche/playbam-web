import { forwardRef, type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, Props>(function Card({ children, className = '', hover, style, ...rest }, ref) {
  return <div ref={ref} className={['pb-card', hover ? 'pb-hover' : '', className].join(' ')} style={style} {...rest}>{children}</div>
})

export default Card
