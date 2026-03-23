import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/music-review/LoginForm'

export const metadata: Metadata = {
  title: 'Music Review Login',
  description: 'Login page for music review',
}

function LoginPageFallback() {
  return (
    <section className='content__section__narrow auth__viewport'>
      <div className='form__page auth__card'>
        <div className='form__card'>
          <p className='guard__message'>Now</p>
        </div>
      </div>
    </section>
  )
}

export default function MusicReviewLoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
    </Suspense>
  )
}
