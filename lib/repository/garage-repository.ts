import type {
  GarageSettings,
  Part,
  StockMovement,
  StockReason,
  Vehicle,
  WarrantyTicket,
} from '@/types/garage'

export interface SaveTicketInput {
  ticketId?: string
  vehicle: {
    plate: string
    plateColor: 'white' | 'yellow'
    model: string
    ownerName: string
    ownerPhone: string
  }
  items: {
    partId: string
    quantity: number
    warrantyMonths?: number
  }[]
  note?: string
}

export type PartInput = Omit<Part, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }

export interface GarageDataBundle {
  settings: GarageSettings
  vehicles: Vehicle[]
  tickets: WarrantyTicket[]
  parts: Part[]
  movements: StockMovement[]
  isAdmin: boolean
}

export interface IGarageRepository {
  /**
   * Tải toàn bộ dữ liệu ban đầu
   */
  loadInitialData(): Promise<GarageDataBundle>

  /**
   * Cập nhật cài đặt gara
   */
  updateSettings(settings: Partial<GarageSettings>): Promise<GarageSettings>

  /**
   * Lưu phiếu bảo hành (thêm mới hoặc cập nhật)
   */
  saveTicket(input: SaveTicketInput): Promise<{
    ok: boolean
    ticketId?: string
    error?: string
    data?: {
      vehicles: Vehicle[]
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }>

  /**
   * Xóa phiếu bảo hành (tùy chọn hoàn kho)
   */
  deleteTicket(ticketId: string, restoreStock?: boolean): Promise<{
    ok: boolean
    error?: string
    data?: {
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }>

  /**
   * Xóa xe và toàn bộ phiếu liên quan (tùy chọn hoàn kho)
   */
  deleteVehicle(vehicleId: string, restoreStock?: boolean): Promise<{
    ok: boolean
    error?: string
    data?: {
      vehicles: Vehicle[]
      tickets: WarrantyTicket[]
      parts: Part[]
      movements: StockMovement[]
    }
  }>

  /**
   * Lưu phụ tùng (thêm mới hoặc sửa)
   */
  savePart(input: PartInput): Promise<{
    ok: boolean
    error?: string
    part?: Part
    parts?: Part[]
  }>

  /**
   * Xóa phụ tùng (soft-delete isActive = false)
   */
  deletePart(partId: string): Promise<{
    ok: boolean
    error?: string
    parts?: Part[]
  }>

  /**
   * Điều chỉnh tồn kho thủ công (nhập/xuất/kiểm kê)
   */
  adjustStock(
    partId: string,
    delta: number,
    reason?: StockReason,
    note?: string
  ): Promise<{
    ok: boolean
    error?: string
    data?: {
      parts: Part[]
      movements: StockMovement[]
    }
  }>

  /**
   * Đặt lại toàn bộ dữ liệu về giá trị mặc định ban đầu
   */
  resetData(): Promise<GarageDataBundle>

  /**
   * Lưu trạng thái quyền admin
   */
  setAdminRole(isAdmin: boolean): Promise<void>
}
