export type SupabasePublicEnv = {
  url: string
  publishableKey: string
}

export type SupabaseServiceRoleEnv = {
  url: string
  serviceRoleKey: string
}

export type SupabaseGuestAccountEnv = {
  email: string
  password: string
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !publishableKey) {
    return null
  }

  return {
    url,
    publishableKey,
  }
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabasePublicEnv() !== null
}

export function getSupabaseServiceRoleEnv(): SupabaseServiceRoleEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !serviceRoleKey) {
    return null
  }

  return {
    url,
    serviceRoleKey,
  }
}

export function getSupabaseGuestAccountEnv(): SupabaseGuestAccountEnv | null {
  const email = process.env.NEXT_PUBLIC_MUSIC_REVIEW_GUEST_EMAIL?.trim()
  const password = process.env.NEXT_PUBLIC_MUSIC_REVIEW_GUEST_PASSWORD?.trim()

  if (!email || !password) {
    return null
  }

  return {
    email,
    password,
  }
}
