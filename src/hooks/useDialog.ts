'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createFocusTrap, FocusTrap } from 'focus-trap'

// useDialog provides safe dialog control: open/close, ESC handling, focus trap, click outside
export default function useDialog() {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const focusTrapRef = useRef<FocusTrap | null>(null)

  const open = useCallback(() => {
    const d = dialogRef.current
    if (!d) return
    try {
      d.showModal?.()
    } catch {
      d.setAttribute('open', '')
    }
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    const d = dialogRef.current
    if (!d) return
    try {
      d.close?.()
    } catch {
      d.removeAttribute('open')
    }
    setIsOpen(false)
  }, [])

  // click outside handler for dialog backdrop
  const onDialogClickOutside = useCallback((e: Event) => {
    const d = dialogRef.current
    if (!d) return
    if (e.target === d) close()
  }, [close])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return

    const onDialogClose = () => setIsOpen(false)

    // keep dialog "close" state in sync
    d.addEventListener('close', onDialogClose)
    d.addEventListener('click', onDialogClickOutside)

    return () => {
      d.removeEventListener('close', onDialogClose)
      d.removeEventListener('click', onDialogClickOutside)
    }
  }, [onDialogClickOutside])

  // ESC key handling and focus trap activation
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    if (isOpen) {
      document.addEventListener('keydown', onKey)
      // focus-trap activation (createFocusTrap from 'focus-trap')
      try {
        focusTrapRef.current = createFocusTrap(d, { clickOutsideDeactivates: true })
        focusTrapRef.current.activate()
      } catch (err) {
        // if focus-trap fails, ignore — dialog still usable
      }
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      try {
        focusTrapRef.current?.deactivate()
        focusTrapRef.current = null
      } catch (err) {}
    }
  }, [isOpen, close])

  return { dialogRef, isOpen, open, close, onDialogClickOutside }
}