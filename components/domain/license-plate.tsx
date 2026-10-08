'use client'

import React from 'react'
import { formatPlateDisplay } from '@/lib/plate'

interface LicensePlateProps {
  plate: string
  color?: 'white' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LicensePlate({
  plate,
  color = 'white',
  size = 'md',
  className = '',
}: LicensePlateProps) {
  const display = formatPlateDisplay(plate)

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 rounded border-[1.5px] min-w-[90px]',
    md: 'text-base sm:text-lg px-3.5 py-1.5 rounded-md border-2 min-w-[140px]',
    lg: 'text-2xl sm:text-3xl px-5 py-2.5 rounded-lg border-2 sm:border-[3px] min-w-[200px]',
  }

  const screwSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  }

  const isYellow = color === 'yellow'

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold tracking-wider font-mono select-none shrink-0 whitespace-nowrap plate-embossed transition-transform ${
        isYellow
          ? 'bg-[#FACC15] text-[#0F172A] border-[#1E293B]'
          : 'bg-[#FFFFFF] text-[#0F172A] border-[#1E293B]'
      } ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'var(--font-plate), monospace' }}
    >
      {/* 4 Ốc vít ở 4 góc */}
      <span className={`absolute top-1 left-1 rounded-full bg-[#64748B]/60 border border-[#0F172A]/50 ${screwSize[size]}`} />
      <span className={`absolute top-1 right-1 rounded-full bg-[#64748B]/60 border border-[#0F172A]/50 ${screwSize[size]}`} />
      <span className={`absolute bottom-1 left-1 rounded-full bg-[#64748B]/60 border border-[#0F172A]/50 ${screwSize[size]}`} />
      <span className={`absolute bottom-1 right-1 rounded-full bg-[#64748B]/60 border border-[#0F172A]/50 ${screwSize[size]}`} />

      {/* Chữ biển số */}
      <span className="uppercase whitespace-nowrap">{display}</span>
    </div>
  )
}
