'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatPlateDisplay } from '@/lib/plate'
import { formatDateVN } from '@/lib/format'
import { LicensePlate } from '@/components/domain/license-plate'
import { StatusBadge } from '@/components/domain/status-badge'
import { useTicketModal } from '@/components/domain/ticket-modal'
import {
  Car,
  Clock,
  AlertTriangle,
  FileCheck2,
  Phone,
  ArrowRight,
  Plus,
  Package,
  CheckCircle2,
} from 'lucide-react'
import { useHaptic } from '@/hooks/use-haptic'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { getKpis, getVehicleOverviewList, tickets, parts, settings } = useGarageStore()
  const { openTicketModal } = useTicketModal()
  const { trigger } = useHaptic()

  const kpis = getKpis()
  const allVehicles = getVehicleOverviewList()
  const expiringVehicles = allVehicles.filter((v) => v.status === 'expiring')
  const lowStockPartsList = parts.filter((p) => p.isActive && p.stock <= settings.lowStockThreshold)

  const handleCreate = () => {
    trigger('tap')
    openTicketModal()
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Tổng Quan Xưởng Dịch Vụ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi trạng thái bảo hành ô tô và kiểm soát tồn kho phụ tùng
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="w-full sm:w-auto h-11 sm:h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo Phiếu Bảo Hành</span>
        </button>
      </div>

      {/* LƯỚI KPI 4 THẺ (2x2 Mobile, 4x1 Desktop - Công thức B của skill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Xe Còn Hạn */}
        <div
          onClick={() => router.push('/admin/xe?status=active')}
          className="p-3.5 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer shadow-2xs group flex flex-col justify-between space-y-2.5 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Xe Còn Hạn</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {kpis.activeVehicles}
            </div>
            <div className="text-[11px] sm:text-2xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium truncate">
              <span>Đang được bảo hành</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* KPI 2: Sắp Hết Hạn */}
        <div
          onClick={() => router.push('/admin/xe?status=expiring')}
          className="p-3.5 sm:p-5 rounded-xl border border-amber-200/90 bg-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer shadow-2xs group flex flex-col justify-between space-y-2.5 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Sắp Hết Hạn</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-600">
              {kpis.expiringVehicles}
            </div>
            <div className="text-[11px] sm:text-2xs text-amber-600/80 mt-0.5 flex items-center gap-1 font-medium truncate">
              <span>≤ {settings.expiringThresholdDays} ngày tới</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-amber-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* KPI 3: Kho Sắp Hết */}
        <div
          onClick={() => router.push('/admin/kho?filter=low')}
          className="p-3.5 sm:p-5 rounded-xl border border-rose-200/80 bg-white hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer shadow-2xs group flex flex-col justify-between space-y-2.5 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Kho Sắp Hết</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-600">
              {kpis.lowStockParts}
            </div>
            <div className="text-[11px] sm:text-2xs text-rose-600/80 mt-0.5 flex items-center gap-1 font-medium truncate">
              <span>≤ {settings.lowStockThreshold} sản phẩm</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-rose-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* KPI 4: Phiếu Trong Tháng */}
        <div
          onClick={() => router.push('/admin/xe')}
          className="p-3.5 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer shadow-2xs group flex flex-col justify-between space-y-2.5 sm:space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Phiếu Tháng</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-blue-600">
              {kpis.ticketsThisMonth}
            </div>
            <div className="text-[11px] sm:text-2xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium truncate">
              <span>Đợt bảo dưỡng mới</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH XE SẮP HẾT HẠN CẦN GỌI CHĂM SÓC */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider truncate">
              Xe Sắp Hết Hạn Bảo Hành ({expiringVehicles.length})
            </h2>
          </div>
          <a
            href="/admin/xe?status=expiring"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors shrink-0"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {expiringVehicles.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {expiringVehicles.map((veh) => (
              <div
                key={veh.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="self-start">
                    <LicensePlate plate={veh.plate} color={veh.plateColor} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate">{veh.model}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Chủ xe: <strong className="text-slate-700">{veh.ownerName || 'Chưa đăng ký'}</strong></span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-mono text-[11px]">
                        Hạn: {formatDateVN(veh.expiresOn)} (còn {veh.daysLeft} ngày)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dải nút hành động: trên mobile xếp thành 1 hàng toàn chiều rộng */}
                <div className="flex items-center gap-2 w-full sm:w-auto pt-2 border-t border-slate-100 sm:border-0 sm:pt-0">
                  {veh.ownerPhone ? (
                    <a
                      href={`tel:${veh.ownerPhone}`}
                      className="flex-1 sm:flex-initial h-9 sm:h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-all active:scale-95 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Gọi Khách ({veh.ownerPhone})</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex-1 sm:flex-initial">Chưa có SĐT</span>
                  )}

                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${veh.id}`)}
                    className="h-9 sm:h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    title="Xem chi tiết xe"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Hiện không có xe nào sắp hết hạn trong {settings.expiringThresholdDays} ngày tới.
          </div>
        )}
      </div>

      {/* CẢNH BÁO PHỤ TÙNG SẮP HẾT HÀNG NẾU CÓ */}
      {lowStockPartsList.length > 0 && (
        <div className="rounded-2xl border border-rose-200/90 bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm">
              <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span>Cảnh Báo Tồn Kho Thấp ({lowStockPartsList.length} phụ tùng)</span>
            </div>
            <a
              href="/admin/kho?filter=low"
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold"
            >
              Vào kho nhập thêm
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lowStockPartsList.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-2xs text-slate-500 font-mono mt-0.5">
                    SKU: {p.sku} • {p.category}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs">
                  Còn: {p.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
