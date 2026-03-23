'use client'

import Link from 'next/link'
import type { FormEvent } from 'react'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { useAuthForm } from '@/hooks/useAuthForm'
import type { MusicReviewChangeNicknameInput } from '@/lib/music-review/auth/types'
import FormField from '@/components/music-review/FormField'
import FormMessage from '@/components/music-review/FormMessage'

const emptyInput: MusicReviewChangeNicknameInput = {
  currentNickname: '',
  newNickname: '',
  newNicknameConfirm: '',
}

export default function ChangeNicknameForm() {
  const { authApi, session } = useMusicReviewAuth()
  const { values, errors, isPending, message, onChangeField, setErrors, setIsPending, setMessage, setValues } = useAuthForm({ initialValues: emptyInput })

  const resolvedCurrentNickname = values.currentNickname || session?.user.nickname || ''

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setIsPending(true)

    const submitValues: MusicReviewChangeNicknameInput = {
      ...values,
      currentNickname: resolvedCurrentNickname,
    }

    const result = await authApi.updateNickname(submitValues)
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setMessage(result.message ?? 'Nickname updated successfully')
    setValues((prev) => ({
      ...prev,
      currentNickname: submitValues.newNickname,
      newNickname: '',
      newNicknameConfirm: '',
    }))
  }

  return (
    <div className='form__card'>
      <form className='form__grid' onSubmit={onSubmit} noValidate>
        <FormField
          label='Current Nickname'
          value={resolvedCurrentNickname}
          onChange={(v) => onChangeField('currentNickname', v)}
          error={errors.currentNickname}
          disabled={isPending}
        />
        <FormField
          label='New Nickname'
          value={values.newNickname}
          onChange={(v) => onChangeField('newNickname', v)}
          error={errors.newNickname}
          disabled={isPending}
        />
        <FormField
          label='Confirm New Nickname'
          value={values.newNicknameConfirm}
          onChange={(v) => onChangeField('newNicknameConfirm', v)}
          error={errors.newNicknameConfirm}
          disabled={isPending}
        />

        <FormMessage error={errors.form} message={message} />

        <div className='form__actions'>
          <button type='submit' className='primary__button' disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Nickname'}
          </button>
          <Link href='/music-review/mypage' className='link__list__item'>
            Back to My Page
          </Link>
        </div>
      </form>
    </div>
  )
}
