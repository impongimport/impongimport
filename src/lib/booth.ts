/**
 * แบบสอบถามที่ใช้ในงานออกบูธ
 *
 * ชุดคำถามอยู่ในโค้ด ไม่ได้ทำตัวสร้างฟอร์มในหน้าแอดมิน — งานบูธหนึ่งครั้ง
 * ใช้คำถามชุดเดียว ถ้างานถัดไปอยากเปลี่ยนคำถาม แก้ไฟล์นี้แล้ว deploy ใหม่
 * `key` ของแต่ละข้อถูกใช้เป็นคีย์ใน `booth_entries.answers` และในฟังก์ชัน
 * `booth_stats()` ฝั่ง Supabase ด้วย — เปลี่ยนแล้วต้องแก้ทั้งสองที่
 */

export type BoothQuestion = {
  key: string
  label: string
  help?: string
  type: 'single' | 'multi'
  required: boolean
  options: string[]
}

export const BOOTH_QUESTIONS: BoothQuestion[] = [
  {
    key: 'needle_type',
    label: 'เข็มที่ถนัดใช้เป็นแบบไหน',
    type: 'single',
    required: true,
    options: ['เข็มแผง (ไม่มีปลอกนำ)', 'เข็มปลอก (มีปลอกนำ)', 'ใช้ทั้งสองแบบ'],
  },
  {
    key: 'handle',
    label: 'ด้ามเข็มที่ใช้ประจำ',
    type: 'single',
    required: true,
    options: ['ด้ามสแตนเลส', 'ด้ามทองแดง', 'ใช้ทั้งสองแบบ'],
  },
  {
    key: 'sizes',
    label: 'ขนาดที่ใช้บ่อย',
    help: 'เลือกได้มากกว่า 1 ข้อ',
    type: 'multi',
    required: true,
    options: ['0.16 x 13 mm', '0.25 x 25 mm', '0.25 x 40 mm', '0.30 x 75 mm', 'ขนาดอื่น'],
  },
  {
    key: 'interests',
    label: 'สนใจให้ทีมงานติดต่อกลับเรื่อง',
    help: 'ไม่บังคับ เลือกได้มากกว่า 1 ข้อ',
    type: 'multi',
    required: false,
    options: ['ขอใบเสนอราคา', 'ขอตัวอย่างสินค้า', 'ข้อมูลสินค้าเพิ่มเติม'],
  },
]

export type BoothAnswers = Record<string, string | string[]>

/** อ่านคำตอบจากฟอร์ม + ตรวจข้อบังคับ คืน error ข้อความไทยถ้ายังไม่ครบ */
export function readAnswers(formData: FormData): { answers: BoothAnswers; error: string | null } {
  const answers: BoothAnswers = {}

  for (const q of BOOTH_QUESTIONS) {
    if (q.type === 'multi') {
      const picked = formData
        .getAll(q.key)
        .map((v) => String(v))
        .filter((v) => q.options.includes(v))
      if (q.required && picked.length === 0) {
        return { answers, error: `กรุณาเลือก “${q.label}” อย่างน้อย 1 ข้อ` }
      }
      if (picked.length > 0) answers[q.key] = picked
    } else {
      const picked = String(formData.get(q.key) ?? '')
      if (!q.options.includes(picked)) {
        if (q.required) return { answers, error: `กรุณาเลือก “${q.label}”` }
        continue
      }
      answers[q.key] = picked
    }
  }

  return { answers, error: null }
}

/** สรุปคำตอบเป็นข้อความบรรทัดเดียวต่อข้อ ใช้ในตารางแอดมินและโน้ตใบเสนอราคา */
export function summarizeAnswers(answers: BoothAnswers | null | undefined): string[] {
  if (!answers) return []
  return BOOTH_QUESTIONS.flatMap((q) => {
    const value = answers[q.key]
    if (!value || (Array.isArray(value) && value.length === 0)) return []
    return [`${q.label}: ${Array.isArray(value) ? value.join(', ') : value}`]
  })
}

/** 0884993473 → 088-499-3473 */
export function formatPhone(raw?: string | null) {
  if (!raw) return '—'
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`
  return raw
}
