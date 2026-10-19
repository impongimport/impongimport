'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { BOOTH_QUESTIONS } from '@/lib/booth'
import { submitBoothEntry } from '@/lib/actions/booth'
import type { ActionResult } from '@/lib/billing'
import { site } from '@/lib/site'

export function BoothForm({ slug }: { slug: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    submitBoothEntry,
    null
  )

  useEffect(() => {
    if (state && !state.ok) toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="slug" value={slug} />

      <section>
        <h2 className="font-display text-lg font-semibold text-navy">ข้อมูลผู้ร่วมงาน</h2>
        <span className="rule-gold mt-2" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Text label="ชื่อ – นามสกุล" name="full_name" required autoComplete="name" />
          <Text
            label="เบอร์โทรศัพท์"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            help="ใช้ยืนยันตัวตนตอนจับฉลาก"
          />
          <Text
            label="หน่วยงาน / คลินิก / โรงพยาบาล"
            name="org_name"
            required
            autoComplete="organization"
            className="sm:col-span-2"
          />
          <Text label="ตำแหน่ง / แผนก" name="role" autoComplete="organization-title" />
          <Text
            label="อีเมล"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            help="ไม่บังคับ ใช้ส่งแคตตาล็อกและใบเสนอราคา"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy">แบบสอบถามสั้น ๆ</h2>
        <span className="rule-gold mt-2" />
        <div className="mt-5 space-y-6">
          {BOOTH_QUESTIONS.map((q) => (
            <fieldset key={q.key}>
              <legend className="font-medium text-navy">
                {q.label} {q.required && <span className="text-gold-600">*</span>}
              </legend>
              {q.help && <p className="mt-1 text-sm text-navy-400">{q.help}</p>}
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {q.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-navy transition has-checked:border-gold has-checked:bg-gold-50"
                  >
                    <input
                      type={q.type === 'multi' ? 'checkbox' : 'radio'}
                      name={q.key}
                      value={option}
                      className="size-4.5 shrink-0 accent-[#1a344b]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <label className="flex items-start gap-3 rounded-2xl bg-navy-50 p-5 text-sm leading-relaxed text-navy-600">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-[#1a344b]"
        />
        <span>
          ยินยอมให้ {site.nameTh} เก็บชื่อ เบอร์โทร และอีเมล เพื่อติดต่อกลับเรื่องสินค้า
          และใช้สิทธิ์ร่วมจับฉลาก ตาม
          <Link href="/privacy" target="_blank" className="mx-1 text-navy underline">
            นโยบายความเป็นส่วนตัว
          </Link>
          <span className="text-gold-600">*</span>
        </span>
      </label>

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
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-4 text-lg font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Send className="size-5" />
      {pending ? 'กำลังส่ง…' : 'ส่งแบบสอบถาม รับสิทธิ์จับฉลาก'}
    </button>
  )
}

function Text({
  label,
  name,
  required,
  type = 'text',
  inputMode,
  autoComplete,
  help,
  className = '',
}: {
  label: string
  name: string
  required?: boolean
  type?: string
  inputMode?: 'text' | 'tel' | 'email'
  autoComplete?: string
  help?: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-navy-600">
        {label} {required && <span className="text-gold-600">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-navy outline-none focus:border-gold"
      />
      {help && <span className="mt-1.5 block text-xs text-navy-400">{help}</span>}
    </label>
  )
}
