export type ActionResult = { ok: boolean; message: string }

/** ฟิลด์ข้อมูลผู้เสียภาษีที่รับจากฟอร์ม (ใช้ร่วมกันระหว่าง /me และ /quote) */
export function readBilling(formData: FormData) {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null
  return {
    org_name: get('org_name') ?? '',
    tax_id: (get('tax_id') ?? '').replace(/\D/g, ''),
    branch: get('branch') || 'สำนักงานใหญ่',
    address: get('address') ?? '',
    subdistrict: get('subdistrict'),
    district: get('district'),
    province: get('province'),
    postal_code: get('postal_code'),
    contact_name: get('contact_name'),
    contact_phone: get('contact_phone'),
    contact_email: get('contact_email'),
  }
}

export function validateBilling(b: ReturnType<typeof readBilling>): string | null {
  if (!b.org_name) return 'กรุณากรอกชื่อผู้เสียภาษี / ชื่อหน่วยงาน'
  if (b.tax_id.length !== 13) return 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก'
  if (!b.address) return 'กรุณากรอกที่อยู่สำหรับออกใบกำกับภาษี'
  return null
}
