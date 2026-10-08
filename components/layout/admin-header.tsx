'use client'

import React from 'react'
import { useGarageStore } from '@/lib/store/garage-store'
import { ThemeToggle } from './theme-toggle'
import { Wrench, Settings, ExternalLink } from 'lucide-react'

export function AdminHeader() {
  const { settings } = useGarageStore()

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        <a href="/admin" className="flex items-center gap-2 min-w-0">
          <img
            src="/logo-duy-auto-remove-bg-v1.png"
            alt={settings.name || "Duy Auto"}
            className="h-8 w-auto object-contain shrink-0"
          />
          <div className="truncate">
            <h1 className="font-extrabold text-xs tracking-tight leading-none text-slate-900 uppercase truncate">
              {settings.name || 'GARA DUY AUTO'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="text-2xs text-slate-400 font-medium">
                Admin Quản Trị
              </span>
            </div>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href="/tra-cuu"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          title="Mở màn tra cứu của khách trong tab mới"
        >
          <span>Khách</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <a
          href="/admin/cai-dat"
          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors"
          title="Cài đặt hệ thống gara"
          aria-label="Cài đặt gara"
        >
          <Settings className="w-4 h-4 text-slate-600" />
        </a>
      </div>
    </header>
  )
}
