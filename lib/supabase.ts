import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

if ((!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') && process.env.NODE_ENV === 'production') {
  console.warn('Supabase environment variables are not set. Please configure them for production.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to create a typed Supabase client
export const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}