'use client'

import React from 'react'
import { formatDateVN } from '@/lib/format'
import { progressPercent } from '@/lib/warranty'
import type { WarrantyStatus } from '@/types/garage'

interface WarrantyProgressProps {
  activatedOn: string
  expiresOn: string
  status: WarrantyStatus
  daysLeft: number
  className?: string
}

export function WarrantyProgress({
  activatedOn,
  expiresOn,
  status,
  daysLeft,
  className = '',
}: WarrantyProgressProps) {
  const percent = progressPercent(activatedOn, expiresOn)

  let barColor = 'bg-emerald-500'
  if (status === 'expiring') barColor = 'bg-amber-400'
  if (status === 'expired') barColor = 'bg-rose-500'

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">Thời hạn hiệu lực</span>
        <span
          className={`font-semibold ${
            status === 'active'
              ? 'text-emerald-400'
              : status === 'expiring'
              ? 'text-amber-400 font-bold'
              : 'text-rose-400'
          }`}
        >
          {status === 'expired'
            ? `Hết hạn ${Math.abs(daysLeft)} ngày trước`
            : `Còn lại ${daysLeft} ngày`}
        </span>
      </div>

      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${status === 'expired' ? 100 : percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>Kích hoạt: {formatDateVN(activatedOn)}</span>
        <span>Hết hạn: {formatDateVN(expiresOn)}</span>
      </div>
    </div>
  )
}
