'use client'

import { usePathname } from 'next/navigation'

/** หน้าที่ฉายขึ้นจอที่บูธ ไม่ต้องมีเมนูและฟุตเตอร์มาเบียดพื้นที่ */
const BARE_ROUTES = [/^\/booth\/[^/]+\/stats$/]

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (BARE_ROUTES.some((route) => route.test(pathname))) return null
  return <>{children}</>
}
