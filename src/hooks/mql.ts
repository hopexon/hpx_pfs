'use client'

import { useEffect, useState } from 'react'

// small hook that mirrors a media-query for "is PC". Adjust breakpoint as needed.
export default function usePcMql(breakpoint = 768) {
  const [isPc, setIsPc] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(min-width: ${breakpoint}px)`).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const handler = (ev: MediaQueryListEvent) => setIsPc(ev.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return { isPc }
}