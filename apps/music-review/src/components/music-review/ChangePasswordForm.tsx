'use client'

import Link from 'next/link'
import type { FormEvent } from 'react'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { useAuthForm } from '@/hooks/useAuthForm'
import type { MusicReviewChangePasswordInput } from '@/lib/music-review/auth/types'
import FormField from '@/components/music-review/FormField'
import FormMessage from '@/components/music-review/FormMessage'

const emptyInput: MusicReviewChangePasswordInput = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
}

export default function ChangePasswordForm() {
  const { authApi } = useMusicReviewAuth()
  const { values, errors, isPending, message, onChangeField, setErrors, setIsPending, setMessage, setValues } = useAuthForm({ initialValues: emptyInput })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setIsPending(true)

    const result = await authApi.updatePassword(values)
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setMessage(result.message ?? 'Password updated successfully')
    setValues(emptyInput)
  }

  return (
    <div className='form__card'>
      <form className='form__grid' onSubmit={onSubmit} noValidate>
        <FormField
          label='Current Password'
          type='password'
          value={values.currentPassword}
          onChange={(v) => onChangeField('currentPassword', v)}
          error={errors.currentPassword}
          disabled={isPending}
        />
        <FormField
          label='New Password'
          type='password'
          value={values.newPassword}
          onChange={(v) => onChangeField('newPassword', v)}
          error={errors.newPassword}
          disabled={isPending}
        />
        <FormField
          label='Confirm New Password'
          type='password'
          value={values.newPasswordConfirm}
          onChange={(v) => onChangeField('newPasswordConfirm', v)}
          error={errors.newPasswordConfirm}
          disabled={isPending}
        />

        <FormMessage error={errors.form} message={message} />

        <div className='form__actions'>
          <button type='submit' className='primary__button' disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Password'}
          </button>
          <Link href='/music-review/mypage' className='link__list__item'>
            Back to My Page
          </Link>
        </div>
      </form>
    </div>
  )
}
