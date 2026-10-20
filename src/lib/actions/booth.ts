'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { readAnswers, summarizeAnswers } from '@/lib/booth'
import { getSession, isAdmin } from '@/lib/auth'
import type { ActionResult } from '@/lib/billing'
import { createClient } from '@/lib/supabase/server'
import { supabasePublic } from '@/lib/supabase/public'
import type { BoothEntry } from '@/lib/types'

const SUBMIT_ERRORS: Record<string, string> = {
  event_not_found: 'ยังไม่เปิดรับลงทะเบียนสำหรับงานนี้',
  missing_name: 'กรุณากรอกชื่อและหน่วยงาน',
  invalid_phone: 'เบอร์โทรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
}

/**
 * ส่งแบบสอบถามจากหน้าบูธ — ไม่ต้องล็อกอิน
 *
 * เขียนผ่าน RPC `submit_booth_entry` (security definer) เพราะ RLS ของ
 * `booth_entries` ปิดไม่ให้คนทั่วไปอ่าน/เขียนตรง ๆ ฟังก์ชันนั้นออกเลขสิทธิ์
 * กันกรอกซ้ำด้วยเบอร์โทร และผูกบัญชีให้ถ้าอีเมลตรงกับผู้ใช้ที่มีอยู่
 */
export async function submitBoothEntry(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const slug = String(formData.get('slug') ?? '')
  if (!slug) return { ok: false, message: 'ไม่พบงานที่ต้องการลงทะเบียน' }

  if (formData.get('consent') !== 'on') {
    return { ok: false, message: 'กรุณายินยอมให้เก็บข้อมูลเพื่อติดต่อกลับ' }
  }

  const { answers, error } = readAnswers(formData)
  if (error) return { ok: false, message: error }

  const text = (key: string) => (formData.get(key) as string | null)?.trim() || ''

  const { data, error: rpcError } = await supabasePublic.rpc('submit_booth_entry', {
    p_slug: slug,
    p_full_name: text('full_name'),
    p_org_name: text('org_name'),
    p_role: text('role'),
    p_phone: text('phone'),
    p_email: text('email'),
    p_answers: answers,
  })

  if (rpcError) return { ok: false, message: 'ส่งข้อมูลไม่สำเร็จ: ' + rpcError.message }

  const result = data as { ok: boolean; error?: string; duplicate?: boolean; ticket_code?: string }
  if (!result?.ok) {
    return { ok: false, message: SUBMIT_ERRORS[result?.error ?? ''] ?? 'ส่งข้อมูลไม่สำเร็จ' }
  }

  redirect(
    `/booth/${slug}/done?t=${encodeURIComponent(result.ticket_code!)}${result.duplicate ? '&again=1' : ''}`
  )
}

// ───────────────────────── แอดมิน ─────────────────────────

async function requireAdminClient() {
  const session = await getSession()
  if (!session || !isAdmin(session.profile)) return null
  return { session, supabase: await createClient() }
}

export async function saveBoothEvent(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireAdminClient()
  if (!ctx) return { ok: false, message: 'ไม่มีสิทธิ์' }

  const str = (key: string) => (formData.get(key) as string | null)?.trim() || null
  const id = str('id')
  const name = str('name')
  const slug = str('slug')
  if (!name || !slug) return { ok: false, message: 'กรุณากรอกชื่องานและ slug' }

  const payload = {
    name,
    slug,
    venue: str('venue'),
    starts_on: str('starts_on'),
    ends_on: str('ends_on'),
    intro: str('intro'),
    is_active: formData.get('is_active') === 'on',
  }

  const { error } = id
    ? await ctx.supabase.from('booth_events').update(payload).eq('id', id)
    : await ctx.supabase.from('booth_events').insert(payload)

  if (error) return { ok: false, message: 'บันทึกไม่สำเร็จ: ' + error.message }

  revalidatePath('/admin/booth')
  return { ok: true, message: 'บันทึกงานเรียบร้อยแล้ว' }
}

export async function drawBoothWinner(formData: FormData): Promise<void> {
  const ctx = await requireAdminClient()
  if (!ctx) return

  const eventId = formData.get('event_id') as string
  await ctx.supabase.rpc('booth_draw_winner', {
    p_event: eventId,
    p_prize: (formData.get('prize_id') as string) || null,
  })

  revalidatePath(`/admin/booth/${eventId}`)
}

export async function savePrize(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireAdminClient()
  if (!ctx) return { ok: false, message: 'ไม่มีสิทธิ์' }

  const str = (key: string) => (formData.get(key) as string | null)?.trim() || null
  const id = str('id')
  const name = str('name')
  if (!name) return { ok: false, message: 'กรุณากรอกชื่อรางวัล' }

  const quantity = Math.max(1, Number(str('quantity') ?? 1) || 1)
  const payload = {
    event_id: formData.get('event_id') as string,
    name,
    quantity,
    image_url: str('image_url'),
    sort_order: Number(str('sort_order') ?? 0) || 0,
  }

  const { error } = id
    ? await ctx.supabase.from('booth_prizes').update(payload).eq('id', id)
    : await ctx.supabase.from('booth_prizes').insert(payload)

  if (error) return { ok: false, message: 'บันทึกไม่สำเร็จ: ' + error.message }

  revalidatePath(`/admin/booth/${payload.event_id}`)
  return { ok: true, message: 'บันทึกของรางวัลแล้ว' }
}

export async function deletePrize(formData: FormData): Promise<void> {
  const ctx = await requireAdminClient()
  if (!ctx) return

  const eventId = formData.get('event_id') as string
  await ctx.supabase.from('booth_prizes').delete().eq('id', formData.get('id') as string)

  revalidatePath(`/admin/booth/${eventId}`)
}

export async function undoBoothWinner(formData: FormData): Promise<void> {
  const ctx = await requireAdminClient()
  if (!ctx) return

  const id = formData.get('id') as string
  const eventId = formData.get('event_id') as string
  await ctx.supabase
    .from('booth_entries')
    .update({ is_winner: false, won_at: null, prize_id: null })
    .eq('id', id)

  revalidatePath(`/admin/booth/${eventId}`)
}

/**
 * เปลี่ยนรายชื่อจากบูธเป็นคำขอใบเสนอราคา
 *
 * คำขอที่ได้ยังไม่มีรายการสินค้า — ตั้งใจให้แอดมินคุยกับลูกค้าก่อนแล้วค่อยเติม
 * คำตอบจากแบบสอบถามถูกสรุปใส่ `note` ไว้ให้ฝ่ายขายอ่านได้ทันที
 */
export async function createQuoteFromEntry(formData: FormData): Promise<void> {
  const ctx = await requireAdminClient()
  if (!ctx) return

  const id = formData.get('id') as string
  const eventId = formData.get('event_id') as string

  const { data } = await ctx.supabase.from('booth_entries').select('*').eq('id', id).maybeSingle()
  if (!data) return

  const entry = data as BoothEntry
  if (entry.quote_request_id) return

  const summary = summarizeAnswers(entry.answers)
  const { data: request } = await ctx.supabase
    .from('quote_requests')
    .insert({
      user_id: entry.user_id,
      status: 'new',
      note: [`รายชื่อจากงานออกบูธ (สิทธิ์ ${entry.ticket_code})`, ...summary].join('\n'),
      contact_name: entry.full_name,
      contact_phone: entry.phone,
      contact_email: entry.email,
      billing: {
        org_name: entry.org_name,
        contact_name: entry.full_name,
        contact_phone: entry.phone,
        contact_email: entry.email ?? '',
      },
      admin_note: 'สร้างจากรายชื่อบูธ — ยังไม่ได้ระบุรายการสินค้าและข้อมูลผู้เสียภาษี',
    })
    .select('id')
    .single()

  if (!request) return

  await ctx.supabase
    .from('booth_entries')
    .update({ quote_request_id: request.id })
    .eq('id', entry.id)

  revalidatePath(`/admin/booth/${eventId}`)
  revalidatePath('/admin/quotes')
  redirect(`/admin/quotes/${request.id}`)
}
