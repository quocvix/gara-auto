import { z } from 'zod'
import { normalizePlate } from '@/lib/plate'

// Regex số điện thoại di động Việt Nam (10 số, đầu số 03, 05, 07, 08, 09)
export const VIETNAMESE_PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/

// ==========================================
// 1. TICKET ITEM & TICKET SCHEMA (PHIẾU BẢO HÀNH)
// ==========================================
export const ticketItemSchema = z.object({
  partId: z.string().min(1, 'Vui lòng chọn phụ tùng'),
  quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1'),
  warrantyMonths: z.number().int().min(0, 'Thời hạn bảo hành không được âm'),
  activatedOn: z.string().optional(),
})

export type TicketItemFormValues = z.infer<typeof ticketItemSchema>

export const ticketSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập biển số xe')
    .refine((val) => normalizePlate(val).length >= 5, {
      message: 'Biển số xe phải có ít nhất 5 ký tự hợp lệ',
    }),
  plateColor: z.enum(['white', 'yellow'], {
    message: 'Màu biển số không hợp lệ',
  }),
  model: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập dòng xe (VD: Mazda CX-5, Vios)'),
  ownerName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên chủ xe'),
  ownerPhone: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại chủ xe')
    .refine((val) => VIETNAMESE_PHONE_REGEX.test(val.replace(/\s+/g, '')), {
      message: 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)',
    }),
  items: z
    .array(ticketItemSchema)
    .min(1, 'Vui lòng chọn ít nhất 1 phụ tùng cần bảo hành'),
  activatedOn: z.string().optional(),
  note: z.string(),
})

export type TicketFormValues = z.infer<typeof ticketSchema>

// ==========================================
// 2. PART SCHEMA (PHỤ TÙNG KHO)
// ==========================================
export const partSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Vui lòng nhập tên phụ tùng'),
  category: z.string().trim().optional().default('Phụ tùng'),
  warrantyMonths: z.number().int().min(0, 'Thời hạn bảo hành không được âm').default(0),
  stock: z.number().int().min(0, 'Số lượng tồn kho không được âm').default(0),
  isActive: z.boolean().default(true),
})

export type PartFormValues = z.infer<typeof partSchema>

// ==========================================
// 3. SETTINGS SCHEMA (CÀI ĐẶT GARA)
// ==========================================
export const settingsSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên gara'),
  hotline: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số hotline')
    .refine((val) => VIETNAMESE_PHONE_REGEX.test(val.replace(/\s+/g, '')), {
      message: 'Hotline phải là số điện thoại hợp lệ (10 số)',
    }),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ gara'),
  mapsUrl: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Đường dẫn Google Maps phải bắt đầu bằng http:// hoặc https://',
    }),
  expiringThresholdDays: z
    .number()
    .int()
    .min(1, 'Ngưỡng cảnh báo phải từ 1 ngày trở lên')
    .default(30),
  lowStockThreshold: z
    .number()
    .int()
    .min(0, 'Ngưỡng tồn thấp không được âm')
    .default(3),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
