'use client'

import React from 'react'
import Link from 'next/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Plus, Package, History } from 'lucide-react'
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
      active: pathname === '/admin/kho',
    },
    {
      label: 'Lịch sử kho',
      href: '/admin/kho/lich-su',
      icon: History,
      active: pathname === '/admin/kho/lich-su',
    },
  ]

  const handleFabClick = () => {
    trigger('tap')
    openTicketModal()
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-1 relative max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            return (
              <div key="fab" className="relative -top-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleFabClick}
                  className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-card active:scale-95 transition-all"
                  aria-label="Tạo phiếu bảo hành mới"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-bold text-primary mt-0.5 tracking-tight">
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
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
