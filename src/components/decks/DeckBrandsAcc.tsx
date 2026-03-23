// copy this component if you wanna re-use it elsewhere

'use client'

import Link from 'next/link'
import { brands } from '@/app/collections/decks/data'
import styles from '@/app/collections/decks/decks.module.css'
import DeckLinkBtn from '@/components/decks/DeckLinkBtn'

export default function DeckBrandsAcc() {
  return (
    <div className={styles.brands__wrapper}>
      <details className={`${styles.brands__accordion} ${styles.details__brands}`} name="details__brands">
        <summary className={`${styles.summary__brands} ${styles.brands}`}>Brands List</summary>
        <div className={styles.for__anim}>
          {brands.map(({id, name, iconFileName, desc, link}) => (
            <details className={`${styles.brands__accordion} ${styles.details__brand__item}`} name="brand__item" key={name}>
              <summary className={`${styles.summary__brands} ${styles.brand__item}`}>{name}</summary>
              <div className={styles.for__anim}>
                <img src={`/collections/decks/${iconFileName}`} className={styles.brand__icon} alt={`${name} logo`} loading='lazy' />
                <Link href={link} className={`${styles.brand__link} link__twister`} target="_blank" rel="noopener noreferrer">Link - Official HP</Link>
                <p className={styles.brand__desc}>{desc}</p>
                <DeckLinkBtn targetID={id}>
                  Jump to Decks
                </DeckLinkBtn>
              </div>
            </details>
          ))}
        </div>
      </details>
    </div>
  )
}