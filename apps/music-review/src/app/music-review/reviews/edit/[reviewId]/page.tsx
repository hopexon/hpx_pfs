import type { Metadata } from 'next'
import NewReviewForm from '@/components/music-review/NewReviewForm'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'
import { getMusicReviewApi } from '@/lib/music-review/reviewApi'
import type { MusicReviewDraft } from '@/lib/music-review/types'

export const metadata: Metadata = {
  title: 'Music Review Edit Review',
  description: 'Edit review',
}

type Props = {
  params: Promise<{
    reviewId: string
  }>
}

function toDraft(review: {
  artistName: string
  albumName: string | null
  releaseDate: string | null
  trackName: string | null
  labelName: string | null
  genre: MusicReviewDraft['genre'] | null
  jacketUrl: string | null
  embedProvider: MusicReviewDraft['embedProvider'] | null
  embedUrl: string | null
  body: string
  references: Array<{
    title: string
    url: string
  }>
}): MusicReviewDraft {
  return {
    artistName: review.artistName,
    albumName: review.albumName ?? '',
    releaseDate: review.releaseDate ?? '',
    trackName: review.trackName ?? '',
    labelName: review.labelName ?? '',
    genre: review.genre ?? '',
    jacketUrl: review.jacketUrl ?? '',
    embedProvider: review.embedProvider ?? '',
    embedUrl: review.embedUrl ?? '',
    body: review.body,
    references: review.references.map((reference) => ({
      title: reference.title,
      url: reference.url,
    })),
  }
}

export default async function MusicReviewEditPage({ params }: Props) {
  const { reviewId } = await params
  const reviewApi = getMusicReviewApi()
  const review = await reviewApi.getReviewById(reviewId)

  if (!review) {
    return (
      <section className='content__section'>
        <p className='empty__message'>Review not found</p>
      </section>
    )
  }

  return (
    <ProtectedFormPage heading='' hiddenHeading={true} lead='' size='normal'>
      <NewReviewForm
        mode='edit'
        reviewId={review.id}
        initialDraft={toDraft(review)}
        initialPostedAt={review.postedAt}
      />
    </ProtectedFormPage>
  )
}
