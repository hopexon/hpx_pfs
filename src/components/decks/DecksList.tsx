'use client'

import Image from 'next/image'
import styles from '@/app/collections/decks/decks.module.css'
import { useFadeInTrigger } from '@/hooks/useFadeInOnView'

interface DeckListProps {
  brand: string
  id?: string
  model: string
  title: string
  imgBaseName: string
  alt: string
  index: number
}


export default function DecksList({ brand, id, model, title, imgBaseName, alt, index }: DeckListProps) {
  useFadeInTrigger({ bottomPercent: 20, once: true })

  return (
    <div id={id || ''} className={`${styles.deck__item__wrapper} fadeInTrigger fadeInItem`} key={imgBaseName}>
      {brand !== '' ? (
        <dl className={styles.decks__info}>
          <dt className={styles.decks__brand}>{brand}</dt>
          <dd className={styles.decks__model}>{model}</dd>
          <dd className={styles.decks__title}>{title}</dd>
        </dl>
      ) : (
        <div className={styles.info__placeholder}></div>
      )}
      <Image 
        src={`/collections/decks/${imgBaseName}.webp`}
        alt={alt}
        width={280}
        height={1000}
        className={styles.decks__img}
        loading={index === 0 ? 'eager' : 'lazy'}
        priority={index === 0}
      />
    </div>
  )
}