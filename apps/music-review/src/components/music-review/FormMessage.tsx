type FormMessageProps = {
  error?: string | null
  message?: string | null
}

export default function FormMessage({ error, message }: FormMessageProps) {
  return (
    <>
      {error ? <p className='form__error'>{error}</p> : null}
      {message ? <p className='form__note'>{message}</p> : null}
    </>
  )
}
