import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'amber' | 'ghost'

type Props = {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  variant = 'primary',
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
        className.trim(),
      ].join(' ')}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </button>
  )
}

