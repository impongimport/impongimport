import { stockLabel, stockTone } from '@/lib/format'
import type { StockStatus } from '@/lib/types'

export function StockBadge({ status, className = '' }: { status: StockStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${stockTone[status]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {stockLabel[status]}
    </span>
  )
}
