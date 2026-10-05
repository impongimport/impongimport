'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { Field } from './billing-fields'
import { ImageUpload } from './image-upload'
import { saveNews } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/billing'
import type { NewsPost } from '@/lib/types'

export function NewsForm({ post }: { post: NewsPost | null }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveNews, null)

  useEffect(() => {
    if (!state) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-8">
      {post && <input type="hidden" name="id" value={post.id} />}
      {post?.published_at && (
        <input type="hidden" name="published_at" value={post.published_at} />
      )}

      <div className="grid gap-5">
        <Field label="หัวข้อข่าว" name="title" defaultValue={post?.title} required />
        <Field
          label="slug (ใช้ใน URL)"
          name="slug"
          defaultValue={post?.slug}
          placeholder="new-product-2025"
          required
        />

        <label className="block">
          <span className="text-sm font-medium text-navy-600">คำโปรย</span>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={post?.excerpt ?? ''}
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy outline-none focus:border-gold"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-600">เนื้อหา</span>
          <textarea
            name="content"
            rows={12}
            defaultValue={post?.content ?? ''}
            placeholder="เว้นบรรทัดว่างระหว่างย่อหน้า"
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 leading-relaxed text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
        </label>

        <ImageUpload name="cover_url" defaultValue={post?.cover_url} folder="news" label="ภาพหน้าปก" />

        <label className="flex items-center gap-3 text-sm text-navy-600">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={post?.is_published ?? true}
            className="size-4 rounded border-navy-300 accent-[#1a344b]"
          />
          เผยแพร่บนเว็บไซต์
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Save className="size-4" />
      {pending ? 'กำลังบันทึก…' : 'บันทึกข่าว'}
    </button>
  )
}
