import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabasePublicEnv } from './env'

let serverClient: SupabaseClient | null | undefined

export function getSupabaseServerClient(): SupabaseClient | null {
  if (serverClient !== undefined) {
    return serverClient
  }

  const env = getSupabasePublicEnv()
  if (!env) {
    serverClient = null
    return null
  }

  serverClient = createClient(env.url, env.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return serverClient
}
