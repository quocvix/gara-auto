import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let clientInstance: SupabaseClient | null = null

/**
 * Kiểm tra xem các biến môi trường Supabase đã được cung cấp hợp lệ hay chưa
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && url.startsWith('http') && key.length > 10)
}

/**
 * Lấy Supabase Client đơn nhất (Singleton) cho môi trường Browser/Client-side
 * Trả về null nếu chưa cấu hình biến môi trường
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!clientInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return clientInstance
}
