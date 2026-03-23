'use client'

import Image from 'next/image'
import styles from '@/app/works/works.module.css' 
import { useFadeInTrigger } from '@/hooks/useFadeInOnView'

interface WorksListProps {
  title: string
  venue: string
  date: string
  imgBaseName: string
  alt: string
  width: number | string
  height: number | string
  index: number
}

export default function WorksList({ title, venue, date, imgBaseName, alt, width, height, index }: WorksListProps) {
  useFadeInTrigger({ bottomPercent: 20, once: true })

  return (
    <div className={`${styles.artwork__wrapper} fadeInTrigger fadeInItem`} key={imgBaseName ?? title}>
      {title !== '' && (
        <dl className={styles.artwork__info}>
          <dt className={styles.artwork__ttl}>{title}</dt>
          <dd className={styles.artwork__date}>{date}</dd>
          {venue !== '' && <dd className={styles.artwork__venue}>{venue}</dd>}
        </dl>
      )}
      <Image
        src={`/works/${imgBaseName}_A2.avif`}
        alt={alt || title}
        width={Number(width)}
        height={Number(height)}
        style={{ width: '100%', maxInlineSize: '1000px', height: 'auto' }}
        className={styles.artwork__img}
        loading={index === 0 ? 'eager' : 'lazy'}
        priority={index === 0}
      />
    </div>
  )
}