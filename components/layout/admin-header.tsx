'use client'

import React from 'react'
import { useGarageStore } from '@/lib/store/garage-store'
import { ThemeToggle } from './theme-toggle'
import { Wrench, Settings, ExternalLink } from 'lucide-react'

export function AdminHeader() {
  const { settings } = useGarageStore()

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="/admin" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-foreground uppercase">
              {settings.name || 'GARA AUTO'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-[11px] text-muted-foreground font-medium">
                Admin xưởng
              </span>
            </div>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/tra-cuu"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Mở màn tra cứu của khách trong tab mới"
        >
          <span>Xem trang khách</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <ThemeToggle />

        <a
          href="/admin/cai-dat"
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Cài đặt hệ thống gara"
          aria-label="Cài đặt gara"
        >
          <Settings className="w-4 h-4" />
        </a>
      </div>
    </header>
  )
}
