import type { Metadata } from 'next'
import { getMusicReviewApi } from '@/lib/music-review/reviewApi'
import styles from '../../music-review.module.css'

export const metadata: Metadata = {
  title: 'Music Review Detail',
  description: 'Review detail page',
}

type Props = {
  searchParams: Promise<{
    id?: string
  }>
}

export default async function MusicReviewDetailPage({ searchParams }: Props) {
  const reviewApi = getMusicReviewApi()
  const params = await searchParams
  const reviewId = params.id?.trim()

  let resolvedReviewId = reviewId
  if (!resolvedReviewId) {
    const latestReviews = await reviewApi.listReviews({ order: 'desc' })
    resolvedReviewId = latestReviews[0]?.id ?? 'mr-001'
  }

  const review = await reviewApi.getReviewById(resolvedReviewId)

  if (!review) {
    return (
      <section className='content__section'>
        <p className='empty__message'>Review not found</p>
      </section>
    )
  }

  const hasEmbed = Boolean(review.embedUrl?.trim())

  return (
    <section className='content__section'>
      <div className='form__page'>
        <h1 className='visually-hidden page__heading'>Review Detail</h1>
        <article className={styles.reviewCard}>
          {/* Banner */}
          <div className={styles.reviewBanner}>
            <div className={styles.reviewJacketWrap}>
              {review.jacketUrl ? (
                <img src={review.jacketUrl} alt='' className={styles.reviewJacketImg} />
              ) : (
                <span className={styles.reviewJacketFallback}>No Image</span>
              )}
            </div>
            <div className={styles.reviewBannerBody}>
              <p className={styles.reviewBannerAlbum}>{review.albumName || review.trackName || '-'}</p>
              <p className={styles.reviewBannerArtist}>{review.artistName}</p>
              <div className={styles.reviewBannerMeta}>
                <span className={styles.reviewBannerAuthor}>{review.authorName}</span>
                <time className={styles.reviewBannerDate}>{review.postedAt}</time>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className={styles.reviewBody}>
            <div className={styles.reviewMetaSection}>
              <dl className={styles.reviewMetaGrid}>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Artist</dt>
                  <dd className={styles.reviewMetaValue}>{review.artistName}</dd>
                </div>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Album</dt>
                  <dd className={styles.reviewMetaValue}>{review.albumName || '-'}</dd>
                </div>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Release</dt>
                  <dd className={styles.reviewMetaValue}>{review.releaseDate || '-'}</dd>
                </div>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Track</dt>
                  <dd className={styles.reviewMetaValue}>{review.trackName || '-'}</dd>
                </div>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Label</dt>
                  <dd className={styles.reviewMetaValue}>{review.labelName || '-'}</dd>
                </div>
                <div className={styles.reviewMetaItem}>
                  <dt className={styles.reviewMetaLabel}>Genre</dt>
                  <dd className={styles.reviewMetaValue}>{review.genre || '-'}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.reviewEmbedSection}>
              {hasEmbed ? (
                <iframe
                  className={styles.reviewEmbedFrame}
                  title={`${review.artistName} full player`}
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
            </div>

            <div className={styles.reviewTextSection}>
              <p className={styles.reviewBodyPreview}>{review.body}</p>

              {review.references.length > 0 ? (
                <><p className={styles.referenceListHeading}>◯References</p><ul className={styles.referenceList}>
                  {review.references.map((reference) => (
                    <li key={reference.id}>
                      <a href={reference.url} className={`link__twister ${styles.referenceLink}`} target='_blank' rel='noreferrer'>
                        {reference.title}
                      </a>
                    </li>
                  ))}
                </ul></>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
