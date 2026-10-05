'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { readBilling, validateBilling, type ActionResult } from '@/lib/billing'

export async function saveBillingProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, message: 'กรุณาเข้าสู่ระบบก่อน' }

  const billing = readBilling(formData)
  const error = validateBilling(billing)
  if (error) return { ok: false, message: error }

  const supabase = await createClient()
  const { error: dbError } = await supabase
    .from('billing_profiles')
    .upsert({ user_id: session.userId, ...billing }, { onConflict: 'user_id' })

  if (dbError) return { ok: false, message: 'บันทึกไม่สำเร็จ: ' + dbError.message }

  const fullName = (formData.get('full_name') as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim()
  if (fullName !== undefined || phone !== undefined) {
    await supabase
      .from('profiles')
      .update({ full_name: fullName || null, phone: phone || null })
      .eq('id', session.userId)
  }

  revalidatePath('/me')
  return { ok: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' }
}
