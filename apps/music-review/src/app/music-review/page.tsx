import type { Metadata } from 'next'
import MusicReviewSubHeader from '@/components/music-review/MusicReviewSubHeader'
import ReviewCard from '@/components/music-review/ReviewCard'
import {
  getMusicReviewApi,
  getMusicReviewDataProvider,
} from '@/lib/music-review/reviewApi'
import styles from './music-review.module.css'

export const metadata: Metadata = {
  title: 'Music Review',
  description: 'Music review portfolio application (step-by-step implementation)',
}

type Props = {
  searchParams: Promise<{
    authorName?: string
    genre?: string
    keyword?: string
  }>
}

export default async function MusicReviewTopPage({ searchParams }: Props) {
  const params = await searchParams
  const authorName = params.authorName?.trim() ?? ''
  const keyword = params.keyword?.trim() ?? ''
  const genre = params.genre?.trim() ?? ''

  const reviewApi = getMusicReviewApi()
  const reviews = await reviewApi.listReviews({
    authorName: authorName || undefined,
    genre: genre || undefined,
    keyword: keyword || undefined,
    order: 'desc',
  })
  // const dataProvider = getMusicReviewDataProvider()

  return (
    <section className='content__section'>
      <div className={styles.reviewListSection}>
        <h1 className='visually-hidden page__heading'>Review List</h1>
        {/* <p className={styles.formModeTag}>Mode: {dataProvider}</p> */}
        <MusicReviewSubHeader
          initialFilters={{
            authorName,
            genre,
            keyword,
          }}
        />

        {reviews.length === 0 ? (
          <p className='empty__message'>No reviews found</p>
        ) : (
          <div className={styles.reviewCardList}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
