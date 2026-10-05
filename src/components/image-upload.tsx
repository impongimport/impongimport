'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/** อัปโหลดรูปเข้า bucket `media` แล้วเก็บ public URL ไว้ใน hidden input */
export function ImageUpload({
  name,
  defaultValue,
  folder,
  label = 'รูปภาพ',
}: {
  name: string
  defaultValue?: string | null
  folder: string
  label?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setBusy(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from('media').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })
    setBusy(false)

    if (error) {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message)
      return
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    setUrl(data.publicUrl)
    toast.success('อัปโหลดรูปแล้ว')
  }

  return (
    <div>
      <span className="text-sm font-medium text-navy-600">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="mt-2 flex items-start gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-navy-200 bg-navy-50">
          {url ? (
            <>
              <Image src={url} alt="" fill sizes="112px" className="object-cover" />
              <button
                type="button"
                onClick={() => setUrl('')}
                aria-label="ลบรูป"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white/90 text-navy-500 hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="grid h-full place-items-center text-navy-200">
              <ImagePlus className="size-7" strokeWidth={1.25} />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy transition hover:border-gold disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {busy ? 'กำลังอัปโหลด…' : 'เลือกรูป'}
          </button>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="หรือวาง URL รูปภาพ"
            className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-2.5 text-sm text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
        </div>
      </div>
    </div>
  )
}
