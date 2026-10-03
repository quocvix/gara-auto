import type { WarrantyStatus } from '@/types/garage'

export const todayVN = (): string => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()) // YYYY-MM-DD
}

export const daysLeft = (expiresOn: string, today = todayVN()): number => {
  if (!expiresOn) return 0
  const exp = Date.parse(expiresOn)
  const now = Date.parse(today)
  return Math.round((exp - now) / 86_400_000)
}

export const getStatus = (days: number, threshold = 30): WarrantyStatus => {
  if (days < 0) return 'expired'
  if (days <= threshold) return 'expiring'
  return 'active'
}

export const progressPercent = (activatedOn: string, expiresOn: string, today = todayVN()): number => {
  if (!activatedOn || !expiresOn) return 0
  const total = Date.parse(expiresOn) - Date.parse(activatedOn)
  const left = Date.parse(expiresOn) - Date.parse(today)
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((left / total) * 100)))
}

export const addMonthsToDate = (dateStr: string, months: number): string => {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}
