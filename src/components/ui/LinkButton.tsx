import type { AnchorHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'amber' | 'ghost'

type Props = {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  disabled?: boolean
} & AnchorHTMLAttributes<HTMLAnchorElement>

export default function LinkButton({
  variant = 'primary',
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <a
      {...rest}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : rest.tabIndex}
      className={[
        'pb-btn',
        `pb-btn-${variant}`,
        disabled ? 'pb-btn-disabled' : '',
        className.trim(),
      ].filter(Boolean).join(' ')}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        rest.onClick?.(e)
      }}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </a>
  )
}

