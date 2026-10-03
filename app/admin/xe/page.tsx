'use client'

import React, { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { normalizePlate } from '@/lib/plate'
import { formatDateVN, formatOdo } from '@/lib/format'
import { LicensePlate } from '@/components/domain/license-plate'
import { StatusBadge } from '@/components/domain/status-badge'
import { useTicketModal } from '@/components/domain/ticket-modal'
import { exportVehiclesToExcel } from '@/lib/excel-export'
import { VehicleOverview } from '@/types/garage'
import {
  Search,
  Plus,
  FileSpreadsheet,
  MoreVertical,
  QrCode,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  Car,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

type FilterStatus = 'all' | 'active' | 'expiring' | 'expired'

function VehiclesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getVehicleOverviewList, deleteVehicle, tickets } = useGarageStore()
  const { openTicketModal } = useTicketModal()
  const { trigger } = useHaptic()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(
    (searchParams.get('status') as FilterStatus) || 'all',
  )
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const vehicles = getVehicleOverviewList()

  // Lọc theo tìm kiếm và trạng thái
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Lọc trạng thái
      if (statusFilter !== 'all' && v.status !== statusFilter) {
        return false
      }

      // Lọc tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchPlate = v.plate.toLowerCase().includes(q) || v.plateNormalized.includes(normalizePlate(q))
        const matchModel = v.model.toLowerCase().includes(q)
        const matchOwner = (v.ownerName || '').toLowerCase().includes(q)
        const matchPhone = (v.ownerPhone || '').includes(q)
        return matchPlate || matchModel || matchOwner || matchPhone
      }

      return true
    })
  }, [vehicles, statusFilter, searchQuery])

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      await exportVehiclesToExcel(filteredVehicles)
      toast.success('Đã xuất file Excel danh sách xe thành công!')
    } catch (e) {
      toast.error('Lỗi khi xuất file Excel')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = (v: VehicleOverview) => {
    setActiveMenuId(null)
    const restore = window.confirm(
      `Xác nhận xóa xe [${v.plate}]?\n\nBấm OK để xóa và HOÀN LẠI TỒN KHO phụ tùng liên quan.\nBấm Cancel nếu không muốn xóa.`,
    )
    if (restore) {
      trigger('warning')
      deleteVehicle(v.id, true)
      toast.success(`Đã xóa xe [${v.plate}] và hoàn lại tồn kho!`)
    }
  }

  const handleEditLatestTicket = (v: VehicleOverview) => {
    setActiveMenuId(null)
    const vTickets = tickets
      .filter((t) => t.vehicleId === v.id)
      .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn))
    const latest = vTickets[0]

    openTicketModal({
      ticketId: latest?.id,
      vehicle: v,
      odo: latest?.odo || v.odo,
      note: latest?.note,
      items: latest?.items.map((it) => ({
        partId: it.partId || '',
        quantity: it.quantity,
        serial: it.serial,
      })),
    })
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Quản Lý Hồ Sơ Xe ({vehicles.length})
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Danh sách phương tiện, thời hạn bảo hành và lịch sử bảo dưỡng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || filteredVehicles.length === 0}
            className="touch-target inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
            title="Xuất danh sách ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => openTicketModal()}
            className="touch-target inline-flex items-center gap-1.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tạo Phiếu</span>
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc Trạng Thái */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm biển số, dòng xe, chủ xe hoặc SĐT..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
          />
        </div>

        {/* Filter Chips cuộn ngang */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Còn hạn ({vehicles.filter((v) => v.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expiring')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'expiring'
                ? 'bg-amber-400 text-slate-900 font-bold shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Sắp hết hạn ({vehicles.filter((v) => v.status === 'expiring').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'expired'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Hết hạn ({vehicles.filter((v) => v.status === 'expired').length})
          </button>
        </div>
      </div>

      {/* DANH SÁCH XE: THẺ TRÊN MOBILE, BẢNG TRÊN DESKTOP */}
      {filteredVehicles.length > 0 ? (
        <>
          {/* 1. Mobile Cards View (< 1024px) */}
          <div className="lg:hidden space-y-3">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3 relative"
              >
                {/* Header card: Biển số + Menu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                    <StatusBadge status={v.status} days={v.daysLeft} />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === v.id ? null : v.id)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Tùy chọn thao tác"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === v.id && (
                      <div className="absolute right-0 top-10 z-30 w-48 rounded-xl bg-card border border-border shadow-xl p-1.5 space-y-0.5 text-xs animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}`)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>Xem chi tiết & lịch sử</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditLatestTicket(v)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sửa phiếu gần nhất</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>In tem QR dán xe</span>
                        </button>
                        <a
                          href={`/tra-cuu/${v.plateNormalized}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-left font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>Xem như khách</span>
                        </a>
                        <div className="border-t border-border my-1" />
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 text-left font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa hồ sơ xe</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin chính */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Dòng xe:</span>
                    <div className="font-bold text-foreground truncate">{v.model}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chủ xe:</span>
                    <div className="font-bold text-foreground truncate">
                      {v.ownerName || 'Chưa đăng ký'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hạn bảo hành:</span>
                    <div className="font-semibold text-foreground">
                      {v.expiresOn ? formatDateVN(v.expiresOn) : 'Chưa có'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ODO & Phiếu:</span>
                    <div className="font-mono text-muted-foreground">
                      {formatOdo(v.odo)} km • {v.ticketCount} phiếu
                    </div>
                  </div>
                </div>

                {/* Nút hành động trực tiếp */}
                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${v.id}`)}
                    className="touch-target flex-1 h-9 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>Chi Tiết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                    className="touch-target flex-1 h-9 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In Tem QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop DataTable View (>= 1024px) */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Biển Số Xe</th>
                  <th className="py-3.5 px-4">Dòng Xe</th>
                  <th className="py-3.5 px-4">Chủ Xe & SĐT</th>
                  <th className="py-3.5 px-4">ODO (km)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Hạn Bảo Hành</th>
                  <th className="py-3.5 px-4 text-center">Số Phiếu</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{v.model}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{v.ownerName || '—'}</div>
                      <div className="text-muted-foreground font-mono">{v.ownerPhone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{formatOdo(v.odo)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} days={v.daysLeft} showDays />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {v.expiresOn ? formatDateVN(v.expiresOn) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {v.ticketCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}`)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-emerald-400"
                          title="In tem QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditLatestTicket(v)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-amber-400"
                          title="Sửa phiếu"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-rose-400"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <Car className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="font-bold text-base">Không tìm thấy xe phù hợp</div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
          </p>
        </div>
      )}
    </div>
  )
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Đang tải dữ liệu hồ sơ xe...
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  )
}
