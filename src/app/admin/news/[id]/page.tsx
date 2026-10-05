import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { NewsForm } from '@/components/news-form'
import { createClient } from '@/lib/supabase/server'
import type { NewsPost } from '@/lib/types'

export default async function AdminNewsEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let post: NewsPost | null = null
  if (id !== 'new') {
    const supabase = await createClient()
    const { data } = await supabase.from('news').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    post = data as NewsPost
  }

  return (
    <>
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> ข่าวทั้งหมด
      </Link>
      <h2 className="mt-5 font-display text-xl font-semibold text-navy">
        {post ? post.title : 'เขียนข่าวใหม่'}
      </h2>
      <div className="mt-6">
        <NewsForm post={post} />
      </div>
    </>
  )
}
