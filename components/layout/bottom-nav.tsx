'use client'

import React from 'react'
import Link from 'next/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Plus, Package, Settings } from 'lucide-react'
import { useTicketModal } from '@/components/domain/ticket-modal'
import { useHaptic } from '@/hooks/use-haptic'

export function BottomNav() {
  const pathname = usePathname()
  const { openTicketModal } = useTicketModal()
  const { trigger } = useHaptic()

  const navItems = [
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
    // Vị trí thứ 3 là FAB (+)
    {
      label: 'Tạo phiếu',
      isFab: true,
    },
    {
      label: 'Kho hàng',
      href: '/admin/kho',
      icon: Package,
      active: pathname.startsWith('/admin/kho'),
    },
    {
      label: 'Cài đặt',
      href: '/admin/cai-dat',
      icon: Settings,
      active: pathname === '/admin/cai-dat',
    },
  ]

  const handleFabClick = () => {
    trigger('tap')
    openTicketModal()
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xs"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-1 relative max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            return (
              <div key="fab" className="relative -top-3 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleFabClick}
                  className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-white active:scale-95 transition-all cursor-pointer"
                  aria-label="Tạo phiếu bảo hành mới"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <span className="text-3xs font-bold text-blue-600 mt-0.5 tracking-tight">
                  Tạo phiếu
                </span>
              </div>
            )
          }

          const Icon = item.icon!
          const isActive = item.active

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-3xs mt-0.5 font-medium tracking-tight">
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
