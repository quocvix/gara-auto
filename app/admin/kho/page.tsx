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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Kho Phụ Tùng & Linh Kiện ({parts.filter((p) => p.isActive).length})
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Quản lý xuất nhập tồn, giá bán và thời hạn bảo hành của từng phụ tùng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/admin/kho/lich-su"
            className="touch-target inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold shadow-sm transition-all"
          >
            <History className="w-4 h-4 text-primary" />
            <span>Lịch Sử Kho</span>
          </a>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredParts.length === 0}
            className="touch-target inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPart(null)
              setIsPartModalOpen(true)
            }}
            className="touch-target inline-flex items-center gap-1.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Thêm Phụ Tùng</span>
          </button>
        </div>
      </div>

      {/* Tìm Kiếm & Bộ Lọc */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên phụ tùng hoặc mã SKU..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setFilterLowStock(false)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all' && !filterLowStock
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>

          <button
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterLowStock
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'bg-card border border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat && !filterLowStock
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
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
                  className={`p-4 rounded-2xl border bg-card shadow-sm space-y-3 transition-colors ${
                    isLow ? 'border-amber-500/50 bg-amber-500/[0.02]' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                          {part.sku}
                        </span>
                        {isLow && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">
                            Sắp hết
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{part.name}</h4>
                      <div className="text-xs text-muted-foreground">
                        {part.category} • BH {part.warrantyMonths} tháng
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-foreground font-mono">
                        {formatVND(part.price)}
                      </div>
                    </div>
                  </div>

                  {/* Tồn kho & Stepper */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Tồn hiện tại: </span>
                      <strong className={`font-mono ${isLow ? 'text-rose-400 font-bold' : ''}`}>
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
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Sửa thông tin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(part)}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                        title="Xóa phụ tùng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop DataTable */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
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
              <tbody className="divide-y divide-border">
                {filteredParts.map((part) => {
                  const isLow = part.stock <= settings.lowStockThreshold

                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isLow ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {part.sku}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{part.name}</span>
                          {isLow && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">
                              Cảnh báo kho
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{part.category}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {part.warrantyMonths} tháng
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
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
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(part)}
                            className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-rose-400"
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
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <Package className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="font-bold text-base">Không tìm thấy phụ tùng phù hợp</div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
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
