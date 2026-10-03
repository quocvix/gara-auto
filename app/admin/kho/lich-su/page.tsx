'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatDateVN } from '@/lib/format'
import { exportMovementsToExcel } from '@/lib/excel-export'
import {
  ArrowLeft,
  History,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'

export default function StockMovementsPage() {
  const router = useRouter()
  const { movements, parts } = useGarageStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [reasonFilter, setReasonFilter] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  const reasonLabels: Record<string, { label: string; badge: string }> = {
    initial: { label: 'Tạo ban đầu', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    import: { label: 'Nhập kho', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    export: { label: 'Xuất kho', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    adjust: { label: 'Điều chỉnh kiểm kê', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    ticket_use: { label: 'Kích hoạt phiếu BH', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    ticket_revert: { label: 'Hoàn lại từ phiếu', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  }

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (reasonFilter !== 'all' && m.reason !== reasonFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = m.partName.toLowerCase().includes(q)
        const matchSku = m.partSku.toLowerCase().includes(q)
        const matchNote = (m.note || '').toLowerCase().includes(q)
        return matchName || matchSku || matchNote
      }
      return true
    })
  }, [movements, reasonFilter, searchQuery])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportMovementsToExcel(filteredMovements)
      toast.success('Đã xuất file Excel lịch sử kho!')
    } catch {
      toast.error('Lỗi khi xuất file Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/kho')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kho phụ tùng</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Lịch Sử Nhập / Xuất Kho ({movements.length})
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Nhật ký biến động tồn kho chi tiết theo từng phiếu và đợt nhập hàng
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || filteredMovements.length === 0}
          className="touch-target inline-flex items-center gap-1.5 px-4 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold shadow-sm transition-all self-start sm:self-auto disabled:opacity-40"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Tìm Kiếm & Lọc Lý Do */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo phụ tùng, mã SKU hoặc biển số xe..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
          />
        </div>

        <div>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Tất cả lý do biến động</option>
            <option value="import">Nhập kho (+)</option>
            <option value="export">Xuất kho (-)</option>
            <option value="ticket_use">Dùng cho phiếu BH (-)</option>
            <option value="ticket_revert">Hoàn lại từ phiếu (+)</option>
            <option value="adjust">Điều chỉnh kiểm kê</option>
            <option value="initial">Khởi tạo ban đầu</option>
          </select>
        </div>
      </div>

      {/* TIMELINE DANH SÁCH BIẾN ĐỘNG */}
      {filteredMovements.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {filteredMovements.map((m) => {
              const isPositive = m.delta > 0
              const reasonInfo = reasonLabels[m.reason] || {
                label: m.reason,
                badge: 'bg-muted text-muted-foreground',
              }

              return (
                <div
                  key={m.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {m.partName}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          ({m.partSku})
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reasonInfo.badge}`}
                        >
                          {reasonInfo.label}
                        </span>
                      </div>

                      {m.note && (
                        <div className="text-xs text-muted-foreground">
                          Ghi chú: <strong className="text-foreground">{m.note}</strong>
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground font-mono">
                        {formatDateVN(m.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div
                        className={`text-base font-extrabold font-mono ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${m.delta}` : m.delta}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Tồn sau: <strong>{m.stockAfter}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <History className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="font-bold text-base">Chưa có lịch sử biến động phù hợp</div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Khi bạn tạo phiếu bảo hành hoặc điều chỉnh số lượng ở kho, mọi thay đổi sẽ được lưu tại đây.
          </p>
        </div>
      )}
    </div>
  )
}
