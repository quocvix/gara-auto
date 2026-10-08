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
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/90 bg-white shrink-0 h-screen sticky top-0 shadow-2xs">
      {/* Branding */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <a href="/admin" className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo-duy-auto-remove-bg-v1.png"
            alt={settings.name || "Duy Auto Logo"}
            className="h-9 w-auto object-contain shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-extrabold text-xs tracking-tight text-slate-900 uppercase truncate">
              {settings.name || 'GARA DUY AUTO'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-2xs text-slate-400 font-medium">
                Admin Quản Trị
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Button Tạo Phiếu Nổi Bật */}
      <div className="p-3.5">
        <button
          type="button"
          onClick={handleCreate}
          className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo Phiếu Bảo Hành</span>
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-100 space-y-2.5 bg-slate-50/60">
        <a
          href="/tra-cuu"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-2xs font-medium text-slate-600 hover:text-blue-700 transition-colors p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
        >
          <span>Trang tra cứu khách</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {settings.hotline && (
          <div className="flex items-center gap-1.5 text-2xs text-slate-500 font-mono px-1">
            <Phone className="w-3 h-3 text-blue-500 shrink-0" />
            <span>Hotline: {settings.hotline}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-2xs text-slate-500 px-1">
          <span className="font-mono text-2xs text-slate-400 truncate max-w-[130px]">
            admin@duyauto.vn
          </span>
          <button
            type="button"
            onClick={logoutAdmin}
            className="hover:text-rose-600 p-1 transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
          </button>
        </div>
      </div>
    </aside>
  )
}
