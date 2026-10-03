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
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Cài Đặt Hệ Thống Gara
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Thông tin liên hệ hiển thị trên thẻ bảo hành của khách và các ngưỡng cảnh báo xưởng
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Khối 1: Thông tin thương hiệu */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Building className="w-4 h-4 text-primary" />
            <span>1. Thông tin thương hiệu & liên hệ khách</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                TÊN GARA / TRUNG TÂM CHĂM SÓC XE *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="VD: Gara Auto Care"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                SỐ ĐIỆN THOẠI HOTLINE *
              </label>
              <input
                type="tel"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                required
                placeholder="VD: 0901 234 567"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              ĐỊA CHỈ XƯỞNG
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 88 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội"
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              LINK GOOGLE MAPS DẪN ĐƯỜNG
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Khối 2: Cấu hình ngưỡng cảnh báo */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>2. Cấu hình ngưỡng cảnh báo xưởng</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                NGƯỠNG BÁO XE SẮP HẾT HẠN (NGÀY)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={expiringThresholdDays}
                onChange={(e) => setExpiringThresholdDays(Number(e.target.value))}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Xe còn dưới số ngày này sẽ được tô màu cảnh báo ở Dashboard và danh sách xe.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                NGƯỠNG CẢNH BÁO TỒN KHO THẤP
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Phụ tùng có tồn kho ≤ ngưỡng này sẽ kích hoạt thông báo cảnh báo kho.
              </span>
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="touch-target inline-flex items-center gap-2 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </form>

      {/* Khối Danger Zone / Reset Demo */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Khu Vực Quản Trị & Thử Nghiệm
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="font-semibold text-sm text-foreground">
              Khôi phục dữ liệu demo ban đầu
            </div>
            <p className="text-xs text-muted-foreground">
              Làm mới toàn bộ xe, phiếu và phụ tùng về trạng thái seed data ban đầu
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="touch-target inline-flex items-center gap-1.5 px-4 rounded-xl border border-border hover:bg-muted text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi Phục Dữ Liệu</span>
          </button>
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-foreground">Phiên làm việc Quản trị</div>
            <p className="text-xs text-muted-foreground font-mono">
              Tài khoản: chu-xuong@example.com
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="touch-target inline-flex items-center gap-1.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>
      </div>
    </div>
  )
}
