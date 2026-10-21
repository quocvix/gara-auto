/**
 * Supabase Adapter hoàn chỉnh cho Duy Auto Gara
 * 
 * Hỗ trợ chuyển đổi đầy đủ 2 chiều giữa Postgres (snake_case) và Frontend TypeScript (camelCase).
 * Thực hiện gọi song song (async-parallel) theo khuyến nghị của Vercel React Best Practices.
 */

import type {
  GarageDataBundle,
  IGarageRepository,
  PartInput,
  SaveTicketInput,
} from './garage-repository'
import type {
  GarageSettings,
  Part,
  StockMovement,
  StockReason,
  TicketItem,
  Vehicle,
  WarrantyTicket,
} from '@/types/garage'
import {
  INITIAL_MOVEMENTS,
  INITIAL_PARTS,
  INITIAL_SETTINGS,
  INITIAL_TICKETS,
  INITIAL_VEHICLES,
} from '@/lib/seed-data'
import { getSupabaseClient } from '@/lib/supabase/client'
import { normalizePlate } from '@/lib/plate'
import { addMonthsToDate, todayVN } from '@/lib/warranty'

// ==========================================
// MAPPERS: POSTGRES (snake_case) <-> FRONTEND (camelCase)
// ==========================================

function rowToVehicle(r: any): Vehicle {
  return {
    id: r.id,
    plate: r.plate,
    plateNormalized: r.plate_normalized,
    plateColor: r.plate_color || 'white',
    model: r.model,
    color: r.color || '',
    ownerName: r.owner_name || '',
    ownerPhone: r.owner_phone || '',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  }
}

function rowToPart(r: any): Part {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Phụ tùng',
    warrantyMonths: r.warranty_months ?? 12,
    stock: Number(r.stock) || 0,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  }
}

function rowToTicketItem(r: any): TicketItem {
  return {
    id: r.id,
    ticketId: r.ticket_id,
    partId: r.part_id || null,
    partName: r.part_name,
    quantity: Number(r.quantity) || 1,
    warrantyMonths: Number(r.warranty_months) || 0,
    activatedOn: r.activated_on || undefined,
    expiresOn: r.expires_on,
  }
}

function rowToTicket(r: any): WarrantyTicket {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    activatedOn: r.activated_on,
    expiresOn: r.expires_on,
    note: r.note || undefined,
    items: Array.isArray(r.items) ? r.items.map(rowToTicketItem) : [],
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  }
}

function rowToMovement(r: any): StockMovement {
  return {
    id: Number(r.id),
    partId: r.part_id,
    partName: r.part_name,
    delta: Number(r.delta),
    stockAfter: Number(r.stock_after),
    reason: r.reason as StockReason,
    ticketId: r.ticket_id || undefined,
    note: r.note || undefined,
    createdAt: r.created_at || new Date().toISOString(),
  }
}

function rowToSettings(r: any): GarageSettings {
  return {
    id: Number(r.id) || 1,
    name: r.name || 'Duy Auto',
    hotline: r.hotline || '',
    address: r.address || '',
    mapsUrl: r.maps_url || '',
    expiringThresholdDays: Number(r.expiring_threshold_days) || 30,
    lowStockThreshold: Number(r.low_stock_threshold) || 5,
  }
}

export class SupabaseAdapter implements IGarageRepository {
  /**
   * Tải toàn bộ dữ liệu ban đầu song song (Promise.all)
   * Tuân thủ quy tắc Vercel React Best Practices `async-parallel`
   */
  async loadInitialData(): Promise<GarageDataBundle> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('[SupabaseAdapter] Chưa có cấu hình biến môi trường Supabase, trả về dữ liệu mẫu.')
      return {
        vehicles: INITIAL_VEHICLES,
        tickets: INITIAL_TICKETS,
        parts: INITIAL_PARTS,
        movements: INITIAL_MOVEMENTS,
        settings: INITIAL_SETTINGS,
        isAdmin: true,
      }
    }

    try {
      // 5 truy vấn chạy song song đồng thời (không tạo waterfall)
      const [
        { data: vehiclesData, error: vErr },
        { data: ticketsData, error: tErr },
        { data: partsData, error: pErr },
        { data: movementsData, error: mErr },
        { data: settingsData, error: sErr },
      ] = await Promise.all([
        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
        supabase.from('warranty_tickets').select('*, items:ticket_items(*)').order('activated_on', { ascending: false }),
        supabase.from('parts').select('*').order('name', { ascending: true }),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('garage_settings').select('*').eq('id', 1).maybeSingle(),
      ])

      if (vErr || tErr || pErr || mErr) {
        console.error('[SupabaseAdapter] Lỗi khi tải dữ liệu từ Supabase:', { vErr, tErr, pErr, mErr })
      }

      const vehicles = (vehiclesData || []).map(rowToVehicle)
      const tickets = (ticketsData || []).map(rowToTicket)
      const parts = (partsData || []).map(rowToPart)
      const movements = (movementsData || []).map(rowToMovement)
      const settings = settingsData ? rowToSettings(settingsData) : INITIAL_SETTINGS

      return {
        vehicles,
        tickets,
        parts,
        movements,
        settings,
        isAdmin: true,
      }
    } catch (error) {
      console.error('[SupabaseAdapter] Exception loadInitialData:', error)
      return {
        vehicles: INITIAL_VEHICLES,
        tickets: INITIAL_TICKETS,
        parts: INITIAL_PARTS,
        movements: INITIAL_MOVEMENTS,
        settings: INITIAL_SETTINGS,
        isAdmin: true,
      }
    }
  }

  async updateSettings(settings: Partial<GarageSettings>): Promise<GarageSettings> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { ...INITIAL_SETTINGS, ...settings }
    }

    const payload: Record<string, any> = { updated_at: new Date().toISOString() }
    if (settings.name !== undefined) payload.name = settings.name
    if (settings.hotline !== undefined) payload.hotline = settings.hotline
    if (settings.address !== undefined) payload.address = settings.address
    if (settings.mapsUrl !== undefined) payload.maps_url = settings.mapsUrl
    if (settings.expiringThresholdDays !== undefined) payload.expiring_threshold_days = settings.expiringThresholdDays
    if (settings.lowStockThreshold !== undefined) payload.low_stock_threshold = settings.lowStockThreshold

    const { data, error } = await supabase
      .from('garage_settings')
      .update(payload)
      .eq('id', 1)
      .select()
      .maybeSingle()

    if (error) {
      console.error('[SupabaseAdapter] Lỗi updateSettings:', error)
      throw error
    }

    return data ? rowToSettings(data) : { ...INITIAL_SETTINGS, ...settings }
  }

  async saveTicket(input: SaveTicketInput): Promise<{
    ok: boolean
    ticketId?: string
    error?: string
    data?: {
      vehicles: Vehicle[]
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { ok: true, ticketId: input.ticketId || `tk_${Date.now()}` }
    }

    try {
      const ticketActivatedOn = input.activatedOn || todayVN()
      const normPlate = normalizePlate(input.vehicle.plate)

      // 1. Tìm hoặc tạo xe
      const { data: existingVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate_normalized', normPlate)
        .limit(1)

      const existingVehicle = existingVehicles?.[0]
      const vehicleId = existingVehicle?.id || `veh_${Date.now()}`

      const vehicleRow = {
        id: vehicleId,
        plate: input.vehicle.plate.trim().toUpperCase(),
        plate_normalized: normPlate,
        plate_color: input.vehicle.plateColor,
        model: input.vehicle.model.trim(),
        color: input.vehicle.color !== undefined ? input.vehicle.color.trim() : (existingVehicle?.color || ''),
        owner_name: (input.vehicle.ownerName || '').trim(),
        owner_phone: (input.vehicle.ownerPhone || '').trim(),
        updated_at: new Date().toISOString(),
      }

      await supabase.from('vehicles').upsert(vehicleRow)

      // 2. Lấy thông tin phụ tùng để tính hạn bảo hành dài nhất
      const partIds = input.items.map((it) => it.partId)
      const { data: partsList } = await supabase.from('parts').select('*').in('id', partIds)
      const partsMap = new Map((partsList || []).map((p) => [p.id, p]))

      let maxExpiresOn = ticketActivatedOn
      const computedItems = input.items.map((it) => {
        const part = partsMap.get(it.partId)
        const wMonths = typeof it.warrantyMonths === 'number' ? it.warrantyMonths : (part?.warranty_months ?? 12)
        const itemActivatedOn = it.activatedOn || ticketActivatedOn
        const itExpires = wMonths > 0 ? addMonthsToDate(itemActivatedOn, wMonths) : itemActivatedOn
        if (itExpires > maxExpiresOn) maxExpiresOn = itExpires

        return {
          id: `tkit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          part_id: it.partId,
          part_name: part?.name || 'Phụ tùng',
          quantity: it.quantity,
          warranty_months: wMonths,
          activated_on: itemActivatedOn,
          expires_on: itExpires,
        }
      })

      // 3. Tạo hoặc cập nhật phiếu bảo hành
      const ticketId = input.ticketId || `tk_${Date.now()}`
      const ticketRow = {
        id: ticketId,
        vehicle_id: vehicleId,
        activated_on: ticketActivatedOn,
        expires_on: maxExpiresOn,
        note: input.note || null,
        updated_at: new Date().toISOString(),
      }

      await supabase.from('warranty_tickets').upsert(ticketRow)

      // 4. Xóa items cũ của ticket này (nếu đang sửa) và insert items mới
      if (input.ticketId) {
        await supabase.from('ticket_items').delete().eq('ticket_id', ticketId)
      }

      const itemsToInsert = computedItems.map((ci) => ({
        ...ci,
        ticket_id: ticketId,
      }))
      await supabase.from('ticket_items').insert(itemsToInsert)

      // 5. Cập nhật tồn kho & ghi nhận stock_movements nếu là phiếu mới
      if (!input.ticketId) {
        for (const it of input.items) {
          const part = partsMap.get(it.partId)
          if (part) {
            const newStock = Math.max(0, Number(part.stock) - it.quantity)
            await supabase.from('parts').update({ stock: newStock }).eq('id', part.id)
            await supabase.from('stock_movements').insert({
              part_id: part.id,
              part_name: part.name,
              delta: -it.quantity,
              stock_after: newStock,
              reason: 'ticket_use',
              ticket_id: ticketId,
              note: `Dùng cho xe ${input.vehicle.plate}`,
            })
          }
        }
      }

      // Tải lại dữ liệu mới nhất
      const bundle = await this.loadInitialData()
      return {
        ok: true,
        ticketId,
        data: {
          vehicles: bundle.vehicles,
          tickets: bundle.tickets,
          parts: bundle.parts,
          movements: bundle.movements,
        },
      }
    } catch (err: any) {
      console.error('[SupabaseAdapter] saveTicket failed:', err)
      return { ok: false, error: err?.message || 'Lỗi khi lưu phiếu bảo hành lên Supabase' }
    }
  }

  async deleteTicket(ticketId: string, restoreStock: boolean = true): Promise<{
    ok: boolean
    error?: string
    data?: {
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { ok: true }

    try {
      if (restoreStock) {
        const { data: items } = await supabase.from('ticket_items').select('*').eq('ticket_id', ticketId)
        if (items && items.length > 0) {
          for (const it of items) {
            if (it.part_id) {
              const { data: p } = await supabase.from('parts').select('stock, name').eq('id', it.part_id).maybeSingle()
              if (p) {
                const restored = Number(p.stock) + Number(it.quantity)
                await supabase.from('parts').update({ stock: restored }).eq('id', it.part_id)
                await supabase.from('stock_movements').insert({
                  part_id: it.part_id,
                  part_name: p.name,
                  delta: Number(it.quantity),
                  stock_after: restored,
                  reason: 'ticket_revert',
                  ticket_id: ticketId,
                  note: 'Hoàn kho do xóa phiếu bảo hành',
                })
              }
            }
          }
        }
      }

      await supabase.from('warranty_tickets').delete().eq('id', ticketId)
      const bundle = await this.loadInitialData()
      return {
        ok: true,
        data: {
          tickets: bundle.tickets,
          parts: bundle.parts,
          movements: bundle.movements,
        },
      }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  }

  async deleteVehicle(vehicleId: string, restoreStock: boolean = true): Promise<{
    ok: boolean
    error?: string
    data?: {
      vehicles: Vehicle[]
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { ok: true }

    try {
      // CASCADE onDelete trong SQL sẽ tự dọn warranty_tickets và ticket_items
      await supabase.from('vehicles').delete().eq('id', vehicleId)
      const bundle = await this.loadInitialData()
      return {
        ok: true,
        data: {
          vehicles: bundle.vehicles,
          tickets: bundle.tickets,
          parts: bundle.parts,
          movements: bundle.movements,
        },
      }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  }

  async savePart(input: PartInput): Promise<{
    ok: boolean
    error?: string
    part?: Part
    parts?: Part[]
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { ok: true }

    try {
      const partId = input.id || `prt_${Date.now()}`
      const isNew = !input.id

      const row = {
        id: partId,
        name: input.name.trim(),
        category: input.category || 'Phụ tùng',
        warranty_months: input.warrantyMonths ?? 12,
        stock: input.stock || 0,
        is_active: input.isActive ?? true,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from('parts').upsert(row).select().single()
      if (error) throw error

      if (isNew && input.stock > 0) {
        await supabase.from('stock_movements').insert({
          part_id: partId,
          part_name: input.name,
          delta: input.stock,
          stock_after: input.stock,
          reason: 'initial',
          note: 'Khởi tạo số lượng khi thêm phụ tùng',
        })
      }

      const bundle = await this.loadInitialData()
      return {
        ok: true,
        part: data ? rowToPart(data) : undefined,
        parts: bundle.parts,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  }

  async deletePart(partId: string): Promise<{
    ok: boolean
    error?: string
    parts?: Part[]
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { ok: true }

    try {
      await supabase.from('parts').update({ is_active: false }).eq('id', partId)
      const bundle = await this.loadInitialData()
      return { ok: true, parts: bundle.parts }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  }

  async adjustStock(
    partId: string,
    delta: number,
    reason: StockReason = 'adjust',
    note?: string
  ): Promise<{
    ok: boolean
    error?: string
    data?: {
      parts: Part[]
      movements: StockMovement[]
    }
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { ok: true }

    try {
      const { data: p } = await supabase.from('parts').select('*').eq('id', partId).single()
      if (!p) return { ok: false, error: 'Không tìm thấy phụ tùng' }

      const newStock = Math.max(0, Number(p.stock) + delta)
      await supabase.from('parts').update({ stock: newStock }).eq('id', partId)
      await supabase.from('stock_movements').insert({
        part_id: partId,
        part_name: p.name,
        delta,
        stock_after: newStock,
        reason,
        note: note || undefined,
      })

      const bundle = await this.loadInitialData()
      return {
        ok: true,
        data: {
          parts: bundle.parts,
          movements: bundle.movements,
        },
      }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  }

  async updateVehicleColor(vehicleId: string, color: string): Promise<{
    ok: boolean
    error?: string
    vehicles?: Vehicle[]
  }> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { ok: true }
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ color: color.trim(), updated_at: new Date().toISOString() })
        .eq('id', vehicleId)

      if (error) {
        return { ok: false, error: error.message }
      }

      const { data: vList } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
      return {
        ok: true,
        vehicles: (vList || []).map(rowToVehicle),
      }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Có lỗi xảy ra khi cập nhật màu xe' }
    }
  }

  async resetData(): Promise<GarageDataBundle> {
    return this.loadInitialData()
  }

  async setAdminRole(isAdmin: boolean): Promise<void> {
    // Supabase auth quản lý quyền qua JWT / Session
  }
}
