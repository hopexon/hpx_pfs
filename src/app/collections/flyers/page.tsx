import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { flyers } from './data'
import styles from './flyers.module.css'

export const metadata: Metadata = {
  title: 'Flyers',
  description: 'Flyers collection page',
}

export default function Flyers() {
  return (
    <div>
      <h1 className='page__ttl'>{String(metadata.title || "")}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
            <div className={styles.flyers__wrapper}>
            {flyers.map(({title, date, venue, imgBaseName, alt}) => (
              <div className={styles.artwork__wrapper} key={imgBaseName}>
              {title !== '' ? (
                <dl className={styles.artwork__info}>
                <dt className={styles.artwork__ttl}>{title}</dt>
                <dd className={styles.artwork__venue}>{venue}</dd>
                <dd className={styles.artwork__date}>{date}</dd>
                </dl>
              ) : (
                <div className={styles.info__placeholder}></div>
              )}
              <Image 
                className={styles.artwork__img}
                src={`/collections/flyers/${imgBaseName}.webp`}
                alt={alt}
                width={426}
                height={604}
                loading='lazy'
              />
              </div>
            ))}
            </div>
        </section>
      </div>
    </div>
  )
}