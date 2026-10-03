'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { useTicketModal } from '@/components/domain/ticket-modal'
import {
  LayoutDashboard,
  Car,
  Package,
  History,
  Settings,
  Plus,
  Wrench,
  Phone,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useHaptic } from '@/hooks/use-haptic'

export function Sidebar() {
  const pathname = usePathname()
  const { settings, logoutAdmin } = useGarageStore()
  const { openTicketModal } = useTicketModal()
  const { trigger } = useHaptic()

  const links = [
    {
      label: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      label: 'Hồ sơ xe',
      href: '/admin/xe',
      icon: Car,
      active: pathname.startsWith('/admin/xe'),
    },
    {
      label: 'Kho phụ tùng',
      href: '/admin/kho',
      icon: Package,
      active: pathname === '/admin/kho',
    },
    {
      label: 'Lịch sử kho',
      href: '/admin/kho/lich-su',
      icon: History,
      active: pathname === '/admin/kho/lich-su',
    },
    {
      label: 'Cài đặt gara',
      href: '/admin/cai-dat',
      icon: Settings,
      active: pathname === '/admin/cai-dat',
    },
  ]

  const handleCreate = () => {
    trigger('tap')
    openTicketModal()
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card shrink-0 h-screen sticky top-0">
      {/* Branding */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <a href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight text-foreground uppercase line-clamp-1">
              {settings.name || 'GARA AUTO'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium">
                Admin xưởng
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Button Tạo Phiếu Nổi Bật */}
      <div className="p-4">
        <button
          type="button"
          onClick={handleCreate}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Tạo Phiếu Bảo Hành</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = link.active

          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{link.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border space-y-3 bg-muted/20">
        <a
          href="/tra-cuu"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg bg-card border border-border"
        >
          <span>Trang tra cứu khách</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {settings.hotline && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>Hotline: {settings.hotline}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-[11px] truncate max-w-[130px]">
            chu-xuong@example.com
          </span>
          <button
            type="button"
            onClick={logoutAdmin}
            className="hover:text-rose-400 p-1 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
