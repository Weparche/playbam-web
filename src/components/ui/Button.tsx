import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'amber' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type Props = {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /** Shows a spinner, disables the button, and sets aria-busy. */
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'pb-btn',
        `pb-btn-${variant}`,
        size !== 'md' ? `pb-btn-${size}` : '',
        loading ? 'pb-btn-loading' : '',
        className.trim(),
      ].filter(Boolean).join(' ')}
    >
      {loading ? <span className="pb-btn__spinner" aria-hidden="true" /> : leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </button>
  )
}

