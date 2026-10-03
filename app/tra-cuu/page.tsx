'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { normalizePlate, sanitizePlateInput } from '@/lib/plate'
import { LicensePlate } from '@/components/domain/license-plate'
import { StatusBadge } from '@/components/domain/status-badge'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Search, Phone, ShieldCheck, Wrench, ArrowRight, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

export default function TraCuuPage() {
  const router = useRouter()
  const { settings, getVehicleOverviewList } = useGarageStore()
  const { trigger } = useHaptic()

  const [inputPlate, setInputPlate] = useState('')
  const vehicles = getVehicleOverviewList()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const norm = normalizePlate(inputPlate)
    if (norm.length < 5) {
      trigger('error')
      toast.error('Vui lòng nhập biển số xe hợp lệ (tối thiểu 5 ký tự)')
      return
    }
    trigger('tap')
    router.push(`/tra-cuu/${norm}`)
  }

  const handleQuickPick = (plateNorm: string) => {
    trigger('tap')
    router.push(`/tra-cuu/${plateNorm}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header Gara Công Khai */}
      <header className="sticky top-0 z-20 bg-card/85 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-foreground">
              {settings.name || 'GARA AUTO CARE'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Cổng Tra Cứu Bảo Hành Điện Tử
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings.hotline && (
            <a
              href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
              className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-rose-400 border border-danger/30 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Gọi Hotline Gara"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>{settings.hotline}</span>
            </a>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl w-full mx-auto">
        <div className="w-full space-y-8 my-auto">
          {/* Hero Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Xác thực linh kiện & dịch vụ chính hãng</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Tra Cứu Thẻ Bảo Hành
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nhập biển số xe của bạn hoặc quét mã QR dán trên kính lái / khung cửa xe để kiểm tra thời hạn và phụ tùng.
            </p>
          </div>

          {/* Ô Nhập Biển Số Lớn */}
          <form
            onSubmit={handleSearch}
            className="p-3 sm:p-4 rounded-2xl bg-card border-2 border-border shadow-xl focus-within:border-primary/70 transition-all space-y-3"
          >
            <div className="relative">
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(sanitizePlateInput(e.target.value))}
                placeholder="VD: 51K-889.99"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="w-full h-14 sm:h-16 px-4 rounded-xl border border-input bg-background font-mono text-xl sm:text-2xl font-bold uppercase text-center tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-inner placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:tracking-normal"
                style={{ fontFamily: 'var(--font-plate), monospace' }}
              />
            </div>

            <button
              type="submit"
              className="touch-target w-full h-12 sm:h-13 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-98 transition-all"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>Tra Cứu Ngay</span>
            </button>
          </form>

          {/* Gợi Ý Các Xe Mẫu Để Thử Nhanh */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                Xe mẫu trong xưởng (Bấm để xem demo):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleQuickPick(v.plateNormalized)}
                  className="p-3 rounded-xl border border-border bg-card/70 hover:bg-card hover:border-primary/40 text-left transition-all flex items-center justify-between group shadow-sm active:scale-98"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                      <StatusBadge status={v.status} days={v.daysLeft} />
                    </div>
                    <div className="text-xs text-muted-foreground font-medium truncate max-w-[190px]">
                      {v.model}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Gara */}
      <footer className="p-4 border-t border-border bg-card/40 text-center text-xs text-muted-foreground space-y-1">
        <p>
          {settings.name} — {settings.address}
        </p>
        <p className="text-[11px] opacity-70">
          Hệ thống bảo hành điện tử chính hãng • Bảo lưu mọi quyền
        </p>
      </footer>
    </div>
  )
}
