'use client'

import React from 'react'
import { useGarageStore } from '@/lib/store/garage-store'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, User, RotateCcw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function DemoBar() {
  const { isAdmin, toggleAdminRole, resetData } = useGarageStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleRoleToggle = () => {
    toggleAdminRole()
    if (isAdmin && pathname.startsWith('/admin')) {
      toast.info('Đã chuyển sang vai trò: Khách hàng (Xem tra cứu công khai)')
      router.push('/tra-cuu')
    } else if (!isAdmin) {
      toast.success('Đã chuyển sang vai trò: Quản trị viên Gara (Toàn quyền Admin)')
      router.push('/admin')
    }
  }

  const handleReset = () => {
    if (window.confirm('Khôi phục dữ liệu ban đầu (4 xe mẫu, 8 phụ tùng, lịch sử mẫu)?')) {
      resetData()
      toast.success('Đã khôi phục dữ liệu mẫu ban đầu!')
    }
  }

  return (
    <div className="bg-primary/95 text-primary-foreground text-xs py-1.5 px-3 flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 sticky top-0 z-50 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full font-semibold">
          <Sparkles className="w-3 h-3 text-warning" />
          FE PREVIEW MODE
        </span>
        <span className="hidden sm:inline text-primary-foreground/90">
          Hệ thống Quản lý & Tra cứu Bảo hành Gara
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRoleToggle}
          type="button"
          className="flex items-center gap-1.5 bg-black/25 hover:bg-black/40 text-white font-medium px-2.5 py-1 rounded transition-colors"
          title="Bấm để chuyển đổi vai trò Khách <-> Quản trị viên"
        >
          {isAdmin ? (
            <>
              <Shield className="w-3.5 h-3.5 text-warning" />
              <span>Vai trò: <strong>Quản trị Gara</strong></span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-success" />
              <span>Vai trò: <strong>Khách tra cứu</strong></span>
            </>
          )}
          <span className="opacity-70 text-[10px] underline ml-1">Đổi vai trò</span>
        </button>

        <button
          onClick={handleReset}
          type="button"
          className="flex items-center gap-1 bg-black/20 hover:bg-black/35 text-white/90 px-2 py-1 rounded transition-colors"
          title="Nạp lại 4 xe và 8 phụ tùng mẫu ban đầu"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden md:inline">Reset mẫu</span>
        </button>
      </div>
    </div>
  )
}
