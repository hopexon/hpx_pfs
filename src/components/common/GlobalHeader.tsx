'use client'

import Link from 'next/link'
import { useEffect, useRef, useCallback } from 'react'
import usePcMql from '@/hooks/mql'
import useDialog from '@/hooks/useDialog'

import NAV from './json/contentsList.json'

export default function GlobalHeader() {
  const headerRef = useRef<HTMLElement | null>(null)
  const prevY = useRef<number>(0)
  const { isPc } = usePcMql()
  const { dialogRef, isOpen, open, close, onDialogClickOutside } = useDialog()

  // close dialog when switch to PC view
  useEffect(() => {
    if (isPc && dialogRef.current?.open) close()
  }, [isPc, close, dialogRef])

  // header hide/show on scroll (throttled via requestAnimationFrame)
  useEffect(() => {
    let rafId = 0
    const el = headerRef.current
    if (!el) return

    const onScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - prevY.current

      if (currentY > prevY.current && diff > 50) el.classList.add('hide')
      else if (currentY < prevY.current && diff < -20) el.classList.remove('hide')

      prevY.current = currentY
    }

    const handler = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(onScroll)
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handler)
    }
  }, [])

  // close dialog when resizing into PC view is also handled by usePcMql effect above

  const onLinkClick = useCallback(() => {
    // close the dialog when navigation occurs on SPA clicks
    close()
  }, [close])

  return (
    <header className="globalheader" ref={headerRef}>
      <nav className="global__nav__pc pc__only">
        {NAV.map((item) => (
          <Link key={item.name} href={item.path} className="nav__linkItem link__twister">
            {item.name}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="nav__btn__sp sp__only"
        aria-expanded={isOpen}
        aria-controls="nav__sp"
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        onClick={() => (isOpen ? close() : open())}
      />

      <dialog
        id="nav__sp"
        ref={dialogRef}
        aria-labelledby="nav__sp__heading"
        onClick={(e) => onDialogClickOutside(e.nativeEvent)}
      >
        <div className="dialog__inner">
          {NAV.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={onLinkClick}
              className="nav__linkItem link__twister w-fit nav__item__sp"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </dialog>
    </header>
  )
}
