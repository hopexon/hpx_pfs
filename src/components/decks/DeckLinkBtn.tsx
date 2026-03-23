// used in src/app/collections/decks/page.tsx

'use client'

import styles from '@/app/collections/decks/decks.module.css'
import DeckArrowIcon from '@/components/decks/ArrowRight241'

interface DeckLinkBtnProps {
  targetID: string
  children: React.ReactNode
  className?: string
}

export default function DeckLinkBtn({ targetID, children, className }: DeckLinkBtnProps) {
  const handleClick = () => {
    const deckElement = document.getElementById(targetID)
    if (deckElement) {
      deckElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.jumpBtn__wrap}>
      <button type='button' onClick={handleClick} className={styles.deck__jumpbtn}>
        {children}
      </button>
      <DeckArrowIcon className={styles.deck__arrow__icon} />
    </div>
  )
}