'use client'

import Link from 'next/link'
import type { FormEvent } from 'react'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { useAuthForm } from '@/hooks/useAuthForm'
import type { MusicReviewChangeEmailInput } from '@/lib/music-review/auth/types'
import FormField from '@/components/music-review/FormField'
import FormMessage from '@/components/music-review/FormMessage'

const emptyInput: MusicReviewChangeEmailInput = {
  currentEmail: '',
  newEmail: '',
  newEmailConfirm: '',
}

export default function ChangeEmailForm() {
  const { authApi, session } = useMusicReviewAuth()
  const { values, errors, isPending, message, onChangeField, setErrors, setIsPending, setMessage } = useAuthForm({ initialValues: emptyInput })

  const resolvedCurrentEmail = values.currentEmail || session?.user.email || ''

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setIsPending(true)

    const submitValues: MusicReviewChangeEmailInput = {
      ...values,
      currentEmail: resolvedCurrentEmail,
    }

    const result = await authApi.updateEmail(submitValues)
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setMessage(result.message ?? 'Address updated successfully')
  }

  return (
    <div className='form__card'>
      <form className='form__grid' onSubmit={onSubmit} noValidate>
        <FormField
          label='Current Email'
          type='email'
          value={resolvedCurrentEmail}
          onChange={(v) => onChangeField('currentEmail', v)}
          error={errors.currentEmail}
          disabled={isPending}
        />
        <FormField
          label='New Email'
          type='email'
          value={values.newEmail}
          onChange={(v) => onChangeField('newEmail', v)}
          error={errors.newEmail}
          disabled={isPending}
        />
        <FormField
          label='Confirm New Email'
          type='email'
          value={values.newEmailConfirm}
          onChange={(v) => onChangeField('newEmailConfirm', v)}
          error={errors.newEmailConfirm}
          disabled={isPending}
        />

        <FormMessage error={errors.form} message={message} />

        <div className='form__actions'>
          <button type='submit' className='primary__button' disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Email'}
          </button>
          <Link href='/music-review/mypage' className='link__list__item'>
            Back to My Page
          </Link>
        </div>
      </form>
    </div>
  )
}
