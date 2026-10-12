/**
 * Supabase Adapter Skeleton
 * 
 * Khi bạn sẵn sàng tích hợp Supabase:
 * 1. Cài đặt SDK: `pnpm add @supabase/supabase-js`
 * 2. Cấu hình biến môi trường trong .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 3. Chạy file SQL migration trong `supabase/schema.sql` trên Supabase SQL Editor.
 * 4. Kích hoạt SupabaseAdapter trong `lib/repository/index.ts` bằng cách đặt
 *    NEXT_PUBLIC_STORAGE_TYPE=supabase
 */

import type {
  GarageDataBundle,
  IGarageRepository,
  PartInput,
  SaveTicketInput,
} from './garage-repository'
import type { GarageSettings, Part, StockMovement, StockReason } from '@/types/garage'
import {
  INITIAL_MOVEMENTS,
  INITIAL_PARTS,
  INITIAL_SETTINGS,
  INITIAL_TICKETS,
  INITIAL_VEHICLES,
} from '@/lib/seed-data'

export class SupabaseAdapter implements IGarageRepository {
  // private supabase = createClient(...)

  async loadInitialData(): Promise<GarageDataBundle> {
    console.warn('[SupabaseAdapter] Chế độ Supabase chưa cấu hình API Keys, trả về dữ liệu mẫu.')
    return {
      vehicles: INITIAL_VEHICLES,
      tickets: INITIAL_TICKETS,
      parts: INITIAL_PARTS,
      movements: INITIAL_MOVEMENTS,
      settings: INITIAL_SETTINGS,
      isAdmin: true,
    }
  }

  async updateSettings(settings: Partial<GarageSettings>): Promise<GarageSettings> {
    // await this.supabase.from('garage_settings').update(settings).eq('id', 1)
    return { ...INITIAL_SETTINGS, ...settings }
  }

  async saveTicket(input: SaveTicketInput): Promise<{
    ok: boolean
    ticketId?: string
    error?: string
  }> {
    // 1. Upsert vehicle: await this.supabase.from('vehicles').upsert(...)
    // 2. Insert/update ticket: await this.supabase.from('warranty_tickets').upsert(...)
    // 3. Insert items: await this.supabase.from('ticket_items').insert(...)
    // 4. Update parts stock & log stock_movements
    console.warn('[SupabaseAdapter] saveTicket stub called with input:', input)
    return { ok: true, ticketId: input.ticketId || `tk_${Date.now()}` }
  }

  async deleteTicket(ticketId: string, restoreStock: boolean = true): Promise<{
    ok: boolean
    error?: string
  }> {
    // await this.supabase.from('warranty_tickets').delete().eq('id', ticketId)
    return { ok: true }
  }

  async deleteVehicle(vehicleId: string, restoreStock: boolean = true): Promise<{
    ok: boolean
    error?: string
  }> {
    // await this.supabase.from('vehicles').delete().eq('id', vehicleId)
    return { ok: true }
  }

  async savePart(input: PartInput): Promise<{
    ok: boolean
    error?: string
    part?: Part
  }> {
    // await this.supabase.from('parts').upsert(...)
    return { ok: true }
  }

  async deletePart(partId: string): Promise<{
    ok: boolean
    error?: string
  }> {
    // await this.supabase.from('parts').update({ is_active: false }).eq('id', partId)
    return { ok: true }
  }

  async adjustStock(
    partId: string,
    delta: number,
    reason: StockReason = 'adjust',
    note?: string
  ): Promise<{
    ok: boolean
    error?: string
  }> {
    // Call stored procedure RPC or update stock + insert stock_movement
    return { ok: true }
  }

  async resetData(): Promise<GarageDataBundle> {
    return {
      vehicles: INITIAL_VEHICLES,
      tickets: INITIAL_TICKETS,
      parts: INITIAL_PARTS,
      movements: INITIAL_MOVEMENTS,
      settings: INITIAL_SETTINGS,
      isAdmin: true,
    }
  }

  async setAdminRole(isAdmin: boolean): Promise<void> {
    // Supabase auth handles role via session / JWT metadata
  }
}
