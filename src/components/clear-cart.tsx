'use client'

import { useEffect } from 'react'
import { useQuoteCart } from './quote-cart'

/** ล้างตะกร้าหลังส่งคำขอสำเร็จ (หน้าผลลัพธ์เป็น server component) */
export function ClearCart() {
  const { clear, ready } = useQuoteCart()
  useEffect(() => {
    if (ready) clear()
  }, [ready, clear])
  return null
}
