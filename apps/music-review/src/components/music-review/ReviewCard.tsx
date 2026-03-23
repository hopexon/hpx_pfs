'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from '@/app/music-review/music-review.module.css'
import type { MusicReview } from '@/lib/music-review/types'

type Props = {
  review: MusicReview
}

function textOrHyphen(text: string | null): string {
  return text && text.trim().length > 0 ? text : '-'
}

export default function ReviewCard({ review }: Props) {
  const bodyPreviewRef = useRef<HTMLParagraphElement>(null)
  const [isBodyOverflowing, setIsBodyOverflowing] = useState<boolean | null>(null)
  const hasEmbed = Boolean(review.embedUrl?.trim())

  useEffect(() => {
    const bodyElement = bodyPreviewRef.current
    if (!bodyElement) {
      return
    }

    const updateOverflowState = () => {
      const next = bodyElement.scrollHeight > bodyElement.clientHeight + 1
      setIsBodyOverflowing((prev) => (prev === next ? prev : next))
    }

    updateOverflowState()

    const resizeObserver = new ResizeObserver(updateOverflowState)
    resizeObserver.observe(bodyElement)
    window.addEventListener('resize', updateOverflowState)

    if (document.fonts?.ready) {
      void document.fonts.ready.then(updateOverflowState).catch(() => undefined)
    }

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateOverflowState)
    }
  }, [review.body])

  const metaItems = [
    { label: 'Artist', value: review.artistName },
    { label: 'Album', value: review.albumName },
    { label: 'Release', value: review.releaseDate },
    { label: 'Track', value: review.trackName },
    { label: 'Label', value: review.labelName },
    { label: 'Genre', value: review.genre },
  ].filter((item) => item.value)

  return (
    <article className={styles.reviewCard}>
      {/* ── Banner ── */}
      <div className={styles.reviewBanner}>
        <div className={styles.reviewJacketWrap}>
          {review.jacketUrl ? (
            <img
              src={review.jacketUrl}
              alt={review.albumName ?? review.artistName}
              className={styles.reviewJacketImg}
            />
          ) : (
            <div className={styles.reviewJacketFallback}>No Image</div>
          )}
        </div>

        <div className={styles.reviewBannerBody}>
          <p className={styles.reviewBannerAlbum}>{review.albumName || review.artistName}</p>
          <p className={styles.reviewBannerArtist}>{review.artistName}</p>
        </div>

        <div className={styles.reviewBannerMeta}>
          <span className={styles.reviewBannerAuthor}>{review.authorName}</span>
          <time className={styles.reviewBannerDate} dateTime={review.postedAt}>
            {review.postedAt}
          </time>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.reviewBody}>
        {/* Meta */}
        {metaItems.length > 0 && (
          <section className={styles.reviewMetaSection}>
            <dl className={styles.reviewMetaGrid}>
              {metaItems.map(({ label, value }) => (
                <div key={label} className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>{label}</dt>
                  <dd className={styles.reviewMetaValue}>{textOrHyphen(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Embed */}
        <section className={styles.reviewEmbedSection}>
          {hasEmbed ? (
            <iframe
              className={styles.reviewEmbedFrame}
              title={`${review.artistName} ${review.trackName ?? 'review'} player`}
              src={review.embedUrl ?? undefined}
              loading='lazy'
              referrerPolicy='strict-origin-when-cross-origin'
              sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
              allow='autoplay encrypted-media fullscreen picture-in-picture'
              allowFullScreen
            />
          ) : (
            <p className={styles.reviewEmbedEmpty}>No embedded player available</p>
          )}
        </section>

        {/* Text + References */}
        <section className={styles.reviewTextSection}>
          <p ref={bodyPreviewRef} className={`${styles.reviewBodyPreview} ${styles.reviewBodyClamped}`}>
            {review.body}
          </p>
          <Link href={`/music-review/reviews/detail?id=${review.id}`} className={`link__twister ${styles.reviewReadMore}`}>
            Read more
          </Link>

          {isBodyOverflowing === false && review.references.length > 0 ? (
            <ul className={styles.referenceList}>
              {review.references.map((reference) => (
                <li key={reference.id}>
                  <a href={reference.url} target='_blank' rel='noreferrer' className={`link__twister ${styles.referenceLink}`}>
                    {reference.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </article>
  )
}
