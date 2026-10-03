'use client'

export function useHaptic() {
  const trigger = (pattern: 'tap' | 'success' | 'warning' | 'error' | number | number[]) => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return

    try {
      if (typeof pattern === 'number' || Array.isArray(pattern)) {
        navigator.vibrate(pattern)
        return
      }

      switch (pattern) {
        case 'tap':
          navigator.vibrate(10)
          break
        case 'success':
          navigator.vibrate([15, 40, 15])
          break
        case 'warning':
          navigator.vibrate([30, 50, 30])
          break
        case 'error':
          navigator.vibrate(40)
          break
      }
    } catch {
      // Bỏ qua im lặng nếu browser không cấp quyền
    }
  }

  return { trigger }
}
