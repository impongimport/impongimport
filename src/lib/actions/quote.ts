'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { readBilling, validateBilling, type ActionResult } from '@/lib/billing'

type SubmittedItem = {
  productId: string
  name: string
  variantId?: string | null
  variantName?: string | null
  quantity: number
}

export async function submitQuoteRequest(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, message: 'กรุณาเข้าสู่ระบบก่อนส่งคำขอ' }

  let items: SubmittedItem[]
  try {
    items = JSON.parse((formData.get('items') as string) || '[]')
  } catch {
    return { ok: false, message: 'รายการสินค้าไม่ถูกต้อง' }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' }
  }

  const billing = readBilling(formData)
  const invalid = validateBilling(billing)
  if (invalid) return { ok: false, message: invalid }

  const supabase = await createClient()

  // เก็บข้อมูลผู้เสียภาษีไว้ใช้ครั้งต่อไป (ติ๊กไว้เป็นค่าเริ่มต้น)
  if (formData.get('save_billing') === 'on') {
    await supabase
      .from('billing_profiles')
      .upsert({ user_id: session.userId, ...billing }, { onConflict: 'user_id' })
  }

  const { data: request, error } = await supabase
    .from('quote_requests')
    .insert({
      user_id: session.userId,
      note: (formData.get('note') as string | null)?.trim() || null,
      contact_name: billing.contact_name,
      contact_phone: billing.contact_phone,
      contact_email: billing.contact_email ?? session.email,
      billing,
    })
    .select('id')
    .single()

  if (error || !request) {
    return { ok: false, message: 'ส่งคำขอไม่สำเร็จ: ' + (error?.message ?? 'ไม่ทราบสาเหตุ') }
  }

  const { error: itemError } = await supabase.from('quote_request_items').insert(
    items.map((item) => ({
      request_id: request.id,
      product_id: item.productId || null,
      variant_id: item.variantId || null,
      product_name: item.name,
      variant_name: item.variantName || null,
      quantity: Math.max(1, Math.trunc(Number(item.quantity) || 1)),
    }))
  )

  if (itemError) {
    await supabase.from('quote_requests').delete().eq('id', request.id)
    return { ok: false, message: 'บันทึกรายการสินค้าไม่สำเร็จ: ' + itemError.message }
  }

  revalidatePath('/me')
  redirect(`/me/requests/${request.id}?new=1`)
}

export async function cancelQuoteRequest(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) return

  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('quote_requests').update({ status: 'cancelled' }).eq('id', id)

  revalidatePath('/me')
  revalidatePath(`/me/requests/${id}`)
}
