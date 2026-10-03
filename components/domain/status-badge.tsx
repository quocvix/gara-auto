'use client'

import React from 'react'
import type { WarrantyStatus } from '@/types/garage'
import { ShieldCheck, Clock, ShieldAlert } from 'lucide-react'

interface StatusBadgeProps {
  status: WarrantyStatus
  days?: number
  showDays?: boolean
  className?: string
}

export function StatusBadge({
  status,
  days,
  showDays = false,
  className = '',
}: StatusBadgeProps) {
  if (status === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Còn hạn</span>
        {showDays && days !== undefined && (
          <span className="opacity-80 text-[11px] font-normal">({days} ngày)</span>
        )}
      </span>
    )
  }

  if (status === 'expiring') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-500/15 text-amber-400 border-amber-500/30 ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
        <span>Sắp hết hạn</span>
        {days !== undefined && (
          <span className="font-bold text-[11px]">({days} ngày)</span>
        )}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-500/10 text-rose-400 border-rose-500/25 ${className}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      <span>Hết hạn</span>
    </span>
  )
}
