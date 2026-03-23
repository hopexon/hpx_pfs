export type MusicReviewAuthProvider = 'mock' | 'supabase'
export type MusicReviewUserRole = 'guest' | 'member'

export type MusicReviewUser = {
  id: string
  email: string
  nickname: string
  role: MusicReviewUserRole
}

export type MusicReviewSession = {
  provider: MusicReviewAuthProvider
  loginAt: string
  user: MusicReviewUser
}

export type MusicReviewLoginInput = {
  email: string
  password: string
}

export type MusicReviewSignupInput = {
  email: string
  nickname: string
  password: string
  passwordConfirm: string
}

export type MusicReviewChangeEmailInput = {
  currentEmail: string
  newEmail: string
  newEmailConfirm: string
}

export type MusicReviewChangePasswordInput = {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export type MusicReviewChangeNicknameInput = {
  currentNickname: string
  newNickname: string
  newNicknameConfirm: string
}

export type MusicReviewAuthErrorKey =
  | 'email'
  | 'password'
  | 'nickname'
  | 'passwordConfirm'
  | 'currentEmail'
  | 'newEmail'
  | 'newEmailConfirm'
  | 'currentPassword'
  | 'newPassword'
  | 'newPasswordConfirm'
  | 'currentNickname'
  | 'newNickname'
  | 'newNicknameConfirm'
  | 'form'

export type MusicReviewAuthErrors = Partial<Record<MusicReviewAuthErrorKey, string>>

export type MusicReviewAuthResult =
  | {
      ok: true
      session: MusicReviewSession
    }
  | {
      ok: false
      errors: MusicReviewAuthErrors
    }

export type MusicReviewAuthActionResult =
  | {
      ok: true
      message?: string
      session?: MusicReviewSession | null
    }
  | {
      ok: false
      errors: MusicReviewAuthErrors
    }

export type MusicReviewAuthStateListener = (session: MusicReviewSession | null) => void

export type MusicReviewAuthApi = {
  getProvider: () => MusicReviewAuthProvider
  getSession: () => Promise<MusicReviewSession | null>
  loginWithPassword: (input: MusicReviewLoginInput) => Promise<MusicReviewAuthResult>
  loginAsGuest: () => Promise<MusicReviewAuthResult>
  signup: (input: MusicReviewSignupInput) => Promise<MusicReviewAuthResult>
  updateEmail: (input: MusicReviewChangeEmailInput) => Promise<MusicReviewAuthActionResult>
  updatePassword: (input: MusicReviewChangePasswordInput) => Promise<MusicReviewAuthActionResult>
  updateNickname: (input: MusicReviewChangeNicknameInput) => Promise<MusicReviewAuthActionResult>
  deleteAccount: () => Promise<MusicReviewAuthActionResult>
  logout: () => Promise<void>
  subscribe: (listener: MusicReviewAuthStateListener) => () => void
}
