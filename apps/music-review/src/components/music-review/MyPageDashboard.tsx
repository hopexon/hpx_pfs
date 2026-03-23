'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { useAuthLogout } from '@/hooks/useAuthLogout'

export default function MyPageDashboard() {
  const router = useRouter()
  const { authApi } = useMusicReviewAuth()
  const { logout: onSignout, isPending: isSignoutPending } = useAuthLogout()

  const [isDeleteAccountPending, setIsDeleteAccountPending] = useState(false)
  const [accountMessage, setAccountMessage] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)

  const onDeleteAccount = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    if (!shouldDelete) {
      return
    }

    setIsDeleteAccountPending(true)
    setAccountError(null)
    setAccountMessage(null)

    const result = await authApi.deleteAccount()

    if (!result.ok) {
      setAccountError(result.errors.form ?? 'Failed to delete account')
      setIsDeleteAccountPending(false)
      return
    }

    setAccountMessage(result.message ?? 'Account deleted successfully')
    setIsDeleteAccountPending(false)

    router.replace('/music-review')
  }

  return (
    <section className='content__section__narrow'>
      <div className='form__page'>
        <h1 className='visually-hidden page__heading'>My Page</h1>
        {/* <p className='form__lead'>You can manage your account settings here.</p> */}

        <div className='form__card'>
          <div className='link__list'>
            <Link
              href='/music-review/mypage/reviews'
              className='secondary__button fullwidth__button'
            >
              Manage Posted Reviews
            </Link>
            <Link
              href='/music-review/mypage/email'
              className='secondary__button fullwidth__button'
            >
              Change Email Address
            </Link>
            <Link
              href='/music-review/mypage/password'
              className='secondary__button fullwidth__button'
            >
              Change Password
            </Link>
            <Link
              href='/music-review/mypage/nickname'
              className='secondary__button fullwidth__button'
            >
              Change Nickname
            </Link>
            <button
              type='button'
              className='secondary__button fullwidth__button'
              onClick={onSignout}
              disabled={isSignoutPending || isDeleteAccountPending}
            >
              {isSignoutPending ? 'Signing out...' : 'Sign Out'}
            </button>
            <button
              type='button'
              className='secondary__button fullwidth__button'
              onClick={onDeleteAccount}
              disabled={isSignoutPending || isDeleteAccountPending}
            >
              {isDeleteAccountPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>

          {accountMessage ? <p className='form__note'>{accountMessage}</p> : null}
          {accountError ? <p className='form__error'>{accountError}</p> : null}
        </div>
      </div>
    </section>
  )
}
