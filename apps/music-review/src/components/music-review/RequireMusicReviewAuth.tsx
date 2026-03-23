'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'

type Props = {
  children: ReactNode
}

export default function RequireMusicReviewAuth({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, isLoading } = useMusicReviewAuth()

  useEffect(() => {
    if (isLoading || session) {
      return
    }

    const redirectTo = encodeURIComponent(pathname || '/music-review/mypage')
    router.replace(`/music-review/login?redirectTo=${redirectTo}`)
  }, [isLoading, pathname, router, session])

  if (isLoading || !session) {
    return <p className='guard__message'>Checking login status...</p>
  }

  return <>{children}</>
}
