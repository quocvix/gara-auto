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
    initial: { label: 'Tạo ban đầu', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
    import: { label: 'Nhập kho', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    export: { label: 'Xuất kho', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    adjust: { label: 'Điều chỉnh kiểm kê', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    ticket_use: { label: 'Kích hoạt phiếu BH', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    ticket_revert: { label: 'Hoàn lại từ phiếu', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/kho')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Kho phụ tùng</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Lịch Sử Nhập / Xuất Kho ({movements.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Nhật ký biến động tồn kho chi tiết theo từng phiếu và đợt nhập hàng
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || filteredMovements.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all self-start sm:self-auto disabled:opacity-40"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Tìm Kiếm & Lọc Lý Do */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên phụ tùng, mã SKU hoặc ghi chú..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
          />
        </div>

        <div>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredMovements.map((m) => {
              const isPositive = m.delta > 0
              const reasonInfo = reasonLabels[m.reason] || {
                label: m.reason,
                badge: 'bg-slate-100 text-slate-600 border-slate-200',
              }

              return (
                <div
                  key={m.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
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
                        <span className="font-semibold text-sm text-slate-900">
                          {m.partName}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          ({m.partSku})
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${reasonInfo.badge}`}
                        >
                          {reasonInfo.label}
                        </span>
                      </div>

                      {m.note && (
                        <div className="text-xs text-slate-600">
                          Ghi chú: <strong className="text-slate-800">{m.note}</strong>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatDateVN(m.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div
                        className={`text-base font-bold font-mono ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${m.delta}` : m.delta}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Tồn sau: <strong className="text-slate-800">{m.stockAfter}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 bg-white space-y-3">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="font-bold text-base text-slate-800">Chưa có lịch sử biến động phù hợp</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi bạn tạo phiếu bảo hành hoặc điều chỉnh số lượng ở kho, mọi thay đổi sẽ được lưu tại đây.
          </p>
        </div>
      )}
    </div>
  )
}
