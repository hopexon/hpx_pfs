'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import styles from '@/app/tips/contents/css/modal_with_command_attr_2026.module.css'

export default function CustomCommandAttr() {

  useEffect(() => {
    const handleCommand = (e: Event) => {
      if (!(e.target instanceof Element)) return

      const commandElement = e.target.closest('[command][commandfor]')
      if (!commandElement) return

      const command = commandElement.getAttribute('command')
      const commandFor = commandElement.getAttribute('commandfor')
      if (!command || !commandFor) return

      const commandTarget = document.getElementById(commandFor)
      if (!commandTarget) return

      switch (command) {
        case '--rotate-left':
          commandTarget.style.transform = 'rotate(-90deg)'
          break
        case '--rotate-right':
          commandTarget.style.transform = 'rotate(90deg)'
          break
        case '--reset-rotate':
          commandTarget.style.transform = 'rotate(0deg)'
          break
        default:
          break
      }
    }

    document.addEventListener('click', handleCommand)

    return () => {
      document.removeEventListener('click', handleCommand)
    }
  }, [])

  return (
    <>
      <section className={styles.custom__command__wrap}>
        <Image
          id='test-image'
          src='/tips/test-image.jpg' 
          alt='test image'
          width={300}
          height={300}
          className={styles.custom__command__img}
        />
        <div className={styles.custom__command__btn__wrap}>
          <button
            type='button'
            commandfor='test-image'
            command='--rotate-left'
          >
            Left
          </button>
          <button
            type='button'
            commandfor='test-image'
            command='--reset-rotate'
          >
            Reset
          </button>
          <button
            type='button'
            commandfor='test-image'
            command='--rotate-right'
          >
            Right
          </button>
        </div>
      </section>
    </>
  )
}