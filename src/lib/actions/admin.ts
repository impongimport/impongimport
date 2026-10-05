'use server'

import { revalidatePath } from 'next/cache'
import { isAdmin, getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/billing'
import type { StockStatus } from '@/lib/types'

async function requireAdminSession() {
  const session = await getSession()
  if (!session || !isAdmin(session.profile)) return null
  return session
}

const str = (fd: FormData, key: string) => ((fd.get(key) as string | null)?.trim() || null)

/** "ชื่อขนาด | สถานะ" บรรทัดละรุ่น — สถานะเว้นว่างได้ */
const STOCK_FROM_TH: Record<string, StockStatus> = {
  'พร้อมส่ง': 'in_stock',
  'เหลือน้อย': 'low_stock',
  'หมด': 'out_of_stock',
  'สินค้าหมด': 'out_of_stock',
  'สั่งจอง': 'preorder',
}

function parseVariants(raw: string | null) {
  if (!raw) return []
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, status] = line.split('|').map((s) => s.trim())
      return {
        name,
        stock_status: (status && STOCK_FROM_TH[status]) || ('in_stock' as StockStatus),
        sort_order: i + 1,
      }
    })
    .filter((v) => v.name)
}

function parseSpecs(raw: string | null) {
  if (!raw) return []
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx === -1) return { label: line, value: '' }
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }
    })
}

export async function saveProduct(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdminSession()
  if (!session) return { ok: false, message: 'ไม่มีสิทธิ์' }

  const id = str(formData, 'id')
  const name = str(formData, 'name')
  const slug = str(formData, 'slug')
  if (!name || !slug) return { ok: false, message: 'กรุณากรอกชื่อสินค้าและ slug' }

  const payload = {
    name,
    slug,
    brand: str(formData, 'brand'),
    category_id: str(formData, 'category_id'),
    summary: str(formData, 'summary'),
    description: str(formData, 'description'),
    specs: parseSpecs(str(formData, 'specs')),
    image_url: str(formData, 'image_url'),
    stock_status: (str(formData, 'stock_status') ?? 'in_stock') as StockStatus,
    is_featured: formData.get('is_featured') === 'on',
    is_active: formData.get('is_active') === 'on',
    sort_order: Number(str(formData, 'sort_order') ?? 0) || 0,
  }

  const supabase = await createClient()
  const { data, error } = id
    ? await supabase.from('products').update(payload).eq('id', id).select('id').single()
    : await supabase.from('products').insert(payload).select('id').single()

  if (error || !data) return { ok: false, message: 'บันทึกไม่สำเร็จ: ' + (error?.message ?? '') }

  // รุ่น/ขนาด — เขียนทับทั้งชุด
  const variants = parseVariants(str(formData, 'variants'))
  await supabase.from('product_variants').delete().eq('product_id', data.id)
  if (variants.length > 0) {
    await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ ...v, product_id: data.id })))
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  return { ok: true, message: 'บันทึกสินค้าเรียบร้อยแล้ว' }
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const session = await requireAdminSession()
  if (!session) return
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/products')
  revalidatePath('/products')
}

export async function saveNews(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdminSession()
  if (!session) return { ok: false, message: 'ไม่มีสิทธิ์' }

  const id = str(formData, 'id')
  const title = str(formData, 'title')
  const slug = str(formData, 'slug')
  if (!title || !slug) return { ok: false, message: 'กรุณากรอกหัวข้อและ slug' }

  const isPublished = formData.get('is_published') === 'on'
  const payload = {
    title,
    slug,
    excerpt: str(formData, 'excerpt'),
    content: str(formData, 'content'),
    cover_url: str(formData, 'cover_url'),
    is_published: isPublished,
    published_at: isPublished ? (str(formData, 'published_at') ?? new Date().toISOString()) : null,
  }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('news').update(payload).eq('id', id)
    : await supabase.from('news').insert(payload)

  if (error) return { ok: false, message: 'บันทึกไม่สำเร็จ: ' + error.message }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath(`/news/${slug}`)
  revalidatePath('/')
  return { ok: true, message: 'บันทึกข่าวเรียบร้อยแล้ว' }
}

export async function deleteNews(formData: FormData): Promise<void> {
  const session = await requireAdminSession()
  if (!session) return
  const supabase = await createClient()
  await supabase.from('news').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/news')
  revalidatePath('/news')
}

export async function updateQuoteStatus(formData: FormData): Promise<void> {
  const session = await requireAdminSession()
  if (!session) return

  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase
    .from('quote_requests')
    .update({
      status: formData.get('status') as string,
      admin_note: ((formData.get('admin_note') as string | null) ?? '').trim() || null,
    })
    .eq('id', id)

  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${id}`)
}
