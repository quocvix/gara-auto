'use client'

import React, { useState } from 'react'
import { useGarageStore } from '@/lib/store/garage-store'
import { Part } from '@/types/garage'
import { X, Wrench, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

interface PartModalProps {
  isOpen: boolean
  onClose: () => void
  initialPart?: Part | null
  onCreatedSuccess?: (newPartSku: string) => void
}

const COMMON_CATEGORIES = [
  'Dầu & Dung dịch',
  'Đánh lửa',
  'Lọc',
  'Hệ thống phanh',
  'Điện & Ắc quy',
  'Gầm & Giảm xóc',
  'Phụ kiện',
  'Khác',
]

export function PartModal({
  isOpen,
  onClose,
  initialPart,
  onCreatedSuccess,
}: PartModalProps) {
  const { savePart } = useGarageStore()
  const { trigger } = useHaptic()

  const [sku, setSku] = useState(initialPart?.sku || '')
  const [name, setName] = useState(initialPart?.name || '')
  const [category, setCategory] = useState(initialPart?.category || 'Dầu & Dung dịch')
  const [warrantyMonths, setWarrantyMonths] = useState(initialPart?.warrantyMonths || 6)
  const [price, setPrice] = useState(initialPart?.price || 0)
  const [stock, setStock] = useState(initialPart?.stock || 5)
  const [error, setError] = useState('')

  // Sync khi initialPart thay đổi
  React.useEffect(() => {
    if (initialPart) {
      setSku(initialPart.sku)
      setName(initialPart.name)
      setCategory(initialPart.category)
      setWarrantyMonths(initialPart.warrantyMonths)
      setPrice(initialPart.price)
      setStock(initialPart.stock)
    } else {
      setSku('')
      setName('')
      setCategory('Dầu & Dung dịch')
      setWarrantyMonths(6)
      setPrice(0)
      setStock(5)
    }
    setError('')
  }, [initialPart, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!sku.trim()) {
      setError('Vui lòng nhập mã SKU phụ tùng')
      return
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên phụ tùng')
      return
    }

    const res = savePart({
      id: initialPart?.id,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      warrantyMonths: Number(warrantyMonths),
      price: Number(price),
      stock: Number(stock),
      isActive: true,
    })

    if (!res.ok) {
      setError(res.error || 'Có lỗi xảy ra')
      trigger('error')
      return
    }

    trigger('success')
    toast.success(initialPart ? 'Cập nhật phụ tùng thành công!' : 'Đã thêm phụ tùng mới vào kho!')
    onCreatedSuccess?.(sku.trim().toUpperCase())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">
              {initialPart ? 'Chỉnh Sửa Phụ Tùng' : 'Thêm Phụ Tùng Vào Kho'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-danger/10 border border-danger/30 text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                MÃ SKU / MÃ PHỤ TÙNG *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: MOTUL-300V"
                disabled={Boolean(initialPart)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm uppercase focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                DANH MỤC
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              TÊN PHỤ TÙNG *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Dầu nhớt Motul 300V 5W-40 2L"
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                BẢO HÀNH (THÁNG)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                ĐƠN GIÁ (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {!initialPart && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  TỒN KHO BAN ĐẦU
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="touch-target px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="touch-target flex items-center gap-2 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialPart ? 'Lưu Thay Đổi' : 'Tạo Phụ Tùng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
