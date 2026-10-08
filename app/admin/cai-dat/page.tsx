'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import {
  Settings,
  Save,
  RotateCcw,
  LogOut,
  Building,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

export default function GarageSettingsPage() {
  const router = useRouter()
  const { settings, updateSettings, resetData, logoutAdmin } = useGarageStore()
  const { trigger } = useHaptic()

  const [name, setName] = useState(settings.name)
  const [hotline, setHotline] = useState(settings.hotline)
  const [address, setAddress] = useState(settings.address)
  const [mapsUrl, setMapsUrl] = useState(settings.mapsUrl)
  const [expiringThresholdDays, setExpiringThresholdDays] = useState(
    settings.expiringThresholdDays,
  )
  const [lowStockThreshold, setLowStockThreshold] = useState(
    settings.lowStockThreshold,
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    trigger('success')
    updateSettings({
      name: name.trim(),
      hotline: hotline.trim(),
      address: address.trim(),
      mapsUrl: mapsUrl.trim(),
      expiringThresholdDays: Number(expiringThresholdDays),
      lowStockThreshold: Number(lowStockThreshold),
    })
    toast.success('Đã lưu cấu hình gara thành công!')
  }

  const handleResetData = () => {
    const ok = window.confirm(
      'Khôi phục dữ liệu demo ban đầu (4 xe mẫu, 8 phụ tùng, lịch sử mẫu)?\nMọi dữ liệu bạn vừa nhập thêm sẽ được làm mới.',
    )
    if (ok) {
      trigger('warning')
      resetData()
      setName('GARA AUTO CARE')
      setHotline('0901 234 567')
      setAddress('Số 88 Đường Giải Phóng, Phường Giáp Bát, Hoàng Mai, Hà Nội')
      setMapsUrl('https://maps.google.com/?q=Gara+Auto+Care')
      setExpiringThresholdDays(30)
      setLowStockThreshold(3)
      toast.success('Đã khôi phục dữ liệu mẫu ban đầu!')
    }
  }

  const handleLogout = () => {
    trigger('tap')
    logoutAdmin()
    toast.info('Đã đăng xuất khỏi tài khoản Quản trị')
    router.push('/login')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Cài Đặt Hệ Thống Gara
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Thông tin liên hệ hiển thị trên thẻ bảo hành của khách và các ngưỡng cảnh báo xưởng
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Khối 1: Thông tin thương hiệu */}
        <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Building className="w-4 h-4 text-blue-600" />
            <span>1. Thông tin thương hiệu & liên hệ khách</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                TÊN GARA / TRUNG TÂM CHĂM SÓC XE *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="VD: Gara Auto Care"
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SỐ ĐIỆN THOẠI HOTLINE *
              </label>
              <input
                type="tel"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                required
                placeholder="VD: 0901 234 567"
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ĐỊA CHỈ XƯỞNG
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 88 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội"
              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              LINK GOOGLE MAPS DẪN ĐƯỜNG
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>
        </div>

        {/* Khối 2: Cấu hình ngưỡng cảnh báo */}
        <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>2. Cấu hình ngưỡng cảnh báo xưởng</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NGƯỠNG BÁO XE SẮP HẾT HẠN (NGÀY)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={expiringThresholdDays}
                onChange={(e) => setExpiringThresholdDays(Number(e.target.value))}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Xe còn dưới số ngày này sẽ được tô màu cảnh báo ở Dashboard và danh sách xe.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NGƯỠNG CẢNH BÁO TỒN KHO THẤP
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                required
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Phụ tùng có tồn kho ≤ ngưỡng này sẽ kích hoạt thông báo cảnh báo kho.
              </span>
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </form>

      {/* Khối Danger Zone / Reset Demo */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Khu Vực Quản Trị & Thử Nghiệm
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="font-semibold text-sm text-slate-900">
              Khôi phục dữ liệu demo ban đầu
            </div>
            <p className="text-xs text-slate-500">
              Làm mới toàn bộ xe, phiếu và phụ tùng về trạng thái seed data ban đầu
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all self-start sm:self-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Khôi Phục Dữ Liệu</span>
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-slate-900">Phiên làm việc Quản trị</div>
            <p className="text-xs text-slate-500 font-mono">
              Tài khoản: chu-xuong@example.com
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>
      </div>
    </div>
  )
}
