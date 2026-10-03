'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { formatPlateDisplay, normalizePlate } from '@/lib/plate'
import { formatDateVN, formatOdo } from '@/lib/format'
import { LicensePlate } from '@/components/domain/license-plate'
import { StatusBadge } from '@/components/domain/status-badge'
import { WarrantyProgress } from '@/components/domain/warranty-progress'
import { MaskedPhone } from '@/components/domain/masked-phone'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  Wrench,
  Phone,
  MapPin,
  Calendar,
  Package,
  ArrowLeft,
  AlertCircle,
  FileText,
  Gauge,
  User,
  ShieldCheck,
} from 'lucide-react'

export default function TraCuuPlatePage() {
  const params = useParams()
  const router = useRouter()
  const rawPlate = (params?.plate as string) || ''
  const plateNorm = normalizePlate(rawPlate)

  const { settings, lookupWarranty, isLoaded } = useGarageStore()
  const data = lookupWarranty(plateNorm)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Màn hình không tìm thấy hồ sơ xe
  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <header className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/tra-cuu')}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Chưa Có Hồ Sơ Bảo Hành</h2>
            <p className="text-sm text-muted-foreground">
              Hệ thống chưa tìm thấy dữ liệu bảo hành cho biển số:
            </p>
            <div className="pt-2">
              <LicensePlate plate={rawPlate} size="md" />
            </div>
            <p className="text-xs text-muted-foreground pt-3">
              Nếu bạn vừa sửa chữa hoặc thay thế phụ tùng, vui lòng liên hệ nhân viên gara để được hỗ trợ kích hoạt.
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-4">
            {settings.hotline && (
              <a
                href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
                className="touch-target w-full h-12 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Gọi Hotline Gara: {settings.hotline}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => router.push('/tra-cuu')}
              className="touch-target w-full h-11 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-sm transition-all"
            >
              Tra Cứu Biển Số Khác
            </button>
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border">
          {settings.name} — {settings.hotline}
        </footer>
      </div>
    )
  }

  // Tìm ngày kích hoạt đầu tiên
  const firstTicket = data.tickets[data.tickets.length - 1]
  const lastTicket = data.tickets[0]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Header Gara */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/tra-cuu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tra cứu khác</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {settings.name}
        </span>

        <div className="flex items-center gap-2">
          {settings.hotline && (
            <a
              href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
              className="touch-target inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-danger/10 text-rose-400 border border-danger/30 text-xs font-bold"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{settings.hotline}</span>
            </a>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Nội dung Thẻ Bảo Hành */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl w-full mx-auto space-y-5 animate-in fade-in duration-300">
        {/* THẺ BẢO HÀNH CHÍNH (WARRANTY PASS) */}
        <div className="rounded-3xl bg-gradient-to-br from-card via-card to-card/90 border-2 border-border shadow-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Watermark Logo mờ */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-foreground">
            <Wrench className="w-56 h-56" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Top Row: Biển số & Badge Trạng thái */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <LicensePlate
                plate={data.plate}
                color={data.plateColor}
                size="lg"
                className="self-start sm:self-auto"
              />
              <div className="self-start sm:self-auto">
                <StatusBadge status={data.status} days={data.daysLeft} showDays />
              </div>
            </div>

            {/* Thông tin Xe & Chủ xe */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/70 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase font-semibold">
                  Dòng Xe
                </div>
                <div className="font-bold text-base text-foreground leading-tight">
                  {data.model}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono pt-1">
                  <Gauge className="w-3.5 h-3.5 text-primary" />
                  <span>ODO: {formatOdo(data.odo)} km</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase font-semibold">
                  Chủ Xe
                </div>
                <div className="font-bold text-base text-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{data.ownerName || 'Chưa đăng ký'}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  <MaskedPhone
                    masked={data.ownerPhoneMasked}
                    full={data.ownerPhoneFull}
                  />
                </div>
              </div>
            </div>

            {/* Thanh Tiến Độ Bảo Hành */}
            <WarrantyProgress
              activatedOn={firstTicket?.activatedOn || ''}
              expiresOn={data.expiresOn}
              status={data.status}
              daysLeft={data.daysLeft}
            />
          </div>
        </div>

        {/* DANH SÁCH CÁC PHIẾU BẢO HÀNH & PHỤ TÙNG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Chi Tiết Phụ Tùng Đã Thay Thế ({data.tickets.reduce((acc, t) => acc + t.items.length, 0)})
            </h3>
            <span className="text-xs text-muted-foreground">
              {data.tickets.length} lần bảo dưỡng
            </span>
          </div>

          <div className="space-y-4">
            {data.tickets.map((ticket, tIdx) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                {/* Header Phiếu */}
                <div className="p-3.5 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="p-1 rounded bg-primary/10 text-primary">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <span>Đợt bảo dưỡng: {formatDateVN(ticket.activatedOn)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-mono">
                    {ticket.odo > 0 && <span>ODO: {formatOdo(ticket.odo)} km</span>}
                    <span>•</span>
                    <span>Hạn: {formatDateVN(ticket.expiresOn)}</span>
                  </div>
                </div>

                {/* Các món phụ tùng trong phiếu */}
                <div className="p-4 divide-y divide-border/60">
                  {ticket.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono font-normal">
                            x{item.quantity}
                          </span>
                        </div>
                        {item.serial && (
                          <div className="text-xs text-muted-foreground font-mono">
                            Mã tem/seri: <strong>{item.serial}</strong>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground font-mono">
                          Bảo hành {item.warrantyMonths} tháng • Hạn đến {formatDateVN(item.expiresOn)}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Chính hãng</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ghi chú đợt này nếu có */}
                {ticket.note && (
                  <div className="px-4 py-2.5 bg-muted/20 border-t border-border/50 text-xs text-muted-foreground italic">
                    Ghi chú kỹ thuật: {ticket.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Action Bar ở Đáy (Chừa Safe Area) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl p-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          {settings.hotline && (
            <a
              href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
              className="touch-target flex-1 h-12 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-danger/25 active:scale-98 transition-all"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Gọi Gara: {settings.hotline}</span>
            </a>
          )}

          {settings.mapsUrl && (
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="touch-target flex-1 h-12 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span>Chỉ Đường</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
