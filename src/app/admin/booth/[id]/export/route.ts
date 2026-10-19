import { NextResponse } from 'next/server'
import { BOOTH_QUESTIONS } from '@/lib/booth'
import { getSession, isAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { BoothEntry, BoothEvent } from '@/lib/types'

/** ใส่เครื่องหมายคำพูดตามรูปแบบ CSV และกัน Excel ตีความ = + - @ เป็นสูตร */
function csvCell(value: unknown) {
  const text = value == null ? '' : String(value)
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile)) {
    return new NextResponse('forbidden', { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const [{ data: eventRow }, { data: entryRows }] = await Promise.all([
    supabase.from('booth_events').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('booth_entries')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true }),
  ])

  const event = eventRow as BoothEvent | null
  if (!event) return new NextResponse('not found', { status: 404 })

  const entries = (entryRows as BoothEntry[]) ?? []
  const header = [
    'เลขที่สิทธิ์',
    'ชื่อ-นามสกุล',
    'หน่วยงาน',
    'ตำแหน่ง',
    'เบอร์โทร',
    'อีเมล',
    ...BOOTH_QUESTIONS.map((q) => q.label),
    'ผู้โชคดี',
    'ลงทะเบียนเมื่อ',
  ]

  const rows = entries.map((entry) => [
    entry.ticket_code,
    entry.full_name,
    entry.org_name,
    entry.role ?? '',
    entry.phone,
    entry.email ?? '',
    ...BOOTH_QUESTIONS.map((q) => {
      const value = entry.answers?.[q.key]
      return Array.isArray(value) ? value.join(' / ') : (value ?? '')
    }),
    entry.is_winner ? 'ใช่' : '',
    new Date(entry.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
  ])

  // BOM ให้ Excel บน Windows อ่านภาษาไทยถูก
  const csv =
    '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="booth-${event.slug}.csv"`,
    },
  })
}
