import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { getNewsPost, getNewsSlugs } from '@/lib/queries'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getNewsSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsPost(slug)
  if (!post) return { title: 'ไม่พบข่าว' }
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsPost(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> ข่าวทั้งหมด
      </Link>

      <time className="mt-8 block text-sm tracking-wide text-navy-400">
        {formatDate(post.published_at ?? post.created_at)}
      </time>
      <h1 className="mt-2 font-display text-3xl leading-tight font-semibold text-navy">
        {post.title}
      </h1>
      <span className="rule-gold mt-5" />

      {post.cover_url && (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-2xl border border-navy-100">
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 768px, 90vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-8 text-lg leading-relaxed font-medium text-navy-700">{post.excerpt}</p>
      )}

      {post.content && (
        <div className="prose-impong mt-6">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </article>
  )
}
