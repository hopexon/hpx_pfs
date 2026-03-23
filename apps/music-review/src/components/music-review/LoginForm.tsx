'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, type FormEvent } from 'react'
import { getMusicReviewAuthApi } from '@/lib/music-review/auth'
import type { MusicReviewLoginInput } from '@/lib/music-review/auth/types'
import { useAuthForm } from '@/hooks/useAuthForm'
import FormField from '@/components/music-review/FormField'
import FormMessage from '@/components/music-review/FormMessage'

const defaultLoginInput: MusicReviewLoginInput = {
  email: 'demo@example.com',
  password: 'password123',
}

const emptyLoginInput: MusicReviewLoginInput = {
  email: '',
  password: '',
}

export default function LoginForm() {
  const router = useRouter()
  const authApi = useMemo(() => getMusicReviewAuthApi(), [])
  const provider = authApi.getProvider()

  const { values, errors, isPending, onChangeField, setErrors, setIsPending } = useAuthForm({
    initialValues: () => (provider === 'mock' ? defaultLoginInput : emptyLoginInput),
  })

  const onPasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setIsPending(true)

    const result = await authApi.loginWithPassword(values)
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    router.replace('/music-review')
  }

  const onGuestLogin = async () => {
    setErrors({})
    setIsPending(true)

    const result = await authApi.loginAsGuest()
    setIsPending(false)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    router.replace('/music-review')
  }

  return (
    <section className='content__section__narrow auth__viewport'>
      <div className={`form__page auth__card`}>
        <div className='form__card'>
          <h1 className='form__title'>LOGIN</h1>
          {/* <p className='form__helper'>アカウントにログインしてください</p> */}
          <p className='form__mode__tag'>Current Mode: {provider}</p>

          <form className='form__grid' onSubmit={onPasswordLogin} noValidate>
            <button
              type='button'
              className='secondary__button fullwidth__button'
              onClick={onGuestLogin}
              disabled={isPending}
            >
              Guest Login (for portfolio viewing)
            </button>

            <p className='form__divider'>or</p>

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
              label='Password'
              type='password'
              placeholder='********'
              value={values.password}
              onChange={(v) => onChangeField('password', v)}
              error={errors.password}
              disabled={isPending}
            />

            <FormMessage error={errors.form} />

            <div className='form__actions'>
              <button
                type='submit'
                className='primary__button fullwidth__button'
                disabled={isPending}
              >
                {isPending ? 'Processing...' : 'Login'}
              </button>
            </div>
          </form>

          <Link href='/music-review/signup' className='link__list__item'>
            Don&apos;t have an account? -- Sign up here
          </Link>
        </div>
      </div>
    </section>
  )
}
