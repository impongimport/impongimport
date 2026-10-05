'use client'

import { useCallback, useSyncExternalStore } from 'react'
import toast from 'react-hot-toast'

export type CartItem = {
  productId: string
  slug: string
  name: string
  variantId?: string | null
  variantName?: string | null
  quantity: number
}

type Snapshot = { items: CartItem[]; ready: boolean }

const STORAGE_KEY = 'impong.quote-cart.v1'

/** คีย์ของบรรทัดในตะกร้า — สินค้าเดียวกันคนละขนาดนับเป็นคนละบรรทัด */
export function itemKey(item: Pick<CartItem, 'productId' | 'variantId'>) {
  return `${item.productId}::${item.variantId ?? ''}`
}

// ───── ตะกร้าเก็บนอก React เพื่อให้แชร์ข้ามคอมโพเนนต์และอ่าน localStorage ได้ครั้งเดียว ─────
const SERVER_SNAPSHOT: Snapshot = { items: [], ready: false }
let snapshot: Snapshot = { items: [], ready: false }
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function hydrate() {
  if (hydrated) return
  hydrated = true
  let items: CartItem[] = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) items = JSON.parse(raw) as CartItem[]
  } catch {
    // localStorage ใช้ไม่ได้ (โหมดส่วนตัว) — เริ่มด้วยตะกร้าว่าง
  }
  snapshot = { items, ready: true }
}

function setItems(next: CartItem[]) {
  snapshot = { items: next, ready: true }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // เขียนไม่ได้ก็ให้ตะกร้าอยู่แค่ในแท็บนี้
  }
  emit()
}

function subscribe(listener: () => void) {
  // ครั้งแรกที่มีคนใช้ตะกร้า ค่อยอ่านจาก localStorage (รันเฉพาะฝั่ง client)
  hydrate()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useQuoteCart() {
  const { items, ready } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT
  )

  const add = useCallback((item: CartItem) => {
    const key = itemKey(item)
    const found = snapshot.items.find((i) => itemKey(i) === key)
    setItems(
      found
        ? snapshot.items.map((i) =>
            itemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i
          )
        : [...snapshot.items, item]
    )
    toast.success('เพิ่มลงรายการขอใบเสนอราคาแล้ว')
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems(
      snapshot.items.map((i) =>
        itemKey(i) === key ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    )
  }, [])

  const remove = useCallback((key: string) => {
    setItems(snapshot.items.filter((i) => itemKey(i) !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  return { items, ready, count: items.length, add, setQuantity, remove, clear }
}
