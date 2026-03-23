'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from '@/app/music-review/music-review.module.css'
import { useMusicReviewAuth } from '@/hooks/useMusicReviewAuth'
import { useAuthLogout } from '@/hooks/useAuthLogout'

type LinkActionItem = {
  label: string
  href: string
  primary?: boolean
}

export default function MusicReviewTopBar() {
  const { isLoggedIn, isLoading, session } = useMusicReviewAuth()
  const { logout, isPending } = useAuthLogout()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const headerRef = useRef<HTMLElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const previousScrollYRef = useRef(0)

  const isSubMenuOpen = isMobileMenuOpen || isAccountMenuOpen

  const closeMenus = () => {
    setIsMobileMenuOpen(false)
    setIsAccountMenuOpen(false)
  }

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current) {
        return
      }

      if (!accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [isAccountMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const mediaQueryList = window.matchMedia('(max-width: 767px)')
    if (!mediaQueryList.matches) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current) {
        return
      }

      if (!headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    previousScrollYRef.current = window.scrollY

    let rafId = 0

    const updateHeaderVisibility = () => {
      const currentY = window.scrollY
      const diff = currentY - previousScrollYRef.current

      if (isSubMenuOpen) {
        setIsHeaderVisible(true)
      } else if (currentY <= 0) {
        setIsHeaderVisible(true)
      } else if (currentY > previousScrollYRef.current && diff > 50) {
        setIsHeaderVisible(false)
      } else if (currentY < previousScrollYRef.current && diff < -20) {
        setIsHeaderVisible(true)
      }

      previousScrollYRef.current = currentY
    }

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(updateHeaderVisibility)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      window.removeEventListener('scroll', onScroll)
    }
  }, [isSubMenuOpen])

  const shouldShowHeader = isHeaderVisible || isSubMenuOpen

  const onLogout = async () => {
    await logout()
    closeMenus()
  }

  const guestActions: LinkActionItem[] = [
    // { label: 'New Review', href: '/music-review/reviews/new' },
    { label: 'Log In', href: '/music-review/login' },
    { label: 'Sign Up', href: '/music-review/signup', primary: true },
  ]

  const memberHeaderActions: LinkActionItem[] = [
    { label: 'New Review', href: '/music-review/reviews/new', primary: true },
  ]

  const memberSubMenuActions: LinkActionItem[] = [
    { label: 'My Page', href: '/music-review/mypage' },
    { label: 'Review Management', href: '/music-review/mypage/reviews' },
  ]

  const showMemberUi = !isLoading && isLoggedIn
  const desktopActions = showMemberUi ? memberHeaderActions : guestActions
  const mobileActions = showMemberUi ? memberSubMenuActions : guestActions
  const userName = session?.user.nickname
  const userInitial = userName?.trim().slice(0, 1).toUpperCase() ?? 'U'

  return (
    <header ref={headerRef} className={`app__header ${shouldShowHeader ? '' :'app__header__hidden'}`}>
      <div className='app__header__inner'>
        <Link href='/music-review' className='app__logo'>
          Review
        </Link>

        <div className='app__header__controls'>
          <nav
            className={styles.app__header__desktop__actions}
            aria-label={showMemberUi ? 'music review member quick actions' : 'music review guest actions'}
          >
            {desktopActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={closeMenus}
                className={`app__header__action ${action.primary ? 'app__header__action__primary' : ''}`}
              >
                {action.label}
              </Link>
            ))}
          </nav>

          {showMemberUi ? (
            <div className='app__account__wrap' ref={accountMenuRef}>
              <button
                type='button'
                className='app__account__button'
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-expanded={isAccountMenuOpen}
                aria-controls='music-review-account-menu'
                aria-label='Account menu'
              >
                <span aria-hidden>{userInitial}</span>
              </button>

              {isAccountMenuOpen ? (
                <div id='music-review-account-menu' className='app__account__menu'>
                  <p className='app__account__menu__meta'>{userName ?? 'member'}</p>

                  <nav className='app__account__menu__list' aria-label='music review member actions'>
                    {memberSubMenuActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={closeMenus}
                        className={`app__menu__link ${action.primary ? 'app__menu__link__primary' : ''}`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </nav>

                  <button
                    type='button'
                    className='app__menu__button'
                    onClick={onLogout}
                    disabled={isPending}
                  >
                    {isPending ? 'Processing...' : 'Sign Out'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className='app__mobile__menu__wrap'>
            <button
              type='button'
              className='app__hamburger__button'
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-controls='music-review-mobile-menu'
              aria-label='Toggle menu'
            >
              <span className='app__hamburger__bars' aria-hidden>
                <span className='app__hamburger__bar' />
                <span className='app__hamburger__bar' />
                <span className='app__hamburger__bar' />
              </span>
            </button>

            <div
              id='music-review-mobile-menu'
              className={`app__mobile__menu ${isMobileMenuOpen ? 'app__mobile__menu__open' : ''}`}
            >
              {!showMemberUi ? (
                <nav className='app__mobile__menu__list' aria-label='music review guest actions mobile'>
                  {guestActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={closeMenus}
                      className={`app__menu__link ${action.primary ? 'app__menu__link__primary' : ''}`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </nav>
              ) : (
                <div className='app__mobile__menu__list'>
                  <p className='app__account__menu__meta'>{userName ?? 'member'}</p>
                  <nav className='app__account__menu__list' aria-label='music review member actions mobile'>
                    {mobileActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={closeMenus}
                        className={`app__menu__link ${action.primary ? 'app__menu__link__primary' : ''}`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </nav>
                  <button
                    type='button'
                    className='app__menu__button'
                    onClick={onLogout}
                    disabled={isPending}
                  >
                    {isPending ? 'Processing...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
