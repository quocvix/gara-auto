'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatDateVN } from '@/lib/format'
import { useHaptic } from '@/hooks/use-haptic'
import {
  ArrowLeft,
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  X,
  Clock,
  Package,
  Wrench,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react'

// Vercel React Best Practices `server-hoist-static-io` & `rendering-hoist-jsx`
const reasonLabels: Record<
  string,
  {
    label: string
    shortLabel: string
    badge: string
    iconBg: string
    iconColor: string
    icon: React.ElementType
  }
> = {
  import: {
    label: 'Nhập kho (+)',
    shortLabel: 'Nhập kho',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 border border-emerald-200/80',
    iconColor: 'text-emerald-600',
    icon: ArrowUpRight,
  },
  export: {
    label: 'Xuất kho (-)',
    shortLabel: 'Xuất kho',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-50 border border-rose-200/80',
    iconColor: 'text-rose-600',
    icon: ArrowDownRight,
  },
  ticket_use: {
    label: 'Dùng phiếu BH (-)',
    shortLabel: 'Phiếu BH',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 border border-blue-200/80',
    iconColor: 'text-blue-600',
    icon: Wrench,
  },
  ticket_revert: {
    label: 'Hoàn từ phiếu BH (+)',
    shortLabel: 'Hoàn phiếu',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-50 border border-teal-200/80',
    iconColor: 'text-teal-600',
    icon: RefreshCw,
  },
  adjust: {
    label: 'Điều chỉnh kiểm kê',
    shortLabel: 'Kiểm kê',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 border border-amber-200/80',
    iconColor: 'text-amber-600',
    icon: RefreshCw,
  },
  initial: {
    label: 'Khởi tạo ban đầu',
    shortLabel: 'Ban đầu',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 border border-slate-200/80',
    iconColor: 'text-slate-600',
    icon: Package,
  },
}

export default function StockMovementsPage() {
  const router = useRouter()
  const { movements } = useGarageStore()
  const { trigger } = useHaptic()

  const [searchQuery, setSearchQuery] = useState('')
  const [reasonFilter, setReasonFilter] = useState<string>('all')
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Khóa scroll body khi mở modal bộ lọc
  useEffect(() => {
    if (!isFilterSheetOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isFilterSheetOpen])

  // Thống kê nhanh 3 chỉ số KPI
  const stats = useMemo(() => {
    let totalInQty = 0
    let totalOutQty = 0

    movements.forEach((m) => {
      if (m.delta > 0) {
        totalInQty += m.delta
      } else if (m.delta < 0) {
        totalOutQty += Math.abs(m.delta)
      }
    })

    return {
      totalTransactions: movements.length,
      totalInQty,
      totalOutQty,
    }
  }, [movements])

  // Đếm số lượng theo từng lý do
  const reasonCounts = useMemo(() => {
    const counts: Record<string, number> = { all: movements.length }
    movements.forEach((m) => {
      counts[m.reason] = (counts[m.reason] || 0) + 1
    })
    return counts
  }, [movements])

  // Lọc danh sách biến động
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (reasonFilter !== 'all' && m.reason !== reasonFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = m.partName.toLowerCase().includes(q)
        const matchNote = (m.note || '').toLowerCase().includes(q)
        return matchName || matchNote
      }
      return true
    })
  }, [movements, reasonFilter, searchQuery])

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              trigger('tap')
              router.push('/admin/kho')
            }}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="Quay lại Kho hàng"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Lịch sử kho
          </h1>
        </div>
      </div>

      {/* 3 Thẻ KPI tóm tắt nhanh */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs">
          <div className="text-slate-400 text-2xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1 truncate">
            <Activity className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">Giao dịch</span>
          </div>
          <div className="font-mono font-black text-slate-900 text-base sm:text-xl">
            {stats.totalTransactions}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs">
          <div className="text-slate-400 text-2xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Đã nhập</span>
          </div>
          <div className="font-mono font-black text-emerald-600 text-base sm:text-xl">
            +{stats.totalInQty}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs">
          <div className="text-slate-400 text-2xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1 truncate">
            <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="truncate">Đã xuất</span>
          </div>
          <div className="font-mono font-black text-rose-600 text-base sm:text-xl">
            -{stats.totalOutQty}
          </div>
        </div>
      </div>

      {/* Sticky Search & Filter Header trên Mobile */}
      <div className="sticky top-0 z-20 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 py-2 bg-slate-100/90 backdrop-blur-md flex items-center gap-2 transition-all">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên phụ tùng, ghi chú..."
            className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200/90 bg-white text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-xs placeholder:text-slate-400 transition-all"
          />
          {searchQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                trigger('tap')
                setSearchQuery('')
              }}
              className="w-7 h-7 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nút kích hoạt bộ lọc Bottom Sheet */}
        <button
          type="button"
          onClick={() => {
            trigger('tap')
            setIsFilterSheetOpen(true)
          }}
          className={`h-11 px-3 sm:px-3.5 rounded-xl border font-bold text-xs inline-flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer shadow-xs ${
            reasonFilter !== 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden xs:inline">
            {reasonFilter === 'all'
              ? 'Lọc lý do'
              : reasonLabels[reasonFilter]?.shortLabel || 'Lọc'}
          </span>
          {reasonFilter !== 'all' && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* DANH SÁCH BIẾN ĐỘNG (DẠNG THẺ ĐỘC LẬP) */}
      {filteredMovements.length > 0 ? (
        <div className="space-y-2.5">
          {filteredMovements.map((m) => {
            const isPositive = m.delta > 0
            const reasonInfo = reasonLabels[m.reason] || {
              label: m.reason,
              shortLabel: m.reason,
              badge: 'bg-slate-100 text-slate-600 border-slate-200',
              iconBg: 'bg-slate-100 border border-slate-200/80',
              iconColor: 'text-slate-600',
              icon: History,
            }
            const IconComponent = reasonInfo.icon
            const timePart = m.createdAt?.includes('T')
              ? m.createdAt.split('T')[1]?.slice(0, 5)
              : ''

            return (
              <div
                key={m.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-sm transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${reasonInfo.iconBg}`}
                    >
                      <IconComponent className={`w-4 h-4 ${reasonInfo.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug truncate"
                          title={m.partName}
                        >
                          {m.partName}
                        </h3>
                        <span
                          className={`text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider font-mono ${reasonInfo.badge}`}
                        >
                          {reasonInfo.label}
                        </span>
                      </div>

                      {m.note && (
                        <div className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 inline-block max-w-full truncate">
                          <span className="font-semibold text-slate-700">Ghi chú:</span>{' '}
                          {m.note}
                        </div>
                      )}

                      <div className="text-3xs text-slate-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatDateVN(m.createdAt)}</span>
                        {timePart && <span>• {timePart}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Delta & Stock After */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${m.delta}` : m.delta}
                    </div>
                    <div className="text-3xs sm:text-2xs text-slate-500 font-mono mt-0.5">
                      Tồn sau:{' '}
                      <strong className="text-slate-800 font-bold">
                        {m.stockAfter}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-10 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <div className="font-bold text-base text-slate-800">
            Không tìm thấy biến động phù hợp
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || reasonFilter !== 'all'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc lý do.'
              : 'Khi bạn tạo phiếu bảo hành hoặc điều chỉnh số lượng ở kho, mọi thay đổi sẽ được lưu tại đây.'}
          </p>
          {(searchQuery || reasonFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                trigger('tap')
                setSearchQuery('')
                setReasonFilter('all')
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      )}

      {/* BOTTOM SHEET / MODAL BỘ LỌC LÝ DO TRÊN MOBILE */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => {
              trigger('tap')
              setIsFilterSheetOpen(false)
            }}
          />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/90 z-10 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
            {/* Grab handle trên mobile */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Lọc Lý Do Biến Động
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn một phân loại để thu hẹp kết quả
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  trigger('tap')
                  setIsFilterSheetOpen(false)
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách lựa chọn */}
            <div className="p-3 sm:p-4 space-y-1.5 overflow-y-auto">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => {
                  trigger('tap')
                  setReasonFilter('all')
                  setIsFilterSheetOpen(false)
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                  reasonFilter === 'all'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Tất cả lý do</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {reasonCounts.all || 0}
                  </span>
                  {reasonFilter === 'all' && (
                    <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                  )}
                </div>
              </button>

              {/* Từng lý do */}
              {Object.entries(reasonLabels).map(([key, info]) => {
                const isSelected = reasonFilter === key
                const count = reasonCounts[key] || 0
                const ItemIcon = info.icon

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      trigger('tap')
                      setReasonFilter(key)
                      setIsFilterSheetOpen(false)
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.iconBg}`}
                      >
                        <ItemIcon className={`w-4 h-4 ${info.iconColor}`} />
                      </div>
                      <span className="text-sm">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {count}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer Bottom Sheet */}
            <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-b-2xl">
              {reasonFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    trigger('tap')
                    setReasonFilter('all')
                    setIsFilterSheetOpen(false)
                  }}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  trigger('tap')
                  setIsFilterSheetOpen(false)
                }}
                className="flex-1 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
