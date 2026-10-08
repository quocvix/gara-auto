'use client'

import React, { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatVND } from '@/lib/format'
import { QtyStepper } from '@/components/domain/qty-stepper'
import { PartModal } from '@/components/domain/part-modal'
import { exportPartsToExcel } from '@/lib/excel-export'
import { Part } from '@/types/garage'
import {
  Package,
  Plus,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  Edit,
  Trash2,
  History,
  Wrench,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

function InventoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { parts, adjustStock, deletePart, settings } = useGarageStore()
  const { trigger } = useHaptic()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterLowStock, setFilterLowStock] = useState(searchParams.get('filter') === 'low')
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Danh mục duy nhất có trong kho
  const categories = useMemo(() => {
    const set = new Set<string>()
    parts.forEach((p) => {
      if (p.category && p.isActive) set.add(p.category)
    })
    return Array.from(set)
  }, [parts])

  // Lọc
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      if (!p.isActive) return false

      if (filterLowStock && p.stock > settings.lowStockThreshold) {
        return false
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = p.name.toLowerCase().includes(q)
        const matchSku = p.sku.toLowerCase().includes(q)
        return matchName || matchSku
      }

      return true
    })
  }, [parts, filterLowStock, selectedCategory, searchQuery, settings.lowStockThreshold])

  const handleStockDelta = (partId: string, delta: number) => {
    const reason = delta > 0 ? 'import' : 'export'
    const note = delta > 0 ? 'Nhập kho nhanh' : 'Xuất kho nhanh'
    const res = adjustStock(partId, delta, reason, note)
    if (!res.ok) {
      toast.error(res.error || 'Lỗi cập nhật kho')
      trigger('error')
    } else {
      toast.success(
        delta > 0
          ? `Đã nhập +${delta} vào tồn kho`
          : `Đã xuất ${delta} khỏi tồn kho`,
      )
    }
  }

  const handleEdit = (part: Part) => {
    setEditingPart(part)
    setIsPartModalOpen(true)
  }

  const handleDelete = (part: Part) => {
    const confirm = window.confirm(`Xác nhận xóa phụ tùng "${part.name}" khỏi kho đang bán?`)
    if (confirm) {
      trigger('warning')
      deletePart(part.id)
      toast.success(`Đã xóa phụ tùng ${part.name}`)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportPartsToExcel(filteredParts)
      toast.success('Đã xuất file Excel kho phụ tùng thành công!')
    } catch {
      toast.error('Lỗi khi xuất file Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Kho Phụ Tùng & Linh Kiện ({parts.filter((p) => p.isActive).length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý xuất nhập tồn, giá bán và thời hạn bảo hành của từng phụ tùng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <a
            href="/admin/kho/lich-su"
            className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Lịch Sử Kho</span>
          </a>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredParts.length === 0}
            className="flex-1 sm:flex-initial h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPart(null)
              setIsPartModalOpen(true)
            }}
            className="w-full sm:w-auto h-10 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Phụ Tùng</span>
          </button>
        </div>
      </div>

      {/* Tìm Kiếm & Bộ Lọc */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên phụ tùng hoặc mã SKU..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs placeholder:text-slate-400"
          />
        </div>

        {/* Filter Chips cuộn ngang với lề chuẩn R6 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setFilterLowStock(false)
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all' && !filterLowStock
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>

          <button
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              filterLowStock
                ? 'bg-rose-50 text-rose-700 border border-rose-300 font-bold shadow-2xs'
                : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sắp hết (≤ {settings.lowStockThreshold})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat)
                setFilterLowStock(false)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat && !filterLowStock
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH PHỤ TÙNG (Cards trên Mobile, DataTable trên Desktop) */}
      {filteredParts.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredParts.map((part) => {
              const isLow = part.stock <= settings.lowStockThreshold

              return (
                <div
                  key={part.id}
                  className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-3 transition-colors ${
                    isLow ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600 border border-slate-200/60 font-semibold">
                          {part.sku}
                        </span>
                        {isLow && (
                          <span className="text-2xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            Sắp hết
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{part.name}</h4>
                      <div className="text-xs text-slate-500">
                        {part.category} • BH {part.warrantyMonths} tháng
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 font-mono">
                        {formatVND(part.price)}
                      </div>
                    </div>
                  </div>

                  {/* Tồn kho & Stepper */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-slate-400">Tồn hiện tại: </span>
                      <strong className={`font-mono ${isLow ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {part.stock} món
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <QtyStepper
                        value={part.stock}
                        onCommitDelta={(delta) => handleStockDelta(part.id, delta)}
                      />

                      <button
                        type="button"
                        onClick={() => handleEdit(part)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                        title="Sửa thông tin"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(part)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                        title="Xóa phụ tùng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop DataTable */}
          <div className="hidden lg:block rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold tracking-wider text-2xs">
                <tr>
                  <th className="py-3.5 px-4">Mã SKU</th>
                  <th className="py-3.5 px-4">Tên Phụ Tùng</th>
                  <th className="py-3.5 px-4">Danh Mục</th>
                  <th className="py-3.5 px-4 text-center">Bảo Hành</th>
                  <th className="py-3.5 px-4 text-right">Đơn Giá</th>
                  <th className="py-3.5 px-4 text-center">Điều Chỉnh Tồn Kho</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.map((part) => {
                  const isLow = part.stock <= settings.lowStockThreshold

                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isLow ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {part.sku}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{part.name}</span>
                          {isLow && (
                            <span className="text-2xs px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                              Cảnh báo kho
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{part.category}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {part.warrantyMonths} tháng
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatVND(part.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <QtyStepper
                          value={part.stock}
                          onCommitDelta={(delta) => handleStockDelta(part.id, delta)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(part)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(part)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 shadow-2xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-sm text-slate-700">Không tìm thấy phụ tùng phù hợp</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </div>
      )}

      {/* PartModal thêm/sửa */}
      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        initialPart={editingPart}
      />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Đang tải dữ liệu kho phụ tùng...
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  )
}
