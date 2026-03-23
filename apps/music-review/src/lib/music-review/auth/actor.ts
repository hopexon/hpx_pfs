import type { MusicReviewSession } from './types'

export type MusicReviewActor = {
  authUserId: string
  email: string
  nickname: string
  role: 'guest' | 'member'
}

export function buildActorFromSession(session: MusicReviewSession): MusicReviewActor {
  return {
    authUserId: session.user.id,
    email: session.user.email,
    nickname: session.user.nickname,
    role: session.user.role,
  }
}
