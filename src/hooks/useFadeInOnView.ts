'use client'

import { useEffect, useRef } from 'react'

// ref でトリガーを指定する版
// export function useFadeInOnView<T extends HTMLElement>() {
//   const ref = useRef<T>(null)

//   useEffect(() => {
//     if(!ref.current) return
//     if(typeof window === 'undefined') return

//     const node = ref.current
//     const observer = new window.IntersectionObserver(
//       ([entry]) => {
//         if(entry.isIntersecting) {
//           node.classList.add('is-appeared')
//           observer.disconnect()
//         }
//       },
//       { threshold: 0.2 }
//     )
//     observer.observe(node)
//     return () => observer.disconnect()
//   }, [])
//   return ref
// }

// fadeInTrigger でトリガーを指定する版
export function useFadeInTrigger(
  options: { bottomPercent?: number; once?: boolean; selector?: string } = {}
) {
  const {
    bottomPercent = 20,
    once = true,
    selector = '.fadeInTrigger',
  } = options

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    const rootMargin = `0px 0px -${bottomPercent}% 0px`
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.classList.add('is-appeared')
            if (once) observer.unobserve(el)
          }
        })
      },
      { root: null, rootMargin, threshold: 0 }
    )

    // 初期要素を監視
    const init = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => observer.observe(el))
    }
    init()

    // 動的追加に対応する必要がない場合コメントアウト
    const mo = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => observer.observe(el))
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mo.disconnect()
    }
  }, [bottomPercent, once, selector])
}