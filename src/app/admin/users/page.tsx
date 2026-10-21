import { ShieldCheck, ShieldOff, Star } from 'lucide-react'
import { setUserRole } from '@/lib/actions/admin'
import { requireSuperadmin } from '@/lib/auth'
import { formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'ผู้ดูแลสูงสุด',
  admin: 'แอดมิน',
  user: 'ลูกค้า',
}

export default async function AdminUsersPage() {
  const session = await requireSuperadmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*, quote_requests(count)')
    .order('role')
    .order('created_at', { ascending: false })

  const profiles = (data as unknown as (Profile & { quote_requests: { count: number }[] })[]) ?? []
  const staff = profiles.filter((p) => p.role !== 'user')
  const customers = profiles.filter((p) => p.role === 'user')

  return (
    <>
      <h2 className="font-display text-lg font-semibold text-navy">สิทธิ์เข้าระบบ</h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-400">
        ตั้งให้ลูกค้าที่สมัครเข้ามาช่วยดูหลังบ้านได้ · แอดมินทำได้ทุกอย่างยกเว้นแก้สิทธิ์คนอื่น
        <br />
        หน้านี้เห็นเฉพาะผู้ดูแลสูงสุด
      </p>

      <section className="mt-8">
        <h3 className="font-display text-base font-semibold text-navy">ทีมงาน</h3>
        <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {staff.map((profile) => (
            <UserRow
              key={profile.id}
              profile={profile}
              isSelf={profile.id === session.userId}
            />
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h3 className="font-display text-base font-semibold text-navy">
          บัญชีลูกค้า <span className="text-navy-400">({customers.length})</span>
        </h3>
        {customers.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-navy-200 px-6 py-12 text-center text-navy-400">
            ยังไม่มีลูกค้าสมัครเข้ามา
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {customers.map((profile) => (
              <UserRow key={profile.id} profile={profile} isSelf={false} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function UserRow({
  profile,
  isSelf,
}: {
  profile: Profile & { quote_requests?: { count: number }[] }
  isSelf: boolean
}) {
  const quotes = profile.quote_requests?.[0]?.count ?? 0
  const isSuper = profile.role === 'superadmin'

  return (
    <li className="flex flex-wrap items-center gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-navy">
          {profile.full_name || profile.email || 'ไม่ระบุชื่อ'}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isSuper
                ? 'bg-gold-100 text-gold-700'
                : profile.role === 'admin'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-navy-50 text-navy-500'
            }`}
          >
            {isSuper && <Star className="size-3" />}
            {ROLE_LABEL[profile.role] ?? profile.role}
          </span>
          {isSelf && <span className="text-xs text-navy-400">(คุณ)</span>}
        </p>
        <p className="mt-0.5 text-sm text-navy-400">
          {profile.email}
          {profile.phone && ` · ${profile.phone}`}
          {` · สมัคร ${formatDate(profile.created_at)}`}
          {quotes > 0 && ` · ${quotes} คำขอ`}
        </p>
      </div>

      {isSuper ? (
        <span className="text-xs text-navy-300">เปลี่ยนสิทธิ์ได้จากฐานข้อมูลเท่านั้น</span>
      ) : (
        <form action={setUserRole}>
          <input type="hidden" name="id" value={profile.id} />
          <input type="hidden" name="role" value={profile.role === 'admin' ? 'user' : 'admin'} />
          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              profile.role === 'admin'
                ? 'border-navy-200 text-navy-500 hover:border-red-200 hover:text-red-600'
                : 'border-navy-200 text-navy hover:border-gold'
            }`}
          >
            {profile.role === 'admin' ? (
              <>
                <ShieldOff className="size-4" /> ถอดสิทธิ์แอดมิน
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-gold" /> ตั้งเป็นแอดมิน
              </>
            )}
          </button>
        </form>
      )}
    </li>
  )
}
