export const formatVND = (n: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)
}

export const formatDateVN = (d: string): string => {
  if (!d) return ''
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return d
}

export const maskPhone = (p?: string | null): string => {
  if (!p) return ''
  const clean = p.trim()
  if (clean.length >= 7) {
    return `${clean.slice(0, 3)}****${clean.slice(-3)}`
  }
  return clean
}

export const formatOdo = (n?: number | null): string => {
  if (n === null || n === undefined) return '0'
  return new Intl.NumberFormat('vi-VN').format(n)
}
