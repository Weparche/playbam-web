import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  size?: 'default' | 'narrow' | 'wide'
}

export default function Container({ children, className = '', size = 'default', ...rest }: Props) {
  return (
    <div
      className={['pb-container', size !== 'default' ? `pb-container--${size}` : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

