export type WarrantyStatus = 'active' | 'expiring' | 'expired'

export interface Vehicle {
  id: string
  plate: string
  plateNormalized: string
  plateColor: 'white' | 'yellow'
  model: string
  ownerName: string
  ownerPhone: string
  odo: number
  createdAt: string
  updatedAt: string
}

export interface TicketItem {
  id: string
  ticketId: string
  partId: string | null
  partName: string
  partSku: string
  serial?: string
  quantity: number
  warrantyMonths: number
  expiresOn: string
}

export interface WarrantyTicket {
  id: string
  vehicleId: string
  odo: number
  activatedOn: string
  expiresOn: string
  note?: string
  items: TicketItem[]
  createdAt: string
  updatedAt: string
}

export interface Part {
  id: string
  sku: string
  name: string
  category: string
  warrantyMonths: number
  price: number
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type StockReason = 'initial' | 'import' | 'export' | 'adjust' | 'ticket_use' | 'ticket_revert'

export interface StockMovement {
  id: number
  partId: string
  partName: string
  partSku: string
  delta: number
  stockAfter: number
  reason: StockReason
  ticketId?: string
  note?: string
  createdAt: string
}

export interface GarageSettings {
  id: number
  name: string
  hotline: string
  address: string
  mapsUrl: string
  expiringThresholdDays: number
  lowStockThreshold: number
}

export interface VehicleOverview extends Vehicle {
  expiresOn: string
  lastActivatedOn: string
  ticketCount: number
  itemCount: number
  status: WarrantyStatus
  daysLeft: number
}

export interface WarrantyLookupResult {
  plate: string
  plateNormalized: string
  plateColor: 'white' | 'yellow'
  model: string
  ownerName: string
  ownerPhoneMasked: string
  ownerPhoneFull?: string
  odo: number
  expiresOn: string
  status: WarrantyStatus
  daysLeft: number
  tickets: {
    id: string
    activatedOn: string
    expiresOn: string
    odo: number
    note?: string
    items: {
      name: string
      serial?: string
      quantity: number
      warrantyMonths: number
      expiresOn: string
    }[]
  }[]
}
