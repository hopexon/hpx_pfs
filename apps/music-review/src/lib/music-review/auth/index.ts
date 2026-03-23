import { hasSupabasePublicEnv } from '@/lib/supabase/env'
import { createMockAuthApi } from './mockAuthApi'
import { createSupabaseAuthApi } from './supabaseAuthApi'
import type { MusicReviewAuthApi } from './types'

let authApi: MusicReviewAuthApi | null = null

export function getMusicReviewAuthApi(): MusicReviewAuthApi {
  if (authApi) {
    return authApi
  }

  authApi = hasSupabasePublicEnv() ? createSupabaseAuthApi() : createMockAuthApi()
  return authApi
}
