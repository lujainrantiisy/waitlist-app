'use client'
import { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

// Button that always acknowledges a click: hover, pressed, disabled, loading.
export function Button({ loading, variant = 'primary', children, disabled, ...rest }: Props) {
  return (
    <button
      className={variant === 'ghost' ? 'btn btn-ghost' : 'btn'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      <span>{children}</span>
    </button>
  )
}
