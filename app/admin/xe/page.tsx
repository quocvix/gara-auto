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
  Phone,
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
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Quản Lý Hồ Sơ Xe ({vehicles.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Danh sách phương tiện, thời hạn bảo hành và lịch sử bảo dưỡng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || filteredVehicles.length === 0}
            className="touch-target inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
            title="Xuất danh sách ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => openTicketModal()}
            className="touch-target inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo Phiếu</span>
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc Trạng Thái */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm biển số, dòng xe, chủ xe hoặc SĐT..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs placeholder:text-slate-400"
          />
        </div>

        {/* Filter Chips cuộn ngang với lề chuẩn R6 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Còn hạn ({vehicles.filter((v) => v.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              statusFilter === 'expiring'
                ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Sắp hết hạn ({vehicles.filter((v) => v.status === 'expiring').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
                className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3 relative"
              >
                {/* Header card: Biển số + Status badge + Menu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                    <StatusBadge status={v.status} days={v.daysLeft} />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === v.id ? null : v.id)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Tùy chọn thao tác"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === v.id && (
                      <div className="absolute right-0 top-10 z-30 w-48 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 space-y-0.5 text-xs animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}`)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Xem chi tiết & lịch sử</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditLatestTicket(v)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-600" />
                          <span>Sửa phiếu gần nhất</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In tem QR dán xe</span>
                        </button>
                        <a
                          href={`/tra-cuu/${v.plateNormalized}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>Xem như khách</span>
                        </a>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-left font-medium cursor-pointer"
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
                    <span className="text-slate-400 text-2xs uppercase">Dòng xe:</span>
                    <div className="font-bold text-slate-900 truncate">{v.model}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs uppercase">Chủ xe:</span>
                    <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                      <span>{v.ownerName || 'Chưa đăng ký'}</span>
                      {v.ownerPhone && (
                        <a
                          href={`tel:${v.ownerPhone}`}
                          className="text-emerald-600 hover:underline inline-flex items-center"
                          title={`Gọi ${v.ownerPhone}`}
                        >
                          <Phone className="w-3 h-3 ml-0.5 fill-current" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs uppercase">Hạn bảo hành:</span>
                    <div className="font-semibold text-slate-800 font-mono">
                      {v.expiresOn ? formatDateVN(v.expiresOn) : 'Chưa có'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-2xs uppercase">ODO & Phiếu:</span>
                    <div className="font-mono text-slate-600">
                      {formatOdo(v.odo)} km • {v.ticketCount} phiếu
                    </div>
                  </div>
                </div>

                {/* Nút hành động trực tiếp */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${v.id}`)}
                    className="flex-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chi Tiết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                    className="flex-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Tem QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop DataTable View (>= 1024px) */}
          <div className="hidden lg:block rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold tracking-wider text-2xs">
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
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{v.model}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{v.ownerName || '—'}</div>
                      <div className="text-slate-400 font-mono text-2xs">{v.ownerPhone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{formatOdo(v.odo)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} days={v.daysLeft} showDays />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {v.expiresOn ? formatDateVN(v.expiresOn) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                      {v.ticketCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}`)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/xe/${v.id}/qr`)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-emerald-600 transition-colors cursor-pointer"
                          title="In tem QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditLatestTicket(v)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-amber-600 transition-colors cursor-pointer"
                          title="Sửa phiếu"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
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
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 shadow-2xs">
          <Car className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-sm text-slate-700">Không tìm thấy xe phù hợp</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
