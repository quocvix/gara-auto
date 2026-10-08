'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { QRCodeSVG } from 'qrcode.react'
import { formatPlateDisplay } from '@/lib/plate'
import { ArrowLeft, Printer, Wrench, Phone, ShieldCheck } from 'lucide-react'

export default function QrPrintPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''

  const { getVehicleOverviewById, settings } = useGarageStore()
  const vehicle = getVehicleOverviewById(id)
  const [copyCount, setCopyCount] = useState<number>(4) // Mặc định 4 tem

  if (!vehicle) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="font-bold">Không tìm thấy xe</h3>
        <button
          type="button"
          onClick={() => router.push('/admin/xe')}
          className="text-xs text-primary underline"
        >
          Về danh sách
        </button>
      </div>
    )
  }

  // URL tra cứu khi quét QR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gara-auto.vn'
  const qrUrl = `${origin}/tra-cuu/${vehicle.plateNormalized}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Điều Khiển (Ẩn khi in) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => router.push(`/admin/xe/${vehicle.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại hồ sơ xe</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-slate-600">Số lượng tem:</span>
            <select
              value={copyCount}
              onChange={(e) => setCopyCount(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            >
              {[1, 2, 4, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} tem (khổ A4)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>In Tem Ngay</span>
          </button>
        </div>
      </div>

      {/* Hướng Dẫn & Gợi Ý Dán (Ẩn khi in) */}
      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/60 text-xs text-blue-900 space-y-1 print:hidden">
        <p className="font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Quy chuẩn tem dán bảo hành điện tử (Kích thước 60 × 40 mm)
        </p>
        <p className="text-slate-600">
          Tem được thiết kế để in bằng máy in văn phòng thông thường hoặc máy in decal dán kính lái, cột B hoặc sổ bảo dưỡng. Khách hàng dùng camera điện thoại bất kỳ để quét tra cứu.
        </p>
      </div>

      {/* KHU VỰC IN TEM (PRINT AREA) */}
      <div className="print-area p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:bg-white print:p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          {Array.from({ length: copyCount }).map((_, idx) => (
            <div
              key={idx}
              className="w-full max-w-[340px] mx-auto border-2 border-slate-900 rounded-xl p-3 bg-white text-slate-900 shadow-sm flex items-center justify-between gap-3 box-border"
              style={{ minHeight: '135px' }}
            >
              {/* QR Code bên trái */}
              <div className="shrink-0 flex flex-col items-center">
                <QRCodeSVG
                  value={qrUrl}
                  size={92}
                  level="M"
                  marginSize={1}
                />
                <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                  Quét bằng camera
                </span>
              </div>

              {/* Thông tin bên phải */}
              <div className="flex-1 flex flex-col justify-between h-full py-0.5 space-y-1 text-left">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-tight text-blue-800 line-clamp-1">
                    {settings.name || 'GARA AUTO CARE'}
                  </div>
                  <div className="text-[9px] text-slate-600 font-medium">
                    Thẻ Bảo Hành Điện Tử
                  </div>
                </div>

                {/* Biển số nổi bật */}
                <div className="my-1">
                  <div className="inline-block border-[1.5px] border-slate-900 rounded px-2 py-0.5 bg-slate-100 font-mono font-bold text-sm tracking-wider shadow-inner">
                    {formatPlateDisplay(vehicle.plate)}
                  </div>
                </div>

                <div className="text-[8px] text-slate-700 space-y-0.5 font-medium">
                  <div className="truncate">{vehicle.model}</div>
                  {settings.hotline && (
                    <div className="font-mono font-bold text-rose-600">
                      Hotline: {settings.hotline}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
