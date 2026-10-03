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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Tổng Quan Xưởng Dịch Vụ
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Theo dõi trạng thái bảo hành ô tô và kiểm soát tồn kho phụ tùng
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="touch-target inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo Phiếu Bảo Hành</span>
        </button>
      </div>

      {/* LƯỚI KPI 4 THẺ (2x2 Mobile, 4x1 Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => router.push('/admin/xe?status=active')}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Xe Còn Hạn</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {kpis.activeVehicles}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>Đang được bảo hành</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Sắp hết hạn (Alert) */}
        <div
          onClick={() => router.push('/admin/xe?status=expiring')}
          className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Sắp Hết Hạn</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            {kpis.expiringVehicles}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
            <span>≤ {settings.expiringThresholdDays} ngày tới</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Kho thấp */}
        <div
          onClick={() => router.push('/admin/kho?filter=low')}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Kho Sắp Hết</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-rose-400">
            {kpis.lowStockParts}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>≤ {settings.lowStockThreshold} sản phẩm</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Phiếu trong tháng */}
        <div
          onClick={() => router.push('/admin/xe')}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Phiếu Trong Tháng</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-primary">
            {kpis.ticketsThisMonth}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>Lượt bảo dưỡng mới</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* DANH SÁCH XE SẮP HẾT HẠN CẦN GỌI CHĂM SÓC */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              Xe Sắp Hết Hạn Bảo Hành ({expiringVehicles.length})
            </h3>
          </div>
          <a
            href="/admin/xe?status=expiring"
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {expiringVehicles.length > 0 ? (
          <div className="divide-y divide-border">
            {expiringVehicles.map((veh) => (
              <div
                key={veh.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LicensePlate plate={veh.plate} color={veh.plateColor} size="sm" />
                  <div>
                    <div className="font-bold text-sm text-foreground">{veh.model}</div>
                    <div className="text-xs text-muted-foreground">
                      Chủ xe: <strong>{veh.ownerName || 'Chưa đăng ký'}</strong> • Hết hạn:{' '}
                      <span className="text-amber-400 font-semibold">
                        {formatDateVN(veh.expiresOn)} (còn {veh.daysLeft} ngày)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {veh.ownerPhone ? (
                    <a
                      href={`tel:${veh.ownerPhone}`}
                      className="touch-target inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Gọi Khách ({veh.ownerPhone})</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Chưa có SĐT</span>
                  )}

                  <button
                    type="button"
                    onClick={() => router.push(`/admin/xe/${veh.id}`)}
                    className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium"
                    title="Xem chi tiết xe"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            Hiện không có xe nào sắp hết hạn trong {settings.expiringThresholdDays} ngày tới.
          </div>
        )}
      </div>

      {/* CẢNH BÁO PHỤ TÙNG SẮP HẾT HÀNG NẾU CÓ */}
      {lowStockPartsList.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Cảnh Báo Tồn Kho Thấp ({lowStockPartsList.length} phụ tùng)</span>
            </div>
            <a
              href="/admin/kho?filter=low"
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              Vào kho nhập thêm
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lowStockPartsList.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl border border-rose-500/20 bg-card flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    SKU: {p.sku} • {p.category}
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 font-mono font-bold">
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
