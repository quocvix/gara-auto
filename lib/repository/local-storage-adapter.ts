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
import { normalizePlate } from '@/lib/plate'
import { todayVN } from '@/lib/warranty'

export const STORAGE_KEYS = {
  VEHICLES: 'gara_vehicles_v1',
  TICKETS: 'gara_tickets_v1',
  PARTS: 'gara_parts_v1',
  MOVEMENTS: 'gara_movements_v1',
  SETTINGS: 'gara_settings_v1',
  IS_ADMIN: 'gara_admin_v1',
} as const

export class LocalStorageAdapter implements IGarageRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : fallback
    } catch (e) {
      console.error(`[LocalStorageAdapter] Failed reading ${key}:`, e)
      return fallback
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(`[LocalStorageAdapter] Failed writing ${key}:`, e)
    }
  }

  async loadInitialData(): Promise<GarageDataBundle> {
    const rawVehicles = this.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES)
    const rawTickets = this.getItem<WarrantyTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS)
    const rawParts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const rawMovements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)
    let rawSettings = this.getItem<GarageSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)

    // Tự động chuẩn hóa thương hiệu Duy Auto
    if (
      rawSettings.name === 'GARA AUTO CARE' ||
      rawSettings.name === 'GARA DUY AUTO' ||
      !rawSettings.name
    ) {
      rawSettings = { ...rawSettings, name: 'Duy Auto' }
      this.setItem(STORAGE_KEYS.SETTINGS, rawSettings)
    }

    let isAdmin = true
    if (this.isBrowser()) {
      const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN)
      if (storedAdmin !== null) {
        isAdmin = storedAdmin === 'true'
      }
    }

    return {
      vehicles: rawVehicles,
      tickets: rawTickets,
      parts: rawParts,
      movements: rawMovements,
      settings: rawSettings,
      isAdmin,
    }
  }

  async updateSettings(newSettings: Partial<GarageSettings>): Promise<GarageSettings> {
    const current = this.getItem<GarageSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
    const updated = { ...current, ...newSettings }
    this.setItem(STORAGE_KEYS.SETTINGS, updated)
    return updated
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
    const vehicles = this.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES)
    const tickets = this.getItem<WarrantyTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS)
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const movements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)

    const normPlate = normalizePlate(input.vehicle.plate)
    if (!normPlate) {
      return { ok: false, error: 'Biển số xe không hợp lệ' }
    }

    const now = new Date().toISOString()
    const activatedDate = todayVN()

    // 1. Tìm hoặc tạo xe
    let vehicle = vehicles.find((v) => normalizePlate(v.plate) === normPlate)
    let updatedVehicles = [...vehicles]

    if (vehicle) {
      vehicle = {
        ...vehicle,
        plate: input.vehicle.plate,
        plateNormalized: normPlate,
        plateColor: input.vehicle.plateColor,
        model: input.vehicle.model || vehicle.model,
        ownerName: input.vehicle.ownerName || vehicle.ownerName,
        ownerPhone: input.vehicle.ownerPhone || vehicle.ownerPhone,
        updatedAt: now,
      }
      updatedVehicles = updatedVehicles.map((v) => (v.id === vehicle!.id ? vehicle! : v))
    } else {
      vehicle = {
        id: `veh_${Date.now()}`,
        plate: input.vehicle.plate,
        plateNormalized: normPlate,
        plateColor: input.vehicle.plateColor,
        model: input.vehicle.model,
        ownerName: input.vehicle.ownerName,
        ownerPhone: input.vehicle.ownerPhone,
        createdAt: now,
        updatedAt: now,
      }
      updatedVehicles.unshift(vehicle)
    }

    // 2. Tính toán ngày hết hạn cho từng linh kiện
    const addMonths = (dateStr: string, months: number): string => {
      const d = new Date(dateStr)
      d.setMonth(d.getMonth() + months)
      return d.toISOString().slice(0, 10)
    }

    let updatedParts = [...parts]
    let updatedMovements = [...movements]

    const ticketId = input.ticketId || `tk_${Date.now()}`
    const isEdit = !!input.ticketId
    const oldTicket = isEdit ? tickets.find((t) => t.id === input.ticketId) : undefined

    // 3. Quản lý kho phụ tùng
    if (isEdit && oldTicket) {
      // Hoàn lại kho cũ trước khi tính mới
      for (const oldItem of oldTicket.items) {
        if (!oldItem.partId) continue
        const partIdx = updatedParts.findIndex((p) => p.id === oldItem.partId)
        if (partIdx !== -1) {
          const currentStock = updatedParts[partIdx].stock
          const newStock = currentStock + oldItem.quantity
          updatedParts[partIdx] = { ...updatedParts[partIdx], stock: newStock, updatedAt: now }
          updatedMovements.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000),
            partId: oldItem.partId,
            partName: oldItem.partName,
            delta: oldItem.quantity,
            stockAfter: newStock,
            reason: 'ticket_revert',
            ticketId,
            note: `Hoàn kho cập nhật phiếu ${ticketId}`,
            createdAt: now,
          })
        }
      }
    }

    // Trừ kho mới
    const items: TicketItem[] = []
    let maxExpiresOn = activatedDate

    for (let i = 0; i < input.items.length; i++) {
      const it = input.items[i]
      const part = updatedParts.find((p) => p.id === it.partId)
      const partName = part ? part.name : 'Dịch vụ / Phụ tùng ngoài'
      const warrantyMonths = it.warrantyMonths ?? (part ? part.warrantyMonths ?? 12 : 12)
      const expDate = addMonths(activatedDate, warrantyMonths)

      if (expDate > maxExpiresOn) {
        maxExpiresOn = expDate
      }

      items.push({
        id: `it_${Date.now()}_${i}`,
        ticketId,
        partId: it.partId || null,
        partName,
        quantity: it.quantity,
        warrantyMonths,
        expiresOn: expDate,
      })

      // Trừ kho
      if (it.partId && part) {
        const partIdx = updatedParts.findIndex((p) => p.id === it.partId)
        if (partIdx !== -1) {
          const currentStock = updatedParts[partIdx].stock
          const newStock = currentStock - it.quantity
          updatedParts[partIdx] = { ...updatedParts[partIdx], stock: newStock, updatedAt: now }
          updatedMovements.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000) + i,
            partId: it.partId,
            partName: part.name,
            delta: -it.quantity,
            stockAfter: newStock,
            reason: 'ticket_use',
            ticketId,
            note: `Xuất cho xe ${input.vehicle.plate}`,
            createdAt: now,
          })
        }
      }
    }

    // 4. Lưu phiếu
    const newTicket: WarrantyTicket = {
      id: ticketId,
      vehicleId: vehicle.id,
      activatedOn: oldTicket ? oldTicket.activatedOn : activatedDate,
      expiresOn: maxExpiresOn,
      note: input.note,
      items,
      createdAt: oldTicket ? oldTicket.createdAt : now,
      updatedAt: now,
    }

    let updatedTickets = [...tickets]
    if (isEdit) {
      updatedTickets = updatedTickets.map((t) => (t.id === ticketId ? newTicket : t))
    } else {
      updatedTickets.unshift(newTicket)
    }

    // 5. Lưu vào LocalStorage
    this.setItem(STORAGE_KEYS.VEHICLES, updatedVehicles)
    this.setItem(STORAGE_KEYS.TICKETS, updatedTickets)
    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)

    return {
      ok: true,
      ticketId,
      data: {
        vehicles: updatedVehicles,
        tickets: updatedTickets,
        parts: updatedParts,
        movements: updatedMovements,
      },
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
    const tickets = this.getItem<WarrantyTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS)
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const movements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return { ok: false, error: 'Không tìm thấy phiếu bảo hành' }

    let updatedParts = [...parts]
    const updatedMovements = [...movements]
    const now = new Date().toISOString()

    if (restoreStock) {
      for (const item of ticket.items) {
        if (!item.partId) continue
        const partIdx = updatedParts.findIndex((p) => p.id === item.partId)
        if (partIdx !== -1) {
          const currentStock = updatedParts[partIdx].stock
          const newStock = currentStock + item.quantity
          updatedParts[partIdx] = { ...updatedParts[partIdx], stock: newStock, updatedAt: now }
          updatedMovements.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000),
            partId: item.partId,
            partName: item.partName,
            delta: item.quantity,
            stockAfter: newStock,
            reason: 'ticket_revert',
            ticketId,
            note: `Hoàn kho do xóa phiếu ${ticketId}`,
            createdAt: now,
          })
        }
      }
    }

    const updatedTickets = tickets.filter((t) => t.id !== ticketId)

    this.setItem(STORAGE_KEYS.TICKETS, updatedTickets)
    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)

    return {
      ok: true,
      data: {
        tickets: updatedTickets,
        parts: updatedParts,
        movements: updatedMovements,
      },
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
    const vehicles = this.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES)
    const tickets = this.getItem<WarrantyTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS)
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const movements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)

    const vehTickets = tickets.filter((t) => t.vehicleId === vehicleId)
    let updatedParts = [...parts]
    const updatedMovements = [...movements]
    const now = new Date().toISOString()

    if (restoreStock) {
      for (const tk of vehTickets) {
        for (const item of tk.items) {
          if (!item.partId) continue
          const partIdx = updatedParts.findIndex((p) => p.id === item.partId)
          if (partIdx !== -1) {
            const currentStock = updatedParts[partIdx].stock
            const newStock = currentStock + item.quantity
            updatedParts[partIdx] = { ...updatedParts[partIdx], stock: newStock, updatedAt: now }
            updatedMovements.unshift({
              id: Date.now() + Math.floor(Math.random() * 1000),
              partId: item.partId,
              partName: item.partName,
              delta: item.quantity,
              stockAfter: newStock,
              reason: 'ticket_revert',
              ticketId: tk.id,
              note: `Hoàn kho do xóa xe ${vehicleId}`,
              createdAt: now,
            })
          }
        }
      }
    }

    const updatedVehicles = vehicles.filter((v) => v.id !== vehicleId)
    const updatedTickets = tickets.filter((t) => t.vehicleId !== vehicleId)

    this.setItem(STORAGE_KEYS.VEHICLES, updatedVehicles)
    this.setItem(STORAGE_KEYS.TICKETS, updatedTickets)
    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)

    return {
      ok: true,
      data: {
        vehicles: updatedVehicles,
        tickets: updatedTickets,
        parts: updatedParts,
        movements: updatedMovements,
      },
    }
  }

  async savePart(input: PartInput): Promise<{
    ok: boolean
    error?: string
    part?: Part
    parts?: Part[]
  }> {
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const movements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)
    const now = new Date().toISOString()

    let updatedParts = [...parts]
    let savedPart: Part

    if (input.id) {
      const idx = updatedParts.findIndex((p) => p.id === input.id)
      if (idx === -1) return { ok: false, error: 'Không tìm thấy phụ tùng' }
      const oldPart = updatedParts[idx]
      savedPart = {
        ...oldPart,
        name: input.name.trim(),
        category: input.category.trim(),
        warrantyMonths: input.warrantyMonths ?? oldPart.warrantyMonths,
        stock: input.stock,
        isActive: input.isActive ?? true,
        updatedAt: now,
      }
      updatedParts[idx] = savedPart

      if (oldPart.stock !== input.stock) {
        const delta = input.stock - oldPart.stock
        const updatedMovements = [
          {
            id: Date.now(),
            partId: savedPart.id,
            partName: savedPart.name,
            delta,
            stockAfter: savedPart.stock,
            reason: 'adjust' as StockReason,
            note: 'Cập nhật lại thông tin phụ tùng',
            createdAt: now,
          },
          ...movements,
        ]
        this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)
      }
    } else {
      savedPart = {
        id: `part_${Date.now()}`,
        name: input.name.trim(),
        category: input.category.trim(),
        warrantyMonths: input.warrantyMonths ?? 12,
        stock: input.stock,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
      updatedParts.unshift(savedPart)

      const updatedMovements = [
        {
          id: Date.now(),
          partId: savedPart.id,
          partName: savedPart.name,
          delta: savedPart.stock,
          stockAfter: savedPart.stock,
          reason: 'initial' as StockReason,
          note: 'Khởi tạo phụ tùng mới',
          createdAt: now,
        },
        ...movements,
      ]
      this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)
    }

    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    return { ok: true, part: savedPart, parts: updatedParts }
  }

  async deletePart(partId: string): Promise<{
    ok: boolean
    error?: string
    parts?: Part[]
  }> {
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const updatedParts = parts.map((p) => (p.id === partId ? { ...p, isActive: false } : p))
    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    return { ok: true, parts: updatedParts }
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
    const parts = this.getItem<Part[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS)
    const movements = this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS)

    const part = parts.find((p) => p.id === partId)
    if (!part) return { ok: false, error: 'Phụ tùng không tồn tại' }

    const newStock = part.stock + delta
    if (newStock < 0) return { ok: false, error: 'Tồn kho không thể âm' }

    const now = new Date().toISOString()
    const updatedParts = parts.map((p) => (p.id === partId ? { ...p, stock: newStock, updatedAt: now } : p))

    const newMovement: StockMovement = {
      id: Date.now(),
      partId,
      partName: part.name,
      delta,
      stockAfter: newStock,
      reason,
      note: note || (delta > 0 ? 'Nhập kho thủ công' : 'Xuất kho thủ công'),
      createdAt: now,
    }
    const updatedMovements = [newMovement, ...movements]

    this.setItem(STORAGE_KEYS.PARTS, updatedParts)
    this.setItem(STORAGE_KEYS.MOVEMENTS, updatedMovements)

    return {
      ok: true,
      data: {
        parts: updatedParts,
        movements: updatedMovements,
      },
    }
  }

  async resetData(): Promise<GarageDataBundle> {
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.VEHICLES)
      localStorage.removeItem(STORAGE_KEYS.TICKETS)
      localStorage.removeItem(STORAGE_KEYS.PARTS)
      localStorage.removeItem(STORAGE_KEYS.MOVEMENTS)
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
      localStorage.removeItem(STORAGE_KEYS.IS_ADMIN)
    }
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
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(isAdmin))
    }
  }
}
