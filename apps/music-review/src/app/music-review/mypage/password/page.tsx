import type { Metadata } from 'next'
import ChangePasswordForm from '@/components/music-review/ChangePasswordForm'
import ProtectedFormPage from '@/components/music-review/ProtectedFormPage'

export const metadata: Metadata = {
  title: 'Music Review Change Password',
  description: 'Change password page',
}

export default function MusicReviewChangePasswordPage() {
  return (
    <ProtectedFormPage heading='Change Password'>
      <ChangePasswordForm />
    </ProtectedFormPage>
  )
}
