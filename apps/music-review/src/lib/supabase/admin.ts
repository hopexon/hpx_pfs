import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseServiceRoleEnv } from './env'

let adminClient: SupabaseClient | null | undefined

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (adminClient !== undefined) {
    return adminClient
  }

  const env = getSupabaseServiceRoleEnv()
  if (!env) {
    adminClient = null
    return null
  }

  adminClient = createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return adminClient
}
