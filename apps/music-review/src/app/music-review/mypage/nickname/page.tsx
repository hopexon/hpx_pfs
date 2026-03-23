import type { Metadata } from 'next'
import ChangeNicknameForm from '@/components/music-review/ChangeNicknameForm'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'

export const metadata: Metadata = {
  title: 'Music Review Change Nickname',
  description: 'Change nickname page',
}

export default function MusicReviewChangeNicknamePage() {
  return (
    <ProtectedFormPage heading='Change Nickname'>
      <ChangeNicknameForm />
    </ProtectedFormPage>
  )
}
