type FormFieldProps = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: FormFieldProps) {
  return (
    <label className='form__control'>
      <span className='form__label'>{label}</span>
      <input
        type={type}
        className='form__input'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {error ? <span className='form__error'>{error}</span> : null}
    </label>
  )
}
