import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { hasSupabase } from './supabase/public'
import type { Profile } from './types'

export type Session = { userId: string; email: string | null; profile: Profile | null }

/** ผู้ใช้ปัจจุบัน + โปรไฟล์ (null ถ้ายังไม่ล็อกอิน) */
export async function getSession(): Promise<Session | null> {
  // ยังไม่ได้ตั้ง env (เช่นตอน build ครั้งแรก) — ถือว่ายังไม่ล็อกอิน
  if (!hasSupabase) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return { userId: user.id, email: user.email ?? null, profile: (profile as Profile) ?? null }
}

export function isAdmin(profile: Profile | null | undefined) {
  return profile?.role === 'admin' || profile?.role === 'superadmin'
}

export async function requireSession(next = '/me'): Promise<Session> {
  const session = await getSession()
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`)
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession('/admin')
  if (!isAdmin(session.profile)) redirect('/')
  return session
}
