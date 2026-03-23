import type { Metadata } from 'next'
import ChangeEmailForm from '@/components/music-review/ChangeEmailForm'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'

export const metadata: Metadata = {
  title: 'Music Review Change Email',
  description: 'Change email page',
}

export default function MusicReviewChangeEmailPage() {
  return (
    <ProtectedFormPage heading='Change Email'>
      <ChangeEmailForm />
    </ProtectedFormPage>
  )
}
