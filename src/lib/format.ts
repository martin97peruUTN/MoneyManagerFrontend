import type { Currency } from '#/types'

/** Format a Date as a local `YYYY-MM-DD` string (no timezone shift). */
export function formatYmd(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** First and last day of the current month as `YYYY-MM-DD`. */
export function currentMonthRange(): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { dateFrom: formatYmd(first), dateTo: formatYmd(last) }
}

/** Human-readable date for tables. */
export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMoney(amount: number, currency?: Currency): string {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  if (!currency) return formatted
  return `${currency.symbol}${formatted}`
}
