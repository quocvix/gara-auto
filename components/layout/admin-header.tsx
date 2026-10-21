'use client'

import React from 'react'
import Link from 'next/link'
import { useGarageStore } from '@/lib/store/garage-store'
import { ExternalLink, LogOut } from 'lucide-react'

export function AdminHeader() {
  const settings = useGarageStore((s) => s.settings)
  const logoutAdmin = useGarageStore((s) => s.logoutAdmin)

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          <img
            src="/logo-duy-auto-remove-bg-v1.png"
            alt={settings.name || "Duy Auto"}
            className="h-7 w-auto object-contain shrink-0"
          />
          <div className="truncate">
            <h1 className="font-extrabold text-xs tracking-tight leading-none text-slate-900 uppercase truncate">
              {settings.name || 'DUY AUTO'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse" />
              <span className="text-2xs text-slate-400 font-medium">
                Admin Quản Trị
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/tra-cuu"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-blue-200/90 bg-blue-50/70 text-blue-700 hover:bg-blue-100 transition-all shadow-2xs active:scale-95"
          title="Mở màn hình tra cứu của khách trong tab mới"
        >
          <span>Khách</span>
          <ExternalLink className="w-3 h-3 text-blue-500" />
        </a>
        <button
          type="button"
          onClick={async () => {
            await logoutAdmin()
            window.location.href = '/login'
          }}
          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-2xs active:scale-95"
          title="Đăng xuất"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}

