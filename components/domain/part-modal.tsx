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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="force-light w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {initialPart ? 'Chỉnh Sửa Phụ Tùng' : 'Thêm Phụ Tùng Vào Kho'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                MÃ SKU / MÃ PHỤ TÙNG *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: MOTUL-300V"
                disabled={Boolean(initialPart)}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white font-mono text-sm uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                DANH MỤC
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              TÊN PHỤ TÙNG *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Dầu nhớt Motul 300V 5W-40 2L"
              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                BẢO HÀNH (THÁNG)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ĐƠN GIÁ (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>

            {!initialPart && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  TỒN KHO BAN ĐẦU
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                  required
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
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
