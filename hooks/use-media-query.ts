'use client'

import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    return false // Mặc định server là mobile-first (<1024px)
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
