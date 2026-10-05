import { formatDateTime, formatTaxId } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { BillingProfile } from '@/lib/types'

export default async function AdminCustomers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('billing_profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  const customers = (data as BillingProfile[]) ?? []

  return (
    <>
      <h2 className="font-display text-lg font-semibold text-navy">
        ลูกค้าที่บันทึกข้อมูลผู้เสียภาษี
      </h2>
      <p className="mt-2 text-sm text-navy-400">
        ข้อมูลที่ลูกค้ากรอกไว้ใช้ออกใบเสนอราคาและใบกำกับภาษี
      </p>

      {customers.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
          ยังไม่มีลูกค้าที่กรอกข้อมูล
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {customers.map((c) => (
            <li key={c.id} className="rounded-2xl border border-navy-100 bg-white p-6">
              <h3 className="font-semibold text-navy">{c.org_name}</h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Line label="เลขผู้เสียภาษี" value={`${formatTaxId(c.tax_id)} · ${c.branch}`} />
                <Line
                  label="ที่อยู่"
                  value={[c.address, c.subdistrict, c.district, c.province, c.postal_code]
                    .filter(Boolean)
                    .join(' ')}
                />
                <Line
                  label="ผู้ติดต่อ"
                  value={[c.contact_name, c.contact_phone, c.contact_email]
                    .filter(Boolean)
                    .join(' · ')}
                />
              </dl>
              <p className="mt-3 text-xs text-navy-400">แก้ไขล่าสุด {formatDateTime(c.updated_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Line({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[110px_1fr]">
      <dt className="text-navy-400">{label}</dt>
      <dd className="text-navy-700">{value || '—'}</dd>
    </div>
  )
}
