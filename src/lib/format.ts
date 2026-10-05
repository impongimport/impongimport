import type { QuoteStatus, StockStatus } from './types'

const dateFmt = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'long',
  timeZone: 'Asia/Bangkok',
})
const dateTimeFmt = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
})

export function formatDate(value?: string | null) {
  return value ? dateFmt.format(new Date(value)) : '—'
}

export function formatDateTime(value?: string | null) {
  return value ? dateTimeFmt.format(new Date(value)) : '—'
}

export const stockLabel: Record<StockStatus, string> = {
  in_stock: 'พร้อมส่ง',
  low_stock: 'เหลือน้อย',
  out_of_stock: 'สินค้าหมด',
  preorder: 'สั่งจองล่วงหน้า',
}

export const stockTone: Record<StockStatus, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  low_stock: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  out_of_stock: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  preorder: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  new: 'คำขอใหม่',
  in_progress: 'กำลังดำเนินการ',
  quoted: 'ส่งใบเสนอราคาแล้ว',
  won: 'ปิดการขาย',
  lost: 'ไม่ได้งาน',
  cancelled: 'ยกเลิก',
}

export const quoteStatusTone: Record<QuoteStatus, string> = {
  new: 'bg-[#1A344B]/10 text-[#1A344B] ring-[#1A344B]/20',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  quoted: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  lost: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-500/20',
}

/** เลขผู้เสียภาษี 13 หลัก → x-xxxx-xxxxx-xx-x */
export function formatTaxId(raw?: string | null) {
  if (!raw) return '—'
  const d = raw.replace(/\D/g, '')
  if (d.length !== 13) return raw
  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d[12]}`
}
