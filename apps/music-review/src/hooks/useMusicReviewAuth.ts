'use client'

import { useEffect, useMemo, useState } from 'react'
import { getMusicReviewAuthApi } from '@/lib/music-review/auth'
import type { MusicReviewSession } from '@/lib/music-review/auth/types'

export function useMusicReviewAuth() {
  const authApi = useMemo(() => getMusicReviewAuthApi(), [])
  const [session, setSession] = useState<MusicReviewSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    authApi.getSession().then((nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setIsLoading(false)
    })

    const unsubscribe = authApi.subscribe((nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [authApi])

  return {
    authApi,
    session,
    isLoading,
    isLoggedIn: Boolean(session),
  }
}
