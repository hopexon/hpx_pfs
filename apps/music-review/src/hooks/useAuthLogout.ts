'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { getMusicReviewAuthApi } from '@/lib/music-review/auth'

export function useAuthLogout() {
  const router = useRouter()
  const authApi = useMemo(() => getMusicReviewAuthApi(), [])
  const [isPending, setIsPending] = useState(false)

  const logout = useCallback(async () => {
    setIsPending(true)
    await authApi.logout()
    setIsPending(false)
    router.replace('/music-review')
  }, [authApi, router])

  return { logout, isPending } as const
}
