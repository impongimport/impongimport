import type { BillingProfile } from '@/lib/types'

export function Field({
  label,
  name,
  defaultValue,
  required,
  type = 'text',
  placeholder,
  className = '',
  inputMode,
  maxLength,
}: {
  label: string
  name: string
  defaultValue?: string | null
  required?: boolean
  type?: string
  placeholder?: string
  className?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  maxLength?: number
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-navy-600">
        {label} {required && <span className="text-gold-600">*</span>}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none placeholder:text-navy-300 focus:border-gold"
      />
    </label>
  )
}

/** ฟิลด์ข้อมูลผู้เสียภาษี ใช้ร่วมกันระหว่างหน้าบัญชีและหน้าส่งคำขอ */
export function BillingFields({ billing }: { billing: BillingProfile | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="ชื่อผู้เสียภาษี / ชื่อหน่วยงาน"
        name="org_name"
        defaultValue={billing?.org_name}
        placeholder="เช่น โรงพยาบาล… / บริษัท… จำกัด"
        required
        className="sm:col-span-2"
      />
      <Field
        label="เลขประจำตัวผู้เสียภาษี (13 หลัก)"
        name="tax_id"
        defaultValue={billing?.tax_id}
        placeholder="0000000000000"
        inputMode="numeric"
        maxLength={17}
        required
      />
      <Field
        label="สาขา"
        name="branch"
        defaultValue={billing?.branch ?? 'สำนักงานใหญ่'}
        placeholder="สำนักงานใหญ่ หรือ สาขา 00001"
        required
      />
      <Field
        label="ที่อยู่ (เลขที่ ถนน)"
        name="address"
        defaultValue={billing?.address}
        placeholder="เลขที่ อาคาร ซอย ถนน"
        required
        className="sm:col-span-2"
      />
      <Field label="แขวง / ตำบล" name="subdistrict" defaultValue={billing?.subdistrict} />
      <Field label="เขต / อำเภอ" name="district" defaultValue={billing?.district} />
      <Field label="จังหวัด" name="province" defaultValue={billing?.province} />
      <Field
        label="รหัสไปรษณีย์"
        name="postal_code"
        defaultValue={billing?.postal_code}
        inputMode="numeric"
        maxLength={5}
      />

      <div className="sm:col-span-2">
        <h3 className="mt-2 font-semibold text-navy">ผู้ติดต่อ</h3>
        <span className="rule-gold mt-2" />
      </div>
      <Field label="ชื่อผู้ติดต่อ" name="contact_name" defaultValue={billing?.contact_name} />
      <Field
        label="เบอร์โทรผู้ติดต่อ"
        name="contact_phone"
        defaultValue={billing?.contact_phone}
        inputMode="tel"
      />
      <Field
        label="อีเมลสำหรับส่งเอกสาร"
        name="contact_email"
        defaultValue={billing?.contact_email}
        type="email"
        inputMode="email"
        className="sm:col-span-2"
      />
    </div>
  )
}
