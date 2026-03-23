import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover }: Props) {
  return <div className={['pb-card', hover ? 'pb-hover' : '', className].join(' ')}>{children}</div>
}

