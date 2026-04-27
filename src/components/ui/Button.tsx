import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'amber' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type Props = {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={[
        'pb-btn',
        `pb-btn-${variant}`,
        size !== 'md' ? `pb-btn-${size}` : '',
        className.trim(),
      ].filter(Boolean).join(' ')}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </button>
  )
}

