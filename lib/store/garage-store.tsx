'use client'

import React, { useEffect } from 'react'
import { create } from 'zustand'
import type {
  GarageSettings,
  ItemWarrantyStatus,
  Part,
  StockMovement,
  StockReason,
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
import {
  getGarageRepository,
  type PartInput,
  type SaveTicketInput,
} from '@/lib/repository'

import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

export type { SaveTicketInput, PartInput }

export interface GarageStoreState {
  isLoaded: boolean
  isLoading: boolean
  isSaving: boolean
  isAdmin: boolean
  user: User | null
  authChecked: boolean
  settings: GarageSettings
  vehicles: Vehicle[]
  tickets: WarrantyTicket[]
  parts: Part[]
  movements: StockMovement[]

  // Khởi tạo
  init: () => Promise<void>

  // Auth & Quyền
  loginWithSupabase: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signUpWithSupabase: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  loginAdmin: () => void
  logoutAdmin: () => Promise<void>
  toggleAdminRole: () => void

  // Thao tác bất đồng bộ (Async Actions)
  saveTicket: (input: SaveTicketInput) => Promise<{ ok: boolean; error?: string; ticketId?: string }>
  deleteTicket: (ticketId: string, restoreStock?: boolean) => Promise<{ ok: boolean; error?: string }>
  deleteVehicle: (vehicleId: string, restoreStock?: boolean) => Promise<{ ok: boolean; error?: string }>
  savePart: (part: PartInput) => Promise<{ ok: boolean; error?: string; part?: Part }>
  deletePart: (partId: string) => Promise<{ ok: boolean; error?: string }>
  adjustStock: (
    partId: string,
    delta: number,
    reason?: StockReason,
    note?: string
  ) => Promise<{ ok: boolean; error?: string }>
  updateSettings: (newSettings: Partial<GarageSettings>) => Promise<void>
  resetData: () => Promise<void>

  // Computed & Selectors
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

const CACHE_KEY = 'gara_cache_bundle_v1'

function getCachedBundle(): {
  vehicles: Vehicle[]
  tickets: WarrantyTicket[]
  parts: Part[]
  movements: StockMovement[]
  settings: GarageSettings
} | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.vehicles)) {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

function saveCacheBundle(bundle: {
  vehicles: Vehicle[]
  tickets: WarrantyTicket[]
  parts: Part[]
  movements: StockMovement[]
  settings: GarageSettings
}) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(bundle))
  } catch {
    // ignore
  }
}

export const useGarageStore = create<GarageStoreState>((set, get) => ({
  isLoaded: false,
  isLoading: false,
  isSaving: false,
  isAdmin: false,
  user: null,
  authChecked: false,
  settings: INITIAL_SETTINGS,
  vehicles: INITIAL_VEHICLES,
  tickets: INITIAL_TICKETS,
  parts: INITIAL_PARTS,
  movements: INITIAL_MOVEMENTS,

  init: async () => {
    // 1. Fast-path: Khôi phục cache tức thì (0ms) nếu đã có phiên trước
    const cached = getCachedBundle()
    if (cached && !get().isLoaded) {
      set({
        vehicles: cached.vehicles,
        tickets: cached.tickets,
        parts: cached.parts,
        movements: cached.movements,
        settings: cached.settings,
        isLoaded: true,
      })
    }

    if (get().isLoading) return
    set({ isLoading: true })

    try {
      const supabase = getSupabaseClient()
      let currentUser: User | null = null
      let isUserAdmin = false

      if (supabase) {
        // Đọc session trực tiếp từ local storage (<10ms) và mở khóa authChecked ngay lập tức!
        const { data: { session } } = await supabase.auth.getSession()
        currentUser = session?.user ?? null
        isUserAdmin = !!currentUser

        set({
          user: currentUser,
          isAdmin: isUserAdmin,
          authChecked: true,
        })

        // Lắng nghe sự kiện auth thay đổi trong session
        supabase.auth.onAuthStateChange((_event, session) => {
          const u = session?.user ?? null
          set({ user: u, isAdmin: !!u, authChecked: true })
        })
      } else {
        set({ authChecked: true, isAdmin: true })
      }

      // Tải dữ liệu mới nhất ngầm từ repository (Stale-While-Revalidate)
      const repo = getGarageRepository()
      const bundle = await repo.loadInitialData()

      saveCacheBundle({
        vehicles: bundle.vehicles,
        tickets: bundle.tickets,
        parts: bundle.parts,
        movements: bundle.movements,
        settings: bundle.settings,
      })

      set({
        vehicles: bundle.vehicles,
        tickets: bundle.tickets,
        parts: bundle.parts,
        movements: bundle.movements,
        settings: bundle.settings,
        isAdmin: supabase ? isUserAdmin : bundle.isAdmin,
        user: currentUser,
        authChecked: true,
        isLoaded: true,
        isLoading: false,
      })
    } catch (e) {
      console.error('[GarageStore] Khởi tạo dữ liệu thất bại:', e)
      set({ isLoaded: true, isLoading: false, authChecked: true })
    }
  },

  loginWithSupabase: async (identifier: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      set({ isAdmin: true, authChecked: true })
      return { ok: true }
    }
    const cleanId = identifier.trim()
    const email = cleanId.includes('@') ? cleanId : `${cleanId}@duyauto.vn`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { ok: false, error: error.message }
    }
    set({ user: data.user, isAdmin: true, authChecked: true })
    try {
      const repo = getGarageRepository()
      const bundle = await repo.loadInitialData()
      set({
        vehicles: bundle.vehicles,
        tickets: bundle.tickets,
        parts: bundle.parts,
        movements: bundle.movements,
        settings: bundle.settings,
      })
    } catch (err) {
      console.error('[GarageStore] Lỗi tải dữ liệu sau đăng nhập:', err)
    }
    return { ok: true }
  },

  signUpWithSupabase: async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { ok: false, error: 'Chưa cấu hình Supabase' }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      return { ok: false, error: error.message }
    }
    if (data.session && data.user) {
      set({ user: data.user, isAdmin: true, authChecked: true })
      try {
        const repo = getGarageRepository()
        const bundle = await repo.loadInitialData()
        set({
          vehicles: bundle.vehicles,
          tickets: bundle.tickets,
          parts: bundle.parts,
          movements: bundle.movements,
          settings: bundle.settings,
        })
      } catch (err) {
        console.error('[GarageStore] Lỗi tải dữ liệu sau đăng ký:', err)
      }
    }
    return { ok: true }
  },

  loginAdmin: () => {
    set({ isAdmin: true })
    getGarageRepository().setAdminRole(true).catch(console.error)
  },

  logoutAdmin: async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error('[GarageStore] Lỗi Supabase signOut:', e)
      }
    }
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(CACHE_KEY)
      } catch {
        // ignore
      }
    }
    set({ user: null, isAdmin: false, authChecked: true })
    getGarageRepository().setAdminRole(false).catch(console.error)
  },

  toggleAdminRole: () => {
    const next = !get().isAdmin
    set({ isAdmin: next })
    getGarageRepository().setAdminRole(next).catch(console.error)
  },

  saveTicket: async (input: SaveTicketInput) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.saveTicket(input)
      if (res.ok && res.data) {
        set({
          vehicles: res.data.vehicles,
          tickets: res.data.tickets,
          parts: res.data.parts,
          movements: res.data.movements,
          isSaving: false,
        })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error, ticketId: res.ticketId }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi không xác định khi lưu phiếu' }
    }
  },

  deleteTicket: async (ticketId: string, restoreStock = true) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.deleteTicket(ticketId, restoreStock)
      if (res.ok && res.data) {
        set({
          tickets: res.data.tickets,
          parts: res.data.parts,
          movements: res.data.movements,
          isSaving: false,
        })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi khi xóa phiếu' }
    }
  },

  deleteVehicle: async (vehicleId: string, restoreStock = true) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.deleteVehicle(vehicleId, restoreStock)
      if (res.ok && res.data) {
        set({
          vehicles: res.data.vehicles,
          tickets: res.data.tickets,
          parts: res.data.parts,
          movements: res.data.movements,
          isSaving: false,
        })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi khi xóa xe' }
    }
  },

  savePart: async (input: PartInput) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.savePart(input)
      if (res.ok && res.parts) {
        // Cập nhật lại kho & movements
        const bundle = await repo.loadInitialData()
        set({
          parts: bundle.parts,
          movements: bundle.movements,
          isSaving: false,
        })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error, part: res.part }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi khi lưu phụ tùng' }
    }
  },

  deletePart: async (partId: string) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.deletePart(partId)
      if (res.ok && res.parts) {
        set({ parts: res.parts, isSaving: false })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi khi xóa phụ tùng' }
    }
  },

  adjustStock: async (
    partId: string,
    delta: number,
    reason: StockReason = 'adjust',
    note?: string
  ) => {
    set({ isSaving: true })
    try {
      const repo = getGarageRepository()
      const res = await repo.adjustStock(partId, delta, reason, note)
      if (res.ok && res.data) {
        set({
          parts: res.data.parts,
          movements: res.data.movements,
          isSaving: false,
        })
      } else {
        set({ isSaving: false })
      }
      return { ok: res.ok, error: res.error }
    } catch (e: any) {
      set({ isSaving: false })
      return { ok: false, error: e?.message || 'Lỗi điều chỉnh kho' }
    }
  },

  updateSettings: async (newSettings: Partial<GarageSettings>) => {
    try {
      const repo = getGarageRepository()
      const updated = await repo.updateSettings(newSettings)
      set({ settings: updated })
    } catch (e) {
      console.error('[GarageStore] Lỗi cập nhật cài đặt:', e)
    }
  },

  resetData: async () => {
    try {
      const repo = getGarageRepository()
      const bundle = await repo.resetData()
      set({
        vehicles: bundle.vehicles,
        tickets: bundle.tickets,
        parts: bundle.parts,
        movements: bundle.movements,
        settings: bundle.settings,
        isAdmin: true,
      })
    } catch (e) {
      console.error('[GarageStore] Lỗi reset dữ liệu:', e)
    }
  },

  getVehicleOverviewList: (): VehicleOverview[] => {
    const { vehicles, tickets, settings } = get()
    // Vercel React Best Practices `js-index-maps`: Pre-indexing tickets by vehicleId (O(N) thay vì O(N*M))
    const ticketsByVehicle = new Map<string, WarrantyTicket[]>()
    for (const t of tickets) {
      const arr = ticketsByVehicle.get(t.vehicleId)
      if (arr) {
        arr.push(t)
      } else {
        ticketsByVehicle.set(t.vehicleId, [t])
      }
    }

    return vehicles.map((v) => {
      const vTickets = ticketsByVehicle.get(v.id) || []
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
  },

  getVehicleOverviewById: (id: string): VehicleOverview | undefined => {
    const { vehicles, tickets, settings } = get()
    const norm = normalizePlate(id)
    const v = vehicles.find((item) => item.id === id || item.plateNormalized === norm)
    if (!v) return undefined

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
  },

  lookupWarranty: (plate: string): WarrantyLookupResult | null => {
    const norm = normalizePlate(plate)
    if (norm.length < 5) return null

    const { vehicles, tickets, settings } = get()
    const vehicle = vehicles.find((v) => v.plateNormalized === norm)
    if (!vehicle) return null

    const vTickets = tickets
      .filter((t) => t.vehicleId === vehicle.id)
      .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn))

    let maxExpiresOn = ''
    let totalItems = 0
    let activeItemsCount = 0
    let expiredItemsCount = 0
    let unlimitedItemsCount = 0

    const mappedTickets = vTickets.map((t) => ({
      id: t.id,
      activatedOn: t.activatedOn,
      expiresOn: t.expiresOn,
      note: t.note,
      items: t.items.map((it) => {
        totalItems += 1
        const wMonths = typeof it.warrantyMonths === 'number' ? it.warrantyMonths : 0
        const itExpires = (it.expiresOn || '').trim()

        let itemStatus: ItemWarrantyStatus = 'unlimited'
        let itemDaysLeft: number | undefined = undefined

        if (wMonths > 0 && itExpires) {
          itemDaysLeft = daysLeft(itExpires)
          if (itemDaysLeft < 0) {
            itemStatus = 'expired'
            expiredItemsCount += 1
          } else if (itemDaysLeft <= settings.expiringThresholdDays) {
            itemStatus = 'expiring'
            activeItemsCount += 1
          } else {
            itemStatus = 'active'
            activeItemsCount += 1
          }
          if (!maxExpiresOn || itExpires > maxExpiresOn) {
            maxExpiresOn = itExpires
          }
        } else {
          itemStatus = 'unlimited'
          unlimitedItemsCount += 1
        }

        return {
          id: it.id,
          name: it.partName,
          quantity: it.quantity,
          warrantyMonths: wMonths,
          activatedOn: it.activatedOn || t.activatedOn,
          expiresOn: itExpires,
          status: itemStatus,
          daysLeft: itemDaysLeft,
        }
      }),
    }))

    const days = maxExpiresOn ? daysLeft(maxExpiresOn) : 0
    const status = maxExpiresOn ? getStatus(days, settings.expiringThresholdDays) : 'active'

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
      expiresOn: maxExpiresOn,
      status,
      daysLeft: days,
      totalVisits: vTickets.length,
      totalItems,
      activeItemsCount,
      expiredItemsCount,
      unlimitedItemsCount,
      tickets: mappedTickets,
    }
  },

  getKpis: () => {
    const overviewList = get().getVehicleOverviewList()
    const activeVehicles = overviewList.filter((v) => v.status === 'active' || v.status === 'expiring').length
    const expiringVehicles = overviewList.filter((v) => v.status === 'expiring').length
    const lowStockParts = get().parts.filter((p) => p.isActive && p.stock <= get().settings.lowStockThreshold).length

    const currentYearMonth = todayVN().slice(0, 7) // YYYY-MM
    const ticketsThisMonth = get().tickets.filter((t) => t.activatedOn.startsWith(currentYearMonth)).length

    return {
      activeVehicles,
      expiringVehicles,
      lowStockParts,
      ticketsThisMonth,
    }
  },
}))

/**
 * Provider tương thích ngược với layout.tsx.
 * Tự động trigger khởi tạo store trên Client.
 */
export function GarageStoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useGarageStore.getState().init()
  }, [])

  return <>{children}</>
}
