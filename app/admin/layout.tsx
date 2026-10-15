'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdaptiveShell } from '@/components/layout/adaptive-shell'
import { useGarageStore } from '@/lib/store/garage-store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Loader2, ShieldAlert } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded, isAdmin, init, user, authChecked } = useGarageStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          if (isMounted) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
          }
          return
        }
      } else {
        if (!isAdmin) {
          if (isMounted) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
          }
          return
        }
      }
      if (isMounted) {
        setChecking(false)
      }
    }

    if (isLoaded || authChecked) {
      verifySession()
    }

    return () => {
      isMounted = false
    }
  }, [isLoaded, authChecked, isAdmin, router, pathname])

  if (checking || !isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100/80 p-4">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Xác thực phiên làm việc</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Hệ thống đang kiểm tra quyền Quản trị viên...
          </p>
        </div>
      </div>
    )
  }

  return <AdaptiveShell>{children}</AdaptiveShell>
}

