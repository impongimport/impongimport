import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center sm:px-6">
      <p className="font-display text-6xl font-semibold text-navy-100">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-navy">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-3 leading-relaxed text-navy-500">
        หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปที่หน้าแรกหรือดูแคตตาล็อกสินค้า
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700"
        >
          <ArrowLeft className="size-4" /> กลับหน้าแรก
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-6 py-3.5 font-medium text-navy transition hover:border-gold"
        >
          ดูสินค้า
        </Link>
      </div>
    </div>
  )
}
