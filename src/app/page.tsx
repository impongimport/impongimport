import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileText,
  Hospital,
  MessageCircle,
  Phone,
  Ship,
  Truck,
} from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { formatDate } from '@/lib/format'
import { getCategories, getFeaturedProducts, getNews } from '@/lib/queries'
import { customers, site } from '@/lib/site'

export const revalidate = 300

const STRENGTHS = [
  {
    icon: Ship,
    title: 'นำเข้าโดยตรงจากผู้ผลิต',
    body: 'คัดเลือกโรงงานผู้ผลิตอุปกรณ์การแพทย์แผนจีน และนำเข้าเองทุกขั้นตอน จึงควบคุมคุณภาพและต้นทุนได้',
  },
  {
    icon: BadgeCheck,
    title: 'มาตรฐานสำหรับสถานพยาบาล',
    body: 'สินค้าปลอดเชื้อ ใช้ครั้งเดียว พร้อมเอกสารประกอบการจัดซื้อสำหรับโรงพยาบาลและคลินิก',
  },
  {
    icon: Hospital,
    title: 'เชี่ยวชาญงานโรงพยาบาล',
    body: 'เข้าใจขั้นตอนจัดซื้อของโรงพยาบาล ทั้งใบเสนอราคา เอกสารภาษี และการส่งมอบตามรอบ',
  },
  {
    icon: Truck,
    title: 'จัดส่งทั่วประเทศ',
    body: 'มีสต็อกพร้อมส่งสำหรับรายการที่ใช้ประจำ และรับสั่งจองล่วงหน้าสำหรับคำสั่งซื้อปริมาณมาก',
  },
]

const STEPS = [
  { n: '01', title: 'เลือกสินค้าจากแคตตาล็อก', body: 'กดเพิ่มสินค้าและระบุจำนวนที่ต้องการลงในรายการขอใบเสนอราคา' },
  { n: '02', title: 'เข้าสู่ระบบด้วย Google', body: 'บันทึกข้อมูลผู้เสียภาษีของหน่วยงานไว้ครั้งเดียว ใช้ได้กับทุกคำขอถัดไป' },
  { n: '03', title: 'รับใบเสนอราคา', body: 'ทีมงานตรวจสอบและติดต่อกลับพร้อมใบเสนอราคาตามข้อมูลที่ท่านให้ไว้' },
]

export default async function HomePage() {
  const [featured, categories, news] = await Promise.all([
    getFeaturedProducts(3),
    getCategories(),
    getNews(3),
  ])

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-navy">
        <div
          aria-hidden
          className="absolute -right-24 -top-16 size-[32rem] rounded-full bg-navy-700/40 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium tracking-wide text-gold-200">
              <Building2 className="size-3.5" />
              ผู้นำเข้าอุปกรณ์การแพทย์แผนจีน
            </span>
            <h1 className="mt-6 font-display text-4xl leading-tight font-semibold text-white sm:text-5xl">
              อุปกรณ์การแพทย์แผนจีน
              <br />
              <span className="text-gold">คุณภาพสำหรับสถานพยาบาล</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
              {site.nameTh} นำเข้าและจัดจำหน่ายเข็มฝังเข็ม เครื่องกระตุ้นไฟฟ้า และชุดครอบแก้ว
              ให้โรงพยาบาล คลินิก และศูนย์การแพทย์ทั่วประเทศ
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-medium text-navy-950 transition hover:bg-gold-300"
              >
                ดูแคตตาล็อกสินค้า <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 font-medium text-white transition hover:border-gold hover:text-gold"
              >
                <FileText className="size-4" /> ขอใบเสนอราคา
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-navy-200">
              <a href={site.phoneHref} className="inline-flex items-center gap-2 hover:text-gold">
                <Phone className="size-4 text-gold" /> {site.phone}
              </a>
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-gold"
              >
                <MessageCircle className="size-4 text-gold" /> LINE {site.lineId}
              </a>
            </div>
          </div>

          <div className="relative hidden justify-self-center md:block">
            <div className="absolute inset-0 -m-10 rounded-full bg-white/5 blur-2xl" />
            <Image
              src="/brand/logo-white.png"
              alt={site.nameEn}
              width={520}
              height={520}
              priority
              className="relative w-full max-w-sm"
            />
          </div>
        </div>
      </section>

      {/* จุดเด่น */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STRENGTHS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* หมวดสินค้า */}
      {categories.length > 0 && (
        <section className="border-y border-navy-100 bg-navy-50/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-2xl font-semibold text-navy">หมวดสินค้า</h2>
            <span className="rule-gold mt-3" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?cat=${c.slug}`}
                  className="group rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-gold"
                >
                  <h3 className="font-semibold text-navy">{c.name}</h3>
                  {c.description && (
                    <p className="mt-2 text-sm leading-relaxed text-navy-500">{c.description}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 transition group-hover:gap-2.5 group-hover:text-gold-700">
                    ดูสินค้า <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* สินค้าแนะนำ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy">สินค้าแนะนำ</h2>
              <span className="rule-gold mt-3" />
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-gold-700"
            >
              ดูทั้งหมด <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ขั้นตอน */}
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-white">ขอใบเสนอราคาใน 3 ขั้นตอน</h2>
          <span className="rule-gold mt-3" />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border-t border-white/15 pt-6">
                <span className="font-display text-3xl font-semibold text-gold">{s.n}</span>
                <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">{s.body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-medium text-navy-950 transition hover:bg-gold-300"
          >
            เริ่มเลือกสินค้า <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ลูกค้า */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-navy">ลูกค้าที่ไว้วางใจเรา</h2>
        <span className="rule-gold mt-3" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((name) => (
            <div
              key={name}
              className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3.5 text-sm text-navy-700"
            >
              <Hospital className="mt-0.5 size-4 shrink-0 text-gold" />
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ข่าว */}
      {news.length > 0 && (
        <section className="border-t border-navy-100 bg-navy-50/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-navy">ข่าวสารล่าสุด</h2>
                <span className="rule-gold mt-3" />
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-gold-700"
              >
                ข่าวทั้งหมด <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {news.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-gold"
                >
                  <time className="text-xs tracking-wide text-navy-400">
                    {formatDate(post.published_at ?? post.created_at)}
                  </time>
                  <h3 className="mt-2 font-semibold leading-snug text-navy">{post.title}</h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-500">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
