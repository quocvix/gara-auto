export const normalizePlate = (s: string): string => {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export const sanitizePlateInput = (s: string): string => {
  return (s || '').toUpperCase().replace(/[^A-Z0-9.\-]/g, '')
}

export const formatPlateDisplay = (plate: string): string => {
  const norm = normalizePlate(plate)
  if (norm.length <= 4) return norm
  // Format Vietnamese plates: 51K88999 -> 51K-889.99, 29A1234 -> 29A-1234
  if (norm.length === 8) {
    return `${norm.slice(0, 3)}-${norm.slice(3, 6)}.${norm.slice(6)}`
  }
  if (norm.length === 9) {
    return `${norm.slice(0, 4)}-${norm.slice(4, 7)}.${norm.slice(7)}`
  }
  if (norm.length === 7) {
    return `${norm.slice(0, 3)}-${norm.slice(3)}`
  }
  return plate
}
