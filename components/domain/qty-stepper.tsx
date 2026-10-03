'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useHaptic } from '@/hooks/use-haptic'

interface QtyStepperProps {
  value: number
  onCommitDelta: (delta: number) => void
  min?: number
  disabled?: boolean
  className?: string
}

export function QtyStepper({
  value,
  onCommitDelta,
  min = 0,
  disabled = false,
  className = '',
}: QtyStepperProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const pendingDeltaRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { trigger } = useHaptic()

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const queueChange = (delta: number) => {
    if (disabled) return
    const nextVal = displayValue + delta
    if (nextVal < min) return

    trigger('tap')
    setDisplayValue(nextVal)
    pendingDeltaRef.current += delta

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      if (pendingDeltaRef.current !== 0) {
        onCommitDelta(pendingDeltaRef.current)
        pendingDeltaRef.current = 0
      }
    }, 400)
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border bg-card/80 p-0.5 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => queueChange(-1)}
        disabled={disabled || displayValue <= min}
        className="touch-target flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
        aria-label="Giảm 1"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[36px] text-center font-mono font-bold text-sm select-none px-1">
        {displayValue}
      </span>

      <button
        type="button"
        onClick={() => queueChange(1)}
        disabled={disabled}
        className="touch-target flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-primary"
        aria-label="Tăng 1"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
