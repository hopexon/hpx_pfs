'use client'

import { useState } from 'react'

type UseAuthFormOptions<T> = {
  initialValues: T | (() => T)
}

export function useAuthForm<T extends Record<string, string>>({ initialValues }: UseAuthFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onChangeField = (key: keyof T, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetForm = (nextValues?: T) => {
    if (nextValues) {
      setValues(nextValues)
    }
    setErrors({})
    setMessage(null)
  }

  return {
    values,
    setValues,
    errors,
    setErrors,
    isPending,
    setIsPending,
    message,
    setMessage,
    onChangeField,
    resetForm,
  }
}
