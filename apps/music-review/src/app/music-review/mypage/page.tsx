import type { Metadata } from 'next'
import MyPageDashboard from '@/components/music-review/MyPageDashboard'
import RequireMusicReviewAuth from '@/components/music-review/RequireMusicReviewAuth'

export const metadata: Metadata = {
  title: 'Music Review My Page',
  description: 'My page for music review',
}

export default function MusicReviewMyPage() {
  return (
    <RequireMusicReviewAuth>
      <MyPageDashboard />
    </RequireMusicReviewAuth>
  )
}
