import type { IGarageRepository } from './garage-repository'
import { LocalStorageAdapter } from './local-storage-adapter'
import { SupabaseAdapter } from './supabase-adapter'

export * from './garage-repository'
export * from './local-storage-adapter'
export * from './supabase-adapter'

let repositoryInstance: IGarageRepository | null = null

/**
 * Factory lấy Repository đơn nhất (Singleton).
 * Có thể chuyển đổi qua lại giữa LocalStorage và Supabase thông qua biến môi trường
 * NEXT_PUBLIC_STORAGE_TYPE = 'supabase' | 'local'
 */
export function getGarageRepository(): IGarageRepository {
  if (repositoryInstance) {
    return repositoryInstance
  }

  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE?.toLowerCase()

  if (storageType === 'supabase') {
    repositoryInstance = new SupabaseAdapter()
  } else {
    repositoryInstance = new LocalStorageAdapter()
  }

  return repositoryInstance
}
