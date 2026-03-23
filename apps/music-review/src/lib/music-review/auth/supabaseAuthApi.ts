import type { Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getSupabaseGuestAccountEnv } from '@/lib/supabase/env'
import {
  hasAuthErrors,
  validateEmailChangeInput,
  validateLoginInput,
  validateNicknameChangeInput,
  validatePasswordChangeInput,
  validateSignupInput,
} from './validation'
import { failure, success, actionFailure, actionSuccess } from './resultBuilders'
import type {
  MusicReviewAuthApi,
  MusicReviewSession,
  MusicReviewUser,
} from './types'

const missingSupabaseEnvError = {
  form: 'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (for backward compatibility, NEXT_PUBLIC_SUPABASE_ANON_KEY is also available)',
}

type AccountSyncPayload = {
  email?: string
  nickname?: string
}

function toMusicReviewUser(session: Session): MusicReviewUser {
  const email = session.user.email ?? ''
  const metadataNickname = session.user.user_metadata.nickname

  return {
    id: session.user.id,
    email,
    nickname: typeof metadataNickname === 'string' && metadataNickname.trim()
      ? metadataNickname
      : email.split('@')[0] ?? 'user',
    role: 'member',
  }
}

function toMusicReviewSession(session: Session): MusicReviewSession {
  return {
    provider: 'supabase',
    loginAt: new Date().toISOString(),
    user: toMusicReviewUser(session),
  }
}

function buildActor(session: Session) {
  const user = toMusicReviewUser(session)

  return {
    authUserId: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    provider: 'supabase' as const,
  }
}

async function syncMusicReviewProfile(
  session: Session,
  profile: AccountSyncPayload,
): Promise<{ ok: boolean; message?: string }> {
  const hasEmail = typeof profile.email === 'string' && profile.email.trim().length > 0
  const hasNickname = typeof profile.nickname === 'string' && profile.nickname.trim().length > 0

  if (!hasEmail && !hasNickname) {
    return {
      ok: true,
    }
  }

  const requestBody = {
    actor: buildActor(session),
    profile,
  }

  try {
    const response = await fetch('/api/music-review/account', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null

      return {
        ok: false,
        message: payload?.message ?? 'Failed to sync in-app profile',
      }
    }

    return {
      ok: true,
    }
  } catch {
    return {
      ok: false,
      message: 'Failed to sync in-app profile',
    }
  }
}

export function createSupabaseAuthApi(): MusicReviewAuthApi {
  return {
    getProvider: () => 'supabase',

    getSession: async () => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return null
      }

      const { data } = await client.auth.getSession()
      if (!data.session) {
        return null
      }

      return toMusicReviewSession(data.session)
    },

    loginWithPassword: async (input) => {
      const validationErrors = validateLoginInput(input)
      if (hasAuthErrors(validationErrors)) {
        return failure(validationErrors)
      }

      const client = getSupabaseBrowserClient()
      if (!client) {
        return failure(missingSupabaseEnvError)
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error || !data.session) {
        return failure({ form: error?.message ?? 'Failed to login' })
      }

      return success(toMusicReviewSession(data.session))
    },

    loginAsGuest: async () => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return failure(missingSupabaseEnvError)
      }

      const guestEnv = getSupabaseGuestAccountEnv()
      if (!guestEnv) {
        return failure({
          form: 'Supabase guest login environment variables are missing. Please set NEXT_PUBLIC_MUSIC_REVIEW_GUEST_EMAIL and NEXT_PUBLIC_MUSIC_REVIEW_GUEST_PASSWORD',
        })
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: guestEnv.email,
        password: guestEnv.password,
      })

      if (error || !data.session) {
        return failure({ form: error?.message ?? 'Failed to login as guest' })
      }

      return success(toMusicReviewSession(data.session))
    },

    signup: async (input) => {
      const validationErrors = validateSignupInput(input)
      if (hasAuthErrors(validationErrors)) {
        return failure(validationErrors)
      }

      const client = getSupabaseBrowserClient()
      if (!client) {
        return failure(missingSupabaseEnvError)
      }

      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            nickname: input.nickname,
          },
        },
      })

      if (error) {
        return failure({ form: error.message })
      }

      if (!data.session) {
        return failure({
          form: 'Email confirmation is required. Please check your email and confirm before logging in.',
        })
      }

      return success(toMusicReviewSession(data.session))
    },

    updateEmail: async (input) => {
      const validationErrors = validateEmailChangeInput(input)
      if (hasAuthErrors(validationErrors)) {
        return actionFailure(validationErrors)
      }

      const client = getSupabaseBrowserClient()
      if (!client) {
        return actionFailure(missingSupabaseEnvError)
      }

      const { data: sessionData } = await client.auth.getSession()
      const currentSession = sessionData.session
      if (!currentSession) {
        return actionFailure({
          form: 'Failed to verify login status',
        })
      }

      const currentEmail = currentSession.user.email?.toLowerCase() ?? ''
      if (currentEmail !== input.currentEmail.trim().toLowerCase()) {
        return actionFailure({
          currentEmail: 'Current email does not match',
        })
      }

      const nextEmail = input.newEmail.trim().toLowerCase()
      const { error } = await client.auth.updateUser({
        email: nextEmail,
      })

      if (error) {
        return actionFailure({
          form: error.message,
        })
      }

      const { data: refreshedData } = await client.auth.getSession()
      const activeSession = refreshedData.session ?? currentSession
      const syncResult = await syncMusicReviewProfile(activeSession, {
        email: nextEmail,
      })

      const message = syncResult.ok
        ? 'Email change request accepted. A confirmation email will be sent according to your settings.'
        : `Email change request accepted, but ${syncResult.message}`

      return actionSuccess(message, toMusicReviewSession(activeSession))
    },

    updatePassword: async (input) => {
      const validationErrors = validatePasswordChangeInput(input)
      if (hasAuthErrors(validationErrors)) {
        return actionFailure(validationErrors)
      }

      const client = getSupabaseBrowserClient()
      if (!client) {
        return actionFailure(missingSupabaseEnvError)
      }

      const { data: sessionData } = await client.auth.getSession()
      const currentSession = sessionData.session
      if (!currentSession || !currentSession.user.email) {
        return actionFailure({
          form: 'Failed to verify login status',
        })
      }

      const currentEmail = currentSession.user.email
      const { error: reAuthError } = await client.auth.signInWithPassword({
        email: currentEmail,
        password: input.currentPassword,
      })

      if (reAuthError) {
        return actionFailure({
          currentPassword: 'Current password is incorrect',
        })
      }

      const { error } = await client.auth.updateUser({
        password: input.newPassword,
      })

      if (error) {
        return actionFailure({
          form: error.message,
        })
      }

      const { data: refreshedData } = await client.auth.getSession()
      const activeSession = refreshedData.session ?? currentSession

      return actionSuccess('Password updated successfully', toMusicReviewSession(activeSession))
    },

    updateNickname: async (input) => {
      const validationErrors = validateNicknameChangeInput(input)
      if (hasAuthErrors(validationErrors)) {
        return actionFailure(validationErrors)
      }

      const client = getSupabaseBrowserClient()
      if (!client) {
        return actionFailure(missingSupabaseEnvError)
      }

      const { data: sessionData } = await client.auth.getSession()
      const currentSession = sessionData.session
      if (!currentSession) {
        return actionFailure({
          form: 'Failed to verify login status',
        })
      }

      const currentNickname = toMusicReviewUser(currentSession).nickname
      if (currentNickname !== input.currentNickname.trim()) {
        return actionFailure({
          currentNickname: 'Current nickname does not match',
        })
      }

      const nextNickname = input.newNickname.trim()
      const { error } = await client.auth.updateUser({
        data: {
          nickname: nextNickname,
        },
      })

      if (error) {
        return actionFailure({
          form: error.message,
        })
      }

      const { data: refreshedData } = await client.auth.getSession()
      const activeSession = refreshedData.session ?? currentSession
      const syncResult = await syncMusicReviewProfile(activeSession, {
        nickname: nextNickname,
      })

      const message = syncResult.ok
        ? 'Nickname updated successfully'
        : `Nickname updated, but ${syncResult.message}`

      return actionSuccess(message, toMusicReviewSession(activeSession))
    },

    deleteAccount: async () => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return actionFailure(missingSupabaseEnvError)
      }

      const { data: sessionData } = await client.auth.getSession()
      const currentSession = sessionData.session
      if (!currentSession) {
        return actionFailure({
          form: 'Failed to verify login status',
        })
      }

      try {
        const response = await fetch('/api/music-review/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({
            actor: buildActor(currentSession),
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { message?: string } | null

          return actionFailure({
            form: payload?.message ?? 'Failed to delete account',
          })
        }
      } catch {
        return actionFailure({
          form: 'Failed to delete account',
        })
      }

      await client.auth.signOut()
      return actionSuccess('Account deleted successfully', null)
    },

    logout: async () => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return
      }

      await client.auth.signOut()
    },

    subscribe: (listener) => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        return () => {}
      }

      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(session ? toMusicReviewSession(session) : null)
      })

      return () => {
        data.subscription.unsubscribe()
      }
    },
  }
}
