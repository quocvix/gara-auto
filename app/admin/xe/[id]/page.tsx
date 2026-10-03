'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatDateVN, formatOdo, formatVND } from '@/lib/format'
import { LicensePlate } from '@/components/domain/license-plate'
import { StatusBadge } from '@/components/domain/status-badge'
import { WarrantyProgress } from '@/components/domain/warranty-progress'
import { useTicketModal } from '@/components/domain/ticket-modal'
import {
  ArrowLeft,
  Plus,
  QrCode,
  ExternalLink,
  Car,
  User,
  Phone,
  Gauge,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''

  const { getVehicleOverviewById, tickets, deleteTicket } = useGarageStore()
  const { openTicketModal } = useTicketModal()
  const { trigger } = useHaptic()

  const vehicle = getVehicleOverviewById(id)

  if (!vehicle) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-lg font-bold">Không tìm thấy hồ sơ xe này</h3>
        <button
          type="button"
          onClick={() => router.push('/admin/xe')}
          className="text-xs text-primary underline"
        >
          Quay lại danh sách xe
        </button>
      </div>
    )
  }

  const vTickets = tickets
    .filter((t) => t.vehicleId === vehicle.id)
    .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn))

  const handleCreateNewTicketForThisVehicle = () => {
    openTicketModal({
      vehicle: {
        plate: vehicle.plate,
        plateColor: vehicle.plateColor,
        model: vehicle.model,
        ownerName: vehicle.ownerName,
        ownerPhone: vehicle.ownerPhone,
        odo: vehicle.odo,
      },
      odo: vehicle.odo,
    })
  }

  const handleDeleteTicket = (ticketId: string) => {
    const restore = window.confirm(
      'Xác nhận xóa phiếu bảo hành này?\n\nBấm OK để xóa và HOÀN LẠI TỒN KHO cho các phụ tùng trong phiếu.',
    )
    if (restore) {
      trigger('warning')
      deleteTicket(ticketId, true)
      toast.success('Đã xóa phiếu bảo hành và hoàn lại kho!')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/xe')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách xe</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`/tra-cuu/${vehicle.plateNormalized}`}
            target="_blank"
            rel="noreferrer"
            className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
          >
            <span>Xem như khách</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => router.push(`/admin/xe/${vehicle.id}/qr`)}
            className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-emerald-400 hover:bg-muted"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>In Tem QR</span>
          </button>
        </div>
      </div>

      {/* THẺ TỔNG QUAN PHƯƠNG TIỆN */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <LicensePlate plate={vehicle.plate} color={vehicle.plateColor} size="md" />
            <h2 className="text-xl font-extrabold text-foreground">{vehicle.model}</h2>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <StatusBadge status={vehicle.status} days={vehicle.daysLeft} showDays />
            <span className="text-xs text-muted-foreground">
              {vTickets.length} phiếu bảo dưỡng đã kích hoạt
            </span>
          </div>
        </div>

        {/* Thông số xe */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground uppercase font-semibold">Chủ Xe</span>
            <div className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{vehicle.ownerName || 'Chưa đăng ký'}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase font-semibold">Số Điện Thoại</span>
            <div className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {vehicle.ownerPhone ? (
                <a href={`tel:${vehicle.ownerPhone}`} className="hover:underline text-emerald-400">
                  {vehicle.ownerPhone}
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase font-semibold">ODO Hiện Tại</span>
            <div className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1.5 font-mono">
              <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{formatOdo(vehicle.odo)} km</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground uppercase font-semibold">Hạn Dài Nhất</span>
            <div className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{vehicle.expiresOn ? formatDateVN(vehicle.expiresOn) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ */}
        {vehicle.expiresOn && (
          <WarrantyProgress
            activatedOn={vehicle.lastActivatedOn}
            expiresOn={vehicle.expiresOn}
            status={vehicle.status}
            daysLeft={vehicle.daysLeft}
          />
        )}

        {/* Action nhanh */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleCreateNewTicketForThisVehicle}
            className="touch-target inline-flex items-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo Phiếu Mới Cho Xe Này</span>
          </button>
        </div>
      </div>

      {/* LỊCH SỬ CÁC PHIẾU BẢO HÀNH */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Lịch Sử Phiếu Bảo Hành ({vTickets.length})
        </h3>

        {vTickets.length > 0 ? (
          <div className="space-y-4">
            {vTickets.map((t, idx) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4"
              >
                {/* Header phiếu */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>Phiếu Đợt {vTickets.length - idx}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                        Ngày {formatDateVN(t.activatedOn)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      ODO: {formatOdo(t.odo)} km • Hạn đến: {formatDateVN(t.expiresOn)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        openTicketModal({
                          ticketId: t.id,
                          vehicle,
                          odo: t.odo,
                          note: t.note,
                          items: t.items.map((it) => ({
                            partId: it.partId || '',
                            quantity: it.quantity,
                            serial: it.serial,
                          })),
                        })
                      }
                      className="p-2 rounded-lg border border-border hover:bg-muted text-amber-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa phiếu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-2 rounded-lg border border-border hover:bg-rose-500/10 text-rose-400"
                      title="Xóa phiếu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Các phụ tùng trong phiếu */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Phụ tùng lắp đặt:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{item.partName}</div>
                          <div className="text-muted-foreground font-mono text-[11px] mt-0.5">
                            SKU: {item.partSku} • {item.warrantyMonths}T • Hạn: {formatDateVN(item.expiresOn)}
                          </div>
                          {item.serial && (
                            <div className="text-primary font-mono text-[11px]">
                              Seri: {item.serial}
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-1 rounded bg-muted font-bold font-mono">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {t.note && (
                  <div className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    Ghi chú: {t.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
            Xe này chưa có phiếu bảo hành nào.
          </div>
        )}
      </div>
    </div>
  )
}
