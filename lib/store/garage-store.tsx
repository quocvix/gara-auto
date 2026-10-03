'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type {
  GarageSettings,
  Part,
  StockMovement,
  StockReason,
  TicketItem,
  Vehicle,
  VehicleOverview,
  WarrantyLookupResult,
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
import { daysLeft, getStatus, todayVN } from '@/lib/warranty'

interface SaveTicketInput {
  ticketId?: string
  vehicle: {
    plate: string
    plateColor: 'white' | 'yellow'
    model: string
    ownerName: string
    ownerPhone: string
  }
  odo: number
  items: {
    partId: string
    quantity: number
    serial?: string
  }[]
  note?: string
}

interface GarageStoreContextType {
  isLoaded: boolean
  isAdmin: boolean
  settings: GarageSettings
  vehicles: Vehicle[]
  tickets: WarrantyTicket[]
  parts: Part[]
  movements: StockMovement[]
  
  // Auth
  loginAdmin: () => void
  logoutAdmin: () => void
  toggleAdminRole: () => void

  // Actions
  saveTicket: (input: SaveTicketInput) => { ok: boolean; error?: string; ticketId?: string }
  deleteTicket: (ticketId: string, restoreStock?: boolean) => void
  deleteVehicle: (vehicleId: string, restoreStock?: boolean) => void
  savePart: (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => { ok: boolean; error?: string }
  deletePart: (partId: string) => void
  adjustStock: (partId: string, delta: number, reason?: StockReason, note?: string) => { ok: boolean; error?: string }
  updateSettings: (newSettings: Partial<GarageSettings>) => void
  resetData: () => void

  // Lookups & Computed
  getVehicleOverviewList: () => VehicleOverview[]
  getVehicleOverviewById: (id: string) => VehicleOverview | undefined
  lookupWarranty: (plate: string) => WarrantyLookupResult | null
  getKpis: () => {
    activeVehicles: number
    expiringVehicles: number
    lowStockParts: number
    ticketsThisMonth: number
  }
}

const STORAGE_KEYS = {
  VEHICLES: 'gara_vehicles_v1',
  TICKETS: 'gara_tickets_v1',
  PARTS: 'gara_parts_v1',
  MOVEMENTS: 'gara_movements_v1',
  SETTINGS: 'gara_settings_v1',
  IS_ADMIN: 'gara_admin_v1',
}

const GarageStoreContext = createContext<GarageStoreContextType | null>(null)

export function GarageStoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true) // Default true for convenient preview, toggleable
  const [settings, setSettings] = useState<GarageSettings>(INITIAL_SETTINGS)
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)
  const [tickets, setTickets] = useState<WarrantyTicket[]>(INITIAL_TICKETS)
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS)
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS)

  // Khởi tạo từ LocalStorage nếu có
  useEffect(() => {
    try {
      const storedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES)
      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS)
      const storedParts = localStorage.getItem(STORAGE_KEYS.PARTS)
      const storedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS)
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN)

      if (storedVehicles) setVehicles(JSON.parse(storedVehicles))
      if (storedTickets) setTickets(JSON.parse(storedTickets))
      if (storedParts) setParts(JSON.parse(storedParts))
      if (storedMovements) setMovements(JSON.parse(storedMovements))
      if (storedSettings) setSettings(JSON.parse(storedSettings))
      if (storedAdmin !== null) setIsAdmin(storedAdmin === 'true')
    } catch (e) {
      console.error('Failed to load garage store from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync state vào LocalStorage
  const persist = (
    newVehicles: Vehicle[],
    newTickets: WarrantyTicket[],
    newParts: Part[],
    newMovements: StockMovement[],
    newSettings: GarageSettings,
  ) => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(newVehicles))
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(newTickets))
      localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(newParts))
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(newMovements))
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings))
    } catch (e) {
      console.error('Failed to persist to localStorage', e)
    }
  }

  const loginAdmin = () => {
    setIsAdmin(true)
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true')
  }

  const logoutAdmin = () => {
    setIsAdmin(false)
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false')
  }

  const toggleAdminRole = () => {
    setIsAdmin((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(next))
      return next
    })
  }

  const resetData = () => {
    setVehicles(INITIAL_VEHICLES)
    setTickets(INITIAL_TICKETS)
    setParts(INITIAL_PARTS)
    setMovements(INITIAL_MOVEMENTS)
    setSettings(INITIAL_SETTINGS)
    persist(INITIAL_VEHICLES, INITIAL_TICKETS, INITIAL_PARTS, INITIAL_MOVEMENTS, INITIAL_SETTINGS)
  }

  // Điều chỉnh tồn kho thủ công
  const adjustStock = (partId: string, delta: number, reason: StockReason = 'adjust', note?: string) => {
    const partIndex = parts.findIndex((p) => p.id === partId)
    if (partIndex === -1) return { ok: false, error: 'Không tìm thấy phụ tùng' }

    const currentPart = parts[partIndex]
    const newStock = currentPart.stock + delta
    if (newStock < 0) return { ok: false, error: 'Tồn kho không thể âm' }

    const updatedPart: Part = {
      ...currentPart,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    }
    const updatedParts = [...parts]
    updatedParts[partIndex] = updatedPart

    const newMovement: StockMovement = {
      id: Date.now(),
      partId,
      partName: currentPart.name,
      partSku: currentPart.sku,
      delta,
      stockAfter: newStock,
      reason,
      note,
      createdAt: new Date().toISOString(),
    }
    const updatedMovements = [newMovement, ...movements]

    setParts(updatedParts)
    setMovements(updatedMovements)
    persist(vehicles, tickets, updatedParts, updatedMovements, settings)
    return { ok: true }
  }

  // Thêm/Sửa phụ tùng
  const savePart = (partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const nowIso = new Date().toISOString()
    let updatedParts: Part[]
    let updatedMovements = [...movements]

    if (partData.id) {
      // Sửa
      const idx = parts.findIndex((p) => p.id === partData.id)
      if (idx === -1) return { ok: false, error: 'Phụ tùng không tồn tại' }

      const existing = parts[idx]
      const updated: Part = {
        ...existing,
        ...partData,
        stock: existing.stock, // Stock chỉ đổi qua adjust_stock
        updatedAt: nowIso,
      }
      updatedParts = [...parts]
      updatedParts[idx] = updated
    } else {
      // Thêm mới
      // Kiểm tra SKU trùng
      const dupSku = parts.some((p) => p.sku.toUpperCase() === partData.sku.toUpperCase() && p.isActive)
      if (dupSku) return { ok: false, error: 'Mã phụ tùng (SKU) đã tồn tại' }

      const newId = `part-${Date.now()}`
      const newPart: Part = {
        ...partData,
        id: newId,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
      updatedParts = [...parts, newPart]

      if (newPart.stock > 0) {
        updatedMovements = [
          {
            id: Date.now(),
            partId: newId,
            partName: newPart.name,
            partSku: newPart.sku,
            delta: newPart.stock,
            stockAfter: newPart.stock,
            reason: 'initial',
            note: 'Tạo phụ tùng mới',
            createdAt: nowIso,
          },
          ...movements,
        ]
      }
    }

    setParts(updatedParts)
    setMovements(updatedMovements)
    persist(vehicles, tickets, updatedParts, updatedMovements, settings)
    return { ok: true }
  }

  const deletePart = (partId: string) => {
    const updatedParts = parts.map((p) => (p.id === partId ? { ...p, isActive: false } : p))
    setParts(updatedParts)
    persist(vehicles, tickets, updatedParts, movements, settings)
  }

  // Lưu hoặc tạo phiếu bảo hành (Atomic logic theo §5.2 RPC)
  const saveTicket = (input: SaveTicketInput) => {
    const today = todayVN()
    const nowIso = new Date().toISOString()
    const norm = normalizePlate(input.vehicle.plate)

    if (norm.length < 5) {
      return { ok: false, error: 'Biển số xe phải có ít nhất 5 ký tự' }
    }
    if (!input.items || input.items.length === 0) {
      return { ok: false, error: 'Chọn ít nhất 1 phụ tùng để bảo hành' }
    }

    // 1. Kiểm tra tồn kho phụ tùng
    for (const item of input.items) {
      const part = parts.find((p) => p.id === item.partId)
      if (!part) return { ok: false, error: 'Phụ tùng không tồn tại trong kho' }
      if (part.stock < item.quantity) {
        return { ok: false, error: `Không đủ tồn kho cho phụ tùng: ${part.name} (Còn ${part.stock})` }
      }
    }

    let updatedParts = [...parts]
    let updatedMovements = [...movements]
    let updatedVehicles = [...vehicles]
    let updatedTickets = [...tickets]

    // 2. Upsert xe
    let vehicleId: string
    const existingVehicleIndex = vehicles.findIndex((v) => v.plateNormalized === norm)
    if (existingVehicleIndex >= 0) {
      vehicleId = vehicles[existingVehicleIndex].id
      updatedVehicles[existingVehicleIndex] = {
        ...vehicles[existingVehicleIndex],
        plate: input.vehicle.plate,
        plateColor: input.vehicle.plateColor,
        model: input.vehicle.model,
        ownerName: input.vehicle.ownerName,
        ownerPhone: input.vehicle.ownerPhone,
        odo: Math.max(vehicles[existingVehicleIndex].odo || 0, input.odo || 0),
        updatedAt: nowIso,
      }
    } else {
      vehicleId = `veh-${Date.now()}`
      const newVeh: Vehicle = {
        id: vehicleId,
        plate: input.vehicle.plate,
        plateNormalized: norm,
        plateColor: input.vehicle.plateColor,
        model: input.vehicle.model,
        ownerName: input.vehicle.ownerName,
        ownerPhone: input.vehicle.ownerPhone,
        odo: input.odo || 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
      updatedVehicles.push(newVeh)
    }

    // 3. Xử lý phiếu
    const ticketId = input.ticketId || `tick-${Date.now()}`
    let activatedOn = today

    // Nếu sửa phiếu cũ, hoàn lại tồn kho trước
    if (input.ticketId) {
      const oldTicket = tickets.find((t) => t.id === input.ticketId)
      if (oldTicket) {
        activatedOn = oldTicket.activatedOn
        for (const oldItem of oldTicket.items) {
          if (oldItem.partId) {
            const pIdx = updatedParts.findIndex((p) => p.id === oldItem.partId)
            if (pIdx >= 0) {
              const restoredStock = updatedParts[pIdx].stock + oldItem.quantity
              updatedParts[pIdx] = { ...updatedParts[pIdx], stock: restoredStock }
              updatedMovements.unshift({
                id: Date.now() + Math.random(),
                partId: oldItem.partId,
                partName: oldItem.partName,
                partSku: oldItem.partSku,
                delta: oldItem.quantity,
                stockAfter: restoredStock,
                reason: 'ticket_revert',
                ticketId,
                note: 'Hoàn kho khi chỉnh sửa phiếu',
                createdAt: nowIso,
              })
            }
          }
        }
      }
    }

    // 4. Tạo các hạng mục item & trừ kho
    let maxExpiresOn = activatedOn
    const finalItems: TicketItem[] = []

    for (const itemInput of input.items) {
      const pIdx = updatedParts.findIndex((p) => p.id === itemInput.partId)
      const part = updatedParts[pIdx]
      const qty = Math.max(1, itemInput.quantity || 1)

      // Tính ngày hết hạn món này
      const expDate = new Date(activatedOn)
      expDate.setMonth(expDate.getMonth() + part.warrantyMonths)
      const itemExpiresOn = expDate.toISOString().split('T')[0]

      if (itemExpiresOn > maxExpiresOn) {
        maxExpiresOn = itemExpiresOn
      }

      finalItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ticketId,
        partId: part.id,
        partName: part.name,
        partSku: part.sku,
        serial: itemInput.serial,
        quantity: qty,
        warrantyMonths: part.warrantyMonths,
        expiresOn: itemExpiresOn,
      })

      // Trừ kho
      const newStock = part.stock - qty
      updatedParts[pIdx] = { ...part, stock: newStock }
      updatedMovements.unshift({
        id: Date.now() + Math.random(),
        partId: part.id,
        partName: part.name,
        partSku: part.sku,
        delta: -qty,
        stockAfter: newStock,
        reason: 'ticket_use',
        ticketId,
        note: `Sử dụng cho xe ${input.vehicle.plate}`,
        createdAt: nowIso,
      })
    }

    // Lưu phiếu
    const finalTicket: WarrantyTicket = {
      id: ticketId,
      vehicleId,
      odo: input.odo,
      activatedOn,
      expiresOn: maxExpiresOn,
      note: input.note,
      items: finalItems,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    const tIdx = updatedTickets.findIndex((t) => t.id === ticketId)
    if (tIdx >= 0) {
      updatedTickets[tIdx] = finalTicket
    } else {
      updatedTickets.unshift(finalTicket)
    }

    setVehicles(updatedVehicles)
    setTickets(updatedTickets)
    setParts(updatedParts)
    setMovements(updatedMovements)
    persist(updatedVehicles, updatedTickets, updatedParts, updatedMovements, settings)

    return { ok: true, ticketId }
  }

  // Xóa phiếu
  const deleteTicket = (ticketId: string, restoreStock = true) => {
    const target = tickets.find((t) => t.id === ticketId)
    if (!target) return

    let updatedParts = [...parts]
    let updatedMovements = [...movements]

    if (restoreStock) {
      for (const item of target.items) {
        if (item.partId) {
          const pIdx = updatedParts.findIndex((p) => p.id === item.partId)
          if (pIdx >= 0) {
            const restoredStock = updatedParts[pIdx].stock + item.quantity
            updatedParts[pIdx] = { ...updatedParts[pIdx], stock: restoredStock }
            updatedMovements.unshift({
              id: Date.now() + Math.random(),
              partId: item.partId,
              partName: item.partName,
              partSku: item.partSku,
              delta: item.quantity,
              stockAfter: restoredStock,
              reason: 'ticket_revert',
              ticketId,
              note: 'Hoàn kho do xóa phiếu',
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }

    const updatedTickets = tickets.filter((t) => t.id !== ticketId)
    setTickets(updatedTickets)
    setParts(updatedParts)
    setMovements(updatedMovements)
    persist(vehicles, updatedTickets, updatedParts, updatedMovements, settings)
  }

  // Xóa xe
  const deleteVehicle = (vehicleId: string, restoreStock = true) => {
    const vehTickets = tickets.filter((t) => t.vehicleId === vehicleId)
    for (const t of vehTickets) {
      deleteTicket(t.id, restoreStock)
    }
    const updatedVehicles = vehicles.filter((v) => v.id !== vehicleId)
    setVehicles(updatedVehicles)
    persist(updatedVehicles, tickets, parts, movements, settings)
  }

  // Cập nhật cài đặt
  const updateSettings = (newSettings: Partial<GarageSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    persist(vehicles, tickets, parts, movements, updated)
  }

  // Danh sách xe kèm tổng quan (VehicleOverview)
  const getVehicleOverviewList = (): VehicleOverview[] => {
    return vehicles.map((v) => {
      const vTickets = tickets.filter((t) => t.vehicleId === v.id)
      let maxExpiresOn = ''
      let lastActivatedOn = ''
      let itemCount = 0

      for (const t of vTickets) {
        if (!maxExpiresOn || t.expiresOn > maxExpiresOn) maxExpiresOn = t.expiresOn
        if (!lastActivatedOn || t.activatedOn > lastActivatedOn) lastActivatedOn = t.activatedOn
        itemCount += t.items.reduce((sum, it) => sum + it.quantity, 0)
      }

      const days = daysLeft(maxExpiresOn)
      const status = getStatus(days, settings.expiringThresholdDays)

      return {
        ...v,
        expiresOn: maxExpiresOn,
        lastActivatedOn,
        ticketCount: vTickets.length,
        itemCount,
        status,
        daysLeft: days,
      }
    })
  }

  const getVehicleOverviewById = (id: string): VehicleOverview | undefined => {
    const list = getVehicleOverviewList()
    return list.find((v) => v.id === id || v.plateNormalized === normalizePlate(id))
  }

  // Tra cứu công khai cho khách
  const lookupWarranty = (plate: string): WarrantyLookupResult | null => {
    const norm = normalizePlate(plate)
    if (norm.length < 5) return null

    const vehicle = vehicles.find((v) => v.plateNormalized === norm)
    if (!vehicle) return null

    const vTickets = tickets
      .filter((t) => t.vehicleId === vehicle.id)
      .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn))

    let maxExpiresOn = ''
    for (const t of vTickets) {
      if (!maxExpiresOn || t.expiresOn > maxExpiresOn) maxExpiresOn = t.expiresOn
    }

    const days = daysLeft(maxExpiresOn)
    const status = getStatus(days, settings.expiringThresholdDays)

    const cleanPhone = (vehicle.ownerPhone || '').trim()
    const maskedPhone =
      cleanPhone.length >= 7 ? `${cleanPhone.slice(0, 3)}****${cleanPhone.slice(-3)}` : cleanPhone

    return {
      plate: vehicle.plate,
      plateNormalized: vehicle.plateNormalized,
      plateColor: vehicle.plateColor,
      model: vehicle.model,
      ownerName: vehicle.ownerName,
      ownerPhoneMasked: maskedPhone,
      ownerPhoneFull: cleanPhone,
      odo: vehicle.odo,
      expiresOn: maxExpiresOn,
      status,
      daysLeft: days,
      tickets: vTickets.map((t) => ({
        id: t.id,
        activatedOn: t.activatedOn,
        expiresOn: t.expiresOn,
        odo: t.odo,
        note: t.note,
        items: t.items.map((it) => ({
          name: it.partName,
          serial: it.serial,
          quantity: it.quantity,
          warrantyMonths: it.warrantyMonths,
          expiresOn: it.expiresOn,
        })),
      })),
    }
  }

  // KPI Dashboard
  const getKpis = () => {
    const overviewList = getVehicleOverviewList()
    const activeVehicles = overviewList.filter((v) => v.status === 'active' || v.status === 'expiring').length
    const expiringVehicles = overviewList.filter((v) => v.status === 'expiring').length
    const lowStockParts = parts.filter((p) => p.isActive && p.stock <= settings.lowStockThreshold).length

    const currentYearMonth = todayVN().slice(0, 7) // YYYY-MM
    const ticketsThisMonth = tickets.filter((t) => t.activatedOn.startsWith(currentYearMonth)).length

    return {
      activeVehicles,
      expiringVehicles,
      lowStockParts,
      ticketsThisMonth,
    }
  }

  return (
    <GarageStoreContext.Provider
      value={{
        isLoaded,
        isAdmin,
        settings,
        vehicles,
        tickets,
        parts,
        movements,
        loginAdmin,
        logoutAdmin,
        toggleAdminRole,
        saveTicket,
        deleteTicket,
        deleteVehicle,
        savePart,
        deletePart,
        adjustStock,
        updateSettings,
        resetData,
        getVehicleOverviewList,
        getVehicleOverviewById,
        lookupWarranty,
        getKpis,
      }}
    >
      {children}
    </GarageStoreContext.Provider>
  )
}

export function useGarageStore() {
  const context = useContext(GarageStoreContext)
  if (!context) {
    throw new Error('useGarageStore must be used within GarageStoreProvider')
  }
  return context
}
