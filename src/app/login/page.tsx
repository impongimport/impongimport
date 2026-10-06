import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { GoogleSignIn } from '@/components/google-sign-in'
import { getSession } from '@/lib/auth'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'เข้าสู่ระบบ' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const session = await getSession()
  if (session) redirect(next && next.startsWith('/') ? next : '/me')

  return (
    <div className="mx-auto grid max-w-md px-4 py-20 sm:px-6">
      <div className="rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <Image
          src="/brand/mark-navy.png"
          alt={site.nameEn}
          width={358}
          height={395}
          className="mx-auto h-20 w-auto"
        />
        <h1 className="mt-6 font-display text-2xl font-semibold text-navy">เข้าสู่ระบบลูกค้า</h1>
        <p className="mt-3 text-sm leading-relaxed text-navy-500">
          เข้าสู่ระบบด้วยบัญชี Google เพื่อบันทึกข้อมูลผู้เสียภาษี
          ส่งคำขอใบเสนอราคา และติดตามสถานะคำขอของท่าน
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
        )}

        <div className="mt-7">
          <GoogleSignIn next={next} />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-navy-400">
          การเข้าสู่ระบบถือว่าท่านยินยอมให้บริษัทเก็บข้อมูลที่ท่านกรอก
          เพื่อใช้ติดต่อและออกเอกสารทางการค้าเท่านั้น
        </p>
      </div>
    </div>
  )
}
