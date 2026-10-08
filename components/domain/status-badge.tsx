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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-success-soft text-success border-success/25 whitespace-nowrap ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
        <span>Còn hạn</span>
        {showDays && days !== undefined && (
          <span className="opacity-80 text-xs font-normal">({days} ngày)</span>
        )}
      </span>
    )
  }

  if (status === 'expiring') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-warning-soft text-warning border-warning/30 whitespace-nowrap ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-warning animate-pulse shrink-0" />
        <span>Sắp hết hạn</span>
        {days !== undefined && (
          <span className="font-bold text-xs">({days} ngày)</span>
        )}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-danger-soft text-danger border-danger/25 whitespace-nowrap ${className}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
      <span>Hết hạn</span>
    </span>
  )
}
