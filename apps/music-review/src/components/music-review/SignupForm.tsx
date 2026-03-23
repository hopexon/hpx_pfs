'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, type FormEvent } from 'react'
import { getMusicReviewAuthApi } from '@/lib/music-review/auth'
import type { MusicReviewSignupInput } from '@/lib/music-review/auth/types'
import { useAuthForm } from '@/hooks/useAuthForm'
import FormField from '@/components/music-review/FormField'
import FormMessage from '@/components/music-review/FormMessage'

const defaultSignupInput: MusicReviewSignupInput = {
  email: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
}

export default function SignupForm() {
  const router = useRouter()
  const authApi = useMemo(() => getMusicReviewAuthApi(), [])

  const { values, errors, isPending, onChangeField, setErrors, setIsPending } = useAuthForm({ initialValues: defaultSignupInput })

  const onSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setIsPending(true)

    const result = await authApi.signup(values)
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    router.replace('/music-review/mypage')
  }

  return (
    <section className='content__section__narrow auth__viewport'>
      <div className='form__page auth__card'>
        <div className='form__card'>
          <h1 className='form__title'>SIGN UP</h1>
          {/* <p className='form__helper'>Create a new account</p> */}
          <p className='form__mode__tag'>Current mode: {authApi.getProvider()}</p>

          <form className='form__grid two__cols' onSubmit={onSignup} noValidate>
            <FormField
              label='Email'
              type='email'
              placeholder='example@email.com'
              value={values.email}
              onChange={(v) => onChangeField('email', v)}
              error={errors.email}
              disabled={isPending}
            />
            <FormField
              label='Nickname'
              placeholder='nickname'
              value={values.nickname}
              onChange={(v) => onChangeField('nickname', v)}
              error={errors.nickname}
              disabled={isPending}
            />
            <FormField
              label='Password'
              type='password'
              placeholder='********'
              value={values.password}
              onChange={(v) => onChangeField('password', v)}
              error={errors.password}
              disabled={isPending}
            />
            <FormField
              label='Confirm Password'
              type='password'
              placeholder='********'
              value={values.passwordConfirm}
              onChange={(v) => onChangeField('passwordConfirm', v)}
              error={errors.passwordConfirm}
              disabled={isPending}
            />

            <FormMessage error={errors.form} />

            <div className='form__actions'>
              <button
                type='submit'
                className='primary__button fullwidth__button'
                disabled={isPending}
              >
                {isPending ? 'Processing...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <Link href='/music-review/login' className='link__list__item'>
            or Log In -- if you already have
          </Link>
        </div>
      </div>
    </section>
  )
}
