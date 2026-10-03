'use client'

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react'
import { useGarageStore } from '@/lib/store/garage-store'
import { normalizePlate, sanitizePlateInput } from '@/lib/plate'
import { formatDateVN, formatVND } from '@/lib/format'
import { addMonthsToDate, todayVN } from '@/lib/warranty'
import { Part, Vehicle } from '@/types/garage'
import {
  X,
  Plus,
  Trash2,
  FileCheck2,
  Car,
  Calendar,
  AlertTriangle,
  QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'
import { PartModal } from './part-modal'
import { LicensePlate } from './license-plate'
import { useRouter, useSearchParams } from 'next/navigation'

interface SelectedItem {
  partId: string
  quantity: number
  serial?: string
}

interface OpenModalParams {
  ticketId?: string
  vehicle?: Partial<Vehicle>
  items?: SelectedItem[]
  odo?: number
  note?: string
}

interface TicketModalContextType {
  openTicketModal: (params?: OpenModalParams) => void
  closeTicketModal: () => void
}

const TicketModalContext = createContext<TicketModalContextType | null>(null)

export function useTicketModal() {
  const context = useContext(TicketModalContext)
  if (!context) {
    throw new Error('useTicketModal must be used within TicketModalProvider')
  }
  return context
}

function DeepLinkHandler({ onTrigger }: { onTrigger: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('tao-phieu') === '1') {
      onTrigger()
    }
  }, [searchParams, onTrigger])
  return null
}

export function TicketModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { vehicles, parts, saveTicket } = useGarageStore()
  const { trigger } = useHaptic()

  const [isOpen, setIsOpen] = useState(false)
  const [ticketId, setTicketId] = useState<string | undefined>(undefined)
  const [plate, setPlate] = useState('')
  const [plateColor, setPlateColor] = useState<'white' | 'yellow'>('white')
  const [model, setModel] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [odo, setOdo] = useState<number>(0)
  const [previousOdo, setPreviousOdo] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [error, setError] = useState('')

  const openTicketModal = (params?: OpenModalParams) => {
    setError('')
    if (params) {
      setTicketId(params.ticketId)
      setPlate(params.vehicle?.plate || '')
      setPlateColor(params.vehicle?.plateColor || 'white')
      setModel(params.vehicle?.model || '')
      setOwnerName(params.vehicle?.ownerName || '')
      setOwnerPhone(params.vehicle?.ownerPhone || '')
      setOdo(params.odo || params.vehicle?.odo || 0)
      setPreviousOdo(params.vehicle?.odo || null)
      setNote(params.note || '')
      setSelectedItems(params.items || [])
    } else {
      setTicketId(undefined)
      setPlate('')
      setPlateColor('white')
      setModel('')
      setOwnerName('')
      setOwnerPhone('')
      setOdo(0)
      setPreviousOdo(null)
      setNote('')
      setSelectedItems([])
    }
    setIsOpen(true)
  }

  const closeTicketModal = () => {
    setIsOpen(false)
  }

  // Tự điền thông tin nếu biển số đã tồn tại khi người dùng gõ / rời ô biển số
  const handlePlateBlur = () => {
    const norm = normalizePlate(plate)
    if (norm.length >= 5) {
      const match = vehicles.find((v) => v.plateNormalized === norm)
      if (match) {
        setPlateColor(match.plateColor)
        setModel((prev) => prev || match.model)
        setOwnerName((prev) => prev || match.ownerName || '')
        setOwnerPhone((prev) => prev || match.ownerPhone || '')
        setPreviousOdo(match.odo)
        if (!odo) setOdo(match.odo)
        toast.info(`Đã tìm thấy xe cũ: ${match.model} (${match.ownerName || 'Chưa rõ tên'})`)
      }
    }
  }

  const addItem = (partId: string) => {
    const existIdx = selectedItems.findIndex((it) => it.partId === partId)
    if (existIdx >= 0) {
      const updated = [...selectedItems]
      updated[existIdx].quantity += 1
      setSelectedItems(updated)
    } else {
      setSelectedItems([...selectedItems, { partId, quantity: 1 }])
    }
    trigger('tap')
  }

  const updateItemQty = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index)
      return
    }
    const updated = [...selectedItems]
    updated[index].quantity = quantity
    setSelectedItems(updated)
  }

  const updateItemSerial = (index: number, serial: string) => {
    const updated = [...selectedItems]
    updated[index].serial = serial
    setSelectedItems(updated)
  }

  const removeItem = (index: number) => {
    const updated = selectedItems.filter((_, idx) => idx !== index)
    setSelectedItems(updated)
    trigger('tap')
  }

  // Tính hạn bảo hành dài nhất
  const today = todayVN()
  let maxWarrantyExpiresOn = today
  for (const item of selectedItems) {
    const part = parts.find((p) => p.id === item.partId)
    if (part) {
      const exp = addMonthsToDate(today, part.warrantyMonths)
      if (exp > maxWarrantyExpiresOn) maxWarrantyExpiresOn = exp
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const norm = normalizePlate(plate)
    if (norm.length < 5) {
      setError('Biển số xe phải có ít nhất 5 ký tự hợp lệ')
      trigger('error')
      return
    }
    if (!model.trim()) {
      setError('Vui lòng nhập dòng xe (VD: Mazda CX-5, Toyota Vios)')
      trigger('error')
      return
    }
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất 1 phụ tùng cần bảo hành')
      trigger('error')
      return
    }

    const res = saveTicket({
      ticketId,
      vehicle: {
        plate: plate.trim().toUpperCase(),
        plateColor,
        model: model.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
      },
      odo: Number(odo) || 0,
      items: selectedItems,
      note: note.trim(),
    })

    if (!res.ok) {
      setError(res.error || 'Có lỗi xảy ra khi lưu phiếu')
      trigger('error')
      return
    }

    trigger('success')
    toast.success(ticketId ? 'Đã cập nhật phiếu bảo hành!' : 'Đã kích hoạt bảo hành thành công!')
    closeTicketModal()

    // Gợi ý in tem QR
    setTimeout(() => {
      const targetPlate = normalizePlate(plate)
      if (confirm(`Kích hoạt thành công xe [${targetPlate}]! Bạn có muốn mở trang In Tem QR dán xe ngay không?`)) {
        router.push(`/admin/xe/${targetPlate}/qr`)
      }
    }, 300)
  }

  return (
    <TicketModalContext.Provider value={{ openTicketModal, closeTicketModal }}>
      <Suspense fallback={null}>
        <DeepLinkHandler onTrigger={() => openTicketModal()} />
      </Suspense>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {ticketId ? 'Chỉnh Sửa Phiếu Bảo Hành' : 'Tạo Phiếu Bảo Hành Mới'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tự động tính hạn dài nhất và cập nhật tồn kho phụ tùng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeTicketModal}
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Area */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              {error && (
                <div className="p-3.5 text-sm rounded-xl bg-danger/10 border border-danger/30 text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* KHỐI 1: THÔNG TIN XE */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-primary" />
                    1. Thông tin phương tiện
                  </span>
                  {plate && (
                    <LicensePlate plate={plate} color={plateColor} size="sm" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      BIỂN SỐ XE *
                    </label>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(sanitizePlateInput(e.target.value))}
                      onBlur={handlePlateBlur}
                      placeholder="VD: 51K-889.99"
                      className="w-full h-11 px-3.5 rounded-lg border border-input bg-background font-mono text-base uppercase font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      MÀU BIỂN SỐ
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 h-11 p-1 bg-background border border-input rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPlateColor('white')}
                        className={`text-xs font-bold rounded flex items-center justify-center transition-all ${
                          plateColor === 'white'
                            ? 'bg-slate-200 text-slate-900 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Trắng
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlateColor('yellow')}
                        className={`text-xs font-bold rounded flex items-center justify-center transition-all ${
                          plateColor === 'yellow'
                            ? 'bg-amber-400 text-slate-900 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Vàng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      DÒNG XE (MODEL) *
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="VD: Mazda CX-5 2.0"
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      CHỦ XE
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Họ tên chủ xe"
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      SỐ ĐIỆN THOẠI
                    </label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="VD: 0988123456"
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      ODO HIỆN TẠI (KM)
                    </label>
                    {previousOdo !== null && (
                      <span className="text-[11px] text-muted-foreground">
                        ODO cũ gần nhất: <strong>{previousOdo.toLocaleString()} km</strong>
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={odo || ''}
                    onChange={(e) => setOdo(Number(e.target.value))}
                    placeholder="VD: 35000"
                    className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {previousOdo !== null && odo > 0 && odo < previousOdo && (
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Lưu ý: ODO nhập nhỏ hơn ODO lịch sử ({previousOdo.toLocaleString()} km)
                    </p>
                  )}
                </div>
              </div>

              {/* KHỐI 2: CHỌN PHỤ TÙNG */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Hạng mục phụ tùng bảo hành ({selectedItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPartModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm phụ tùng mới vào kho
                  </button>
                </div>

                {/* Danh sách phụ tùng đã chọn */}
                {selectedItems.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedItems.map((item, idx) => {
                      const part = parts.find((p) => p.id === item.partId)
                      if (!part) return null

                      const itemExpires = addMonthsToDate(today, part.warrantyMonths)

                      return (
                        <div
                          key={item.partId}
                          className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{part.name}</div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                              <span>SKU: {part.sku}</span>
                              <span>•</span>
                              <span>BH {part.warrantyMonths} tháng</span>
                              <span>•</span>
                              <span>Đến {formatDateVN(itemExpires)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <input
                              type="text"
                              value={item.serial || ''}
                              onChange={(e) => updateItemSerial(idx, e.target.value)}
                              placeholder="Số seri / tem"
                              className="w-28 sm:w-32 h-9 px-2 text-xs font-mono rounded-md border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                            />

                            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateItemQty(idx, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-muted font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQty(idx, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-muted font-bold text-xs text-primary"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-2 text-muted-foreground hover:text-rose-400 rounded-md hover:bg-muted"
                              title="Bỏ món này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-5 text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-card/40">
                    Chưa có phụ tùng nào được chọn. Hãy bấm chọn bên dưới.
                  </div>
                )}

                {/* Kho phụ tùng để chọn */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    CHỌN TỪ KHO PHỤ TÙNG:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {parts
                      .filter((p) => p.isActive)
                      .map((p) => {
                        const isChosen = selectedItems.some((it) => it.partId === p.id)
                        const isOutOfStock = p.stock <= 0

                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => addItem(p.id)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                              isChosen
                                ? 'border-primary/60 bg-primary/10 text-foreground'
                                : 'border-border bg-card hover:bg-muted/70 text-foreground'
                            } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <div className="overflow-hidden">
                              <div className="font-semibold truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {formatVND(p.price)} • BH {p.warrantyMonths}T • Tồn: {p.stock}
                              </div>
                            </div>
                            <span className="shrink-0 p-1 rounded bg-muted">
                              <Plus className="w-3.5 h-3.5 text-primary" />
                            </span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* KHỐI 3: GHI CHÚ */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  GHI CHÚ HỒ SƠ / TÌNH TRẠNG XE
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú về phụ tùng, khuyến cáo lần bảo dưỡng tới..."
                  className="w-full p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* TÓM TẮT THỜI HẠN */}
              {selectedItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-muted-foreground">Thời hạn bảo hành thẻ:</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    Đến ngày {formatDateVN(maxWarrantyExpiresOn)}
                  </span>
                </div>
              )}

              {/* Nút Submit chính dán đáy */}
              <div className="pt-2 sticky bottom-0 bg-card py-2 border-t border-border flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeTicketModal}
                  className="touch-target px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 flex items-center justify-center gap-2 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg active:scale-98 transition-all"
                >
                  <FileCheck2 className="w-5 h-5" />
                  <span>{ticketId ? 'Cập Nhật Phiếu' : 'Kích Hoạt Bảo Hành'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PartModal để thêm phụ tùng nhanh */}
      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onCreatedSuccess={(newSku) => {
          const created = parts.find((p) => p.sku === newSku)
          if (created) addItem(created.id)
        }}
      />
    </TicketModalContext.Provider>
  )
}
