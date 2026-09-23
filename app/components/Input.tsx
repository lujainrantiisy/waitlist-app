import { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

// Labelled input with focus ring + error state. Accessible by default.
export function Input({ label, error, id, name, ...rest }: Props) {
  const inputId = id || name
  return (
    <div className="field">
      <label htmlFor={inputId} className="label">{label}</label>
      <input
        id={inputId}
        name={name}
        className={error ? 'input input-error' : 'input'}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="error-text">{error}</p>
      ) : null}
    </div>
  )
}
