import type { Metadata } from 'next'
import MyPostedReviewsManager from '@/components/music-review/MyPostedReviewsManager'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'

export const metadata: Metadata = {
  title: 'Music Review Posted Reviews',
  description: 'Manage posted reviews page',
}

export default function MusicReviewPostedReviewsPage() {
  return (
    <ProtectedFormPage heading='Manage Posted Reviews'>
      <MyPostedReviewsManager />
    </ProtectedFormPage>
  )
}
