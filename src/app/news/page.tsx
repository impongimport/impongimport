import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { getNews } from '@/lib/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'ข่าวสารและประกาศ',
  description: 'ข่าวสาร ประกาศ และความเคลื่อนไหวของบริษัท อิมผ่ง อิมพอร์ต จำกัด',
}

export default async function NewsPage() {
  const posts = await getNews()

  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-navy">ข่าวสารและประกาศ</h1>
          <span className="rule-gold mt-3" />
          <p className="mt-4 leading-relaxed text-navy-500">
            ความเคลื่อนไหวของบริษัท สินค้าใหม่ และประกาศถึงลูกค้า
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
            ยังไม่มีข่าวสาร
          </p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex gap-6 rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-gold"
              >
                {post.cover_url && (
                  <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-xl sm:block">
                    <Image
                      src={post.cover_url}
                      alt={post.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <time className="text-xs tracking-wide text-navy-400">
                    {formatDate(post.published_at ?? post.created_at)}
                  </time>
                  <h2 className="mt-1.5 font-semibold text-navy group-hover:text-gold-700">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-500">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
