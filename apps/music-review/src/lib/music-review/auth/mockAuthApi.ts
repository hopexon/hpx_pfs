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
  MusicReviewAuthStateListener,
  MusicReviewSession,
  MusicReviewSignupInput,
  MusicReviewUser,
} from './types'

const USERS_KEY = 'music-review:mock-users'
const SESSION_KEY = 'music-review:session'

type StoredUser = {
  id: string
  email: string
  nickname: string
  password: string
}

const defaultUsers: StoredUser[] = [
  {
    id: 'user-demo-001',
    email: 'demo@example.com',
    nickname: 'demo_user',
    password: 'password123',
  },
]

const guestUser: MusicReviewUser = {
  id: 'guest-user-001',
  email: 'guest@music-review.local',
  nickname: 'guest_user',
  role: 'guest',
}

const listeners = new Set<MusicReviewAuthStateListener>()
let memorySession: MusicReviewSession | null = null
let memoryUsers: StoredUser[] = [...defaultUsers]

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) {
    return memoryUsers
  }

  const current = safeParse<StoredUser[]>(window.localStorage.getItem(USERS_KEY), [])
  if (current.length === 0) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
    return [...defaultUsers]
  }

  return current
}

function writeUsers(users: StoredUser[]): void {
  if (!canUseStorage()) {
    memoryUsers = users
    return
  }

  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession(): MusicReviewSession | null {
  if (!canUseStorage()) {
    return memorySession
  }

  return safeParse<MusicReviewSession | null>(window.localStorage.getItem(SESSION_KEY), null)
}

function writeSession(session: MusicReviewSession | null): void {
  if (!canUseStorage()) {
    memorySession = session
    return
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
    return
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function emit(session: MusicReviewSession | null): void {
  listeners.forEach((listener) => listener(session))
}

function toMemberUser(user: StoredUser): MusicReviewUser {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: 'member',
  }
}

function createSession(user: MusicReviewUser): MusicReviewSession {
  return {
    provider: 'mock',
    loginAt: new Date().toISOString(),
    user,
  }
}

function getMutableSession(): MusicReviewSession | null {
  return readSession()
}

export function createMockAuthApi(): MusicReviewAuthApi {
  return {
    getProvider: () => 'mock',

    getSession: async () => {
      return readSession()
    },

    loginWithPassword: async (input) => {
      const errors = validateLoginInput(input)
      if (hasAuthErrors(errors)) {
        return failure(errors)
      }

      const users = readUsers()
      const matchedUser = users.find(
        (user) => user.email.toLowerCase() === input.email.trim().toLowerCase() && user.password === input.password,
      )

      if (!matchedUser) {
        return failure({
          form: 'Invalid email or password',
        })
      }

      const session = createSession(toMemberUser(matchedUser))
      writeSession(session)
      emit(session)
      return success(session)
    },

    loginAsGuest: async () => {
      const session = createSession(guestUser)
      writeSession(session)
      emit(session)
      return success(session)
    },

    signup: async (input: MusicReviewSignupInput) => {
      const errors = validateSignupInput(input)
      if (hasAuthErrors(errors)) {
        return failure(errors)
      }

      const users = readUsers()
      const email = input.email.trim().toLowerCase()

      const exists = users.some((user) => user.email.toLowerCase() === email)
      if (exists) {
        return failure({
          email: 'This email address is already in use',
        })
      }

      const nextUser: StoredUser = {
        id: `user-${Date.now()}`,
        email,
        nickname: input.nickname.trim(),
        password: input.password,
      }

      const nextUsers = [...users, nextUser]
      writeUsers(nextUsers)

      const session = createSession(toMemberUser(nextUser))
      writeSession(session)
      emit(session)

      return success(session)
    },

    updateEmail: async (input) => {
      const errors = validateEmailChangeInput(input)
      if (hasAuthErrors(errors)) {
        return actionFailure(errors)
      }

      const session = getMutableSession()
      if (!session) {
        return actionFailure({
          form: 'Unable to verify login status',
        })
      }

      if (session.user.role === 'guest') {
        return actionFailure({
          form: 'Guest accounts cannot change their email address',
        })
      }

      if (session.user.email.toLowerCase() !== input.currentEmail.trim().toLowerCase()) {
        return actionFailure({
          currentEmail: 'Current email does not match',
        })
      }

      const users = readUsers()
      const targetIndex = users.findIndex((user) => user.id === session.user.id)
      if (targetIndex < 0) {
        return actionFailure({
          form: 'Account information not found',
        })
      }

      const nextEmail = input.newEmail.trim().toLowerCase()
      const emailExists = users.some((user, index) => index !== targetIndex && user.email.toLowerCase() === nextEmail)

      if (emailExists) {
        return actionFailure({
          newEmail: 'This email address is already in use',
        })
      }

      const nextUsers = [...users]
      nextUsers[targetIndex] = {
        ...nextUsers[targetIndex],
        email: nextEmail,
      }
      writeUsers(nextUsers)

      const nextSession: MusicReviewSession = {
        ...session,
        user: {
          ...session.user,
          email: nextEmail,
        },
      }

      writeSession(nextSession)
      emit(nextSession)

      return actionSuccess('Successfully updated email address', nextSession)
    },

    updatePassword: async (input) => {
      const errors = validatePasswordChangeInput(input)
      if (hasAuthErrors(errors)) {
        return actionFailure(errors)
      }

      const session = getMutableSession()
      if (!session) {
        return actionFailure({
          form: 'Unable to verify login status',
        })
      }

      if (session.user.role === 'guest') {
        return actionFailure({
          form: 'Guest accounts cannot change their password',
        })
      }

      const users = readUsers()
      const targetIndex = users.findIndex((user) => user.id === session.user.id)
      if (targetIndex < 0) {
        return actionFailure({
          form: 'Account information not found',
        })
      }

      if (users[targetIndex].password !== input.currentPassword) {
        return actionFailure({
          currentPassword: 'Current password is incorrect',
        })
      }

      const nextUsers = [...users]
      nextUsers[targetIndex] = {
        ...nextUsers[targetIndex],
        password: input.newPassword,
      }
      writeUsers(nextUsers)

      return actionSuccess('Successfully updated password', session)
    },

    updateNickname: async (input) => {
      const errors = validateNicknameChangeInput(input)
      if (hasAuthErrors(errors)) {
        return actionFailure(errors)
      }

      const session = getMutableSession()
      if (!session) {
        return actionFailure({
          form: 'Unable to verify login status',
        })
      }

      if (session.user.role === 'guest') {
        return actionFailure({
          form: 'Guest accounts cannot change their nickname',
        })
      }

      if (session.user.nickname !== input.currentNickname.trim()) {
        return actionFailure({
          currentNickname: 'Current nickname does not match',
        })
      }

      const users = readUsers()
      const targetIndex = users.findIndex((user) => user.id === session.user.id)
      if (targetIndex < 0) {
        return actionFailure({
          form: 'Account information not found',
        })
      }

      const nextNickname = input.newNickname.trim()
      const nextUsers = [...users]
      nextUsers[targetIndex] = {
        ...nextUsers[targetIndex],
        nickname: nextNickname,
      }
      writeUsers(nextUsers)

      const nextSession: MusicReviewSession = {
        ...session,
        user: {
          ...session.user,
          nickname: nextNickname,
        },
      }

      writeSession(nextSession)
      emit(nextSession)

      return actionSuccess('Successfully updated nickname', nextSession)
    },

    deleteAccount: async () => {
      const session = getMutableSession()
      if (!session) {
        return actionFailure({
          form: 'Unable to verify login status',
        })
      }

      if (session.user.role === 'guest') {
        return actionFailure({
          form: 'Guest accounts cannot be deleted',
        })
      }

      const users = readUsers()
      const nextUsers = users.filter((user) => user.id !== session.user.id)
      writeUsers(nextUsers)

      writeSession(null)
      emit(null)

      return actionSuccess('Successfully deleted account', null)
    },

    logout: async () => {
      writeSession(null)
      emit(null)
    },

    subscribe: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}
