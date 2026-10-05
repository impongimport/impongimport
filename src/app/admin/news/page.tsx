import Link from 'next/link'
import { Plus } from 'lucide-react'
import { deleteNews } from '@/lib/actions/admin'
import { formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { NewsPost } from '@/lib/types'

export default async function AdminNews() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: true })

  const posts = (data as NewsPost[]) ?? []

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-navy">ข่าวสาร</h2>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700"
        >
          <Plus className="size-4" /> เขียนข่าวใหม่
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
          ยังไม่มีข่าว
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/news/${post.id}`}
                  className="font-medium text-navy hover:text-gold-700"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 text-sm text-navy-400">
                  {post.is_published ? formatDate(post.published_at ?? post.created_at) : 'ฉบับร่าง'}
                </p>
              </div>
              <form action={deleteNews}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="rounded-lg px-3 py-2 text-sm text-navy-300 transition hover:bg-red-50 hover:text-red-600"
                >
                  ลบ
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
