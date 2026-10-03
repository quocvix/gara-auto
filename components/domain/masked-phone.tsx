'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useGarageStore } from '@/lib/store/garage-store'

interface MaskedPhoneProps {
  masked: string
  full?: string
  className?: string
}

export function MaskedPhone({ masked, full, className = '' }: MaskedPhoneProps) {
  const { isAdmin } = useGarageStore()
  const [revealed, setRevealed] = useState(false)

  if (!masked) return <span className="text-muted-foreground">—</span>

  const handleToggle = () => {
    if (!isAdmin) return
    setRevealed((prev) => !prev)
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm ${className}`}>
      <span>{revealed && full ? full : masked}</span>
      {isAdmin ? (
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={revealed ? 'Ẩn số điện thoại' : 'Mở xem số đầy đủ (Quyền Admin)'}
          aria-label="Xem số điện thoại đầy đủ"
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5 text-primary" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      ) : (
        <span title="Số điện thoại được bảo vệ quyền riêng tư">
          <Lock className="w-3 h-3 text-muted-foreground/60" />
        </span>
      )}
    </span>
  )
}
