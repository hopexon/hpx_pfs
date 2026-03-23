import type { Metadata } from 'next'
import SignupForm from '@/components/music-review/SignupForm'

export const metadata: Metadata = {
  title: 'Music Review Sign Up',
  description: 'Signup page for music review',
}

export default function MusicReviewSignupPage() {
  return <SignupForm />
}
