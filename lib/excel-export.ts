import ExcelJS from 'exceljs'
import type { Part, StockMovement, VehicleOverview } from '@/types/garage'
import { formatDateVN, formatVND } from './format'

export async function exportVehiclesToExcel(vehicles: VehicleOverview[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Gara Auto Care'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Danh sách xe', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Biển số', key: 'plate', width: 16 },
    { header: 'Màu biển', key: 'plateColor', width: 12 },
    { header: 'Dòng xe', key: 'model', width: 25 },
    { header: 'Chủ xe', key: 'ownerName', width: 22 },
    { header: 'Số điện thoại', key: 'ownerPhone', width: 16 },
    { header: 'ODO (km)', key: 'odo', width: 14 },
    { header: 'Trạng thái BH', key: 'status', width: 16 },
    { header: 'Hạn bảo hành', key: 'expiresOn', width: 16 },
    { header: 'Số phiếu BH', key: 'ticketCount', width: 14 },
  ]

  // Style header
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 26

  const statusLabel = {
    active: 'Còn hạn',
    expiring: 'Sắp hết hạn',
    expired: 'Hết hạn',
  }

  vehicles.forEach((v, index) => {
    const row = sheet.addRow({
      stt: index + 1,
      plate: v.plate,
      plateColor: v.plateColor === 'yellow' ? 'Biển vàng' : 'Biển trắng',
      model: v.model,
      ownerName: v.ownerName || '—',
      ownerPhone: v.ownerPhone || '—',
      odo: v.odo || 0,
      status: statusLabel[v.status] || v.status,
      expiresOn: v.expiresOn ? formatDateVN(v.expiresOn) : 'Chưa có',
      ticketCount: v.ticketCount || 0,
    })
    row.alignment = { vertical: 'middle' }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBuffer(buffer, `danh-sach-xe-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function exportPartsToExcel(parts: Part[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Gara Auto Care'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Kho phụ tùng', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Mã SKU', key: 'sku', width: 18 },
    { header: 'Tên phụ tùng', key: 'name', width: 35 },
    { header: 'Danh mục', key: 'category', width: 20 },
    { header: 'Bảo hành (tháng)', key: 'warrantyMonths', width: 18 },
    { header: 'Đơn giá (VNĐ)', key: 'price', width: 18 },
    { header: 'Tồn kho', key: 'stock', width: 14 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 26

  parts
    .filter((p) => p.isActive)
    .forEach((p, idx) => {
      const row = sheet.addRow({
        stt: idx + 1,
        sku: p.sku,
        name: p.name,
        category: p.category || 'Khác',
        warrantyMonths: p.warrantyMonths,
        price: p.price,
        stock: p.stock,
      })
      row.getCell('price').numFmt = '#,##0 "₫"'
      row.alignment = { vertical: 'middle' }
    })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBuffer(buffer, `kho-phu-tung-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function exportMovementsToExcel(movements: StockMovement[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Gara Auto Care'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Lịch sử kho', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Thời gian', key: 'createdAt', width: 20 },
    { header: 'Tên phụ tùng', key: 'partName', width: 32 },
    { header: 'Mã SKU', key: 'partSku', width: 18 },
    { header: 'Biến động', key: 'delta', width: 14 },
    { header: 'Tồn sau', key: 'stockAfter', width: 14 },
    { header: 'Lý do', key: 'reason', width: 22 },
    { header: 'Ghi chú', key: 'note', width: 30 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 26

  const reasonMap: Record<string, string> = {
    initial: 'Khởi tạo ban đầu',
    import: 'Nhập kho',
    export: 'Xuất kho',
    adjust: 'Điều chỉnh kiểm kê',
    ticket_use: 'Dùng cho phiếu BH',
    ticket_revert: 'Hoàn lại từ phiếu BH',
  }

  movements.forEach((m, idx) => {
    sheet.addRow({
      stt: idx + 1,
      createdAt: formatDateVN(m.createdAt),
      partName: m.partName,
      partSku: m.partSku,
      delta: m.delta > 0 ? `+${m.delta}` : `${m.delta}`,
      stockAfter: m.stockAfter,
      reason: reasonMap[m.reason] || m.reason,
      note: m.note || '—',
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBuffer(buffer, `lich-su-kho-${new Date().toISOString().split('T')[0]}.xlsx`)
}

function downloadBuffer(buffer: ArrayBuffer | ExcelJS.Buffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
