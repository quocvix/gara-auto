'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdaptiveShell } from '@/components/layout/adaptive-shell'
import { useGarageStore } from '@/lib/store/garage-store'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded, isAdmin, init, authChecked } = useGarageStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!authChecked) return

    if (!isAdmin) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authChecked, isAdmin, router, pathname])

  // Chỉ chặn màn hình khi chưa đọc được trạng thái phiên từ local client (< 10-15ms)
  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100/80 p-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center max-w-xs w-full text-center animate-in fade-in zoom-in-95 duration-150">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="font-bold text-xs text-slate-800">Kiểm tra phiên đăng nhập...</h3>
        </div>
      </div>
    )
  }

  // Nếu không phải admin, giữ màn hình trống trong khi router.replace chuyển hướng
  if (!isAdmin) {
    return null
  }

  // Đã xác thực quyền Admin: Render khung giao diện (AdaptiveShell) ngay lập tức!
  return (
    <AdaptiveShell>
      {!isLoaded ? (
        <div className="space-y-4 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
          <div className="h-7 bg-slate-200/70 rounded-xl w-40 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="h-24 bg-slate-200/60 rounded-2xl border border-slate-200/40" />
            <div className="h-24 bg-slate-200/60 rounded-2xl border border-slate-200/40" />
            <div className="h-24 bg-slate-200/60 rounded-2xl border border-slate-200/40" />
            <div className="h-24 bg-slate-200/60 rounded-2xl border border-slate-200/40" />
          </div>
          <div className="h-72 bg-slate-200/50 rounded-2xl border border-slate-200/40" />
        </div>
      ) : (
        children
      )}
    </AdaptiveShell>
  )
}


