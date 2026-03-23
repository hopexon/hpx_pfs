import type { Metadata } from 'next'
import NewReviewForm from '@/components/music-review/NewReviewForm'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'

export const metadata: Metadata = {
  title: 'Music Review New Review',
  description: 'Create new review',
}

export default function MusicReviewNewPage() {
  return (
    <ProtectedFormPage heading='Post New Review' size='normal'>
      <NewReviewForm />
    </ProtectedFormPage>
  )
}
