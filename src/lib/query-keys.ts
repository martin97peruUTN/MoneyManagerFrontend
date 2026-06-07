import type { DateRange } from '#/types'

export const queryKeys = {
  me: ['me'] as const,
  accounts: ['accounts'] as const,
  account: (id: number) => ['account', id] as const,
  currencies: ['currencies'] as const,
  categories: ['categories'] as const,
  transactions: (range: DateRange, type: 'all' | 'expenses' | 'incomes') =>
    ['transactions', { ...range, type }] as const,
  accountTransfers: (id: number, range: DateRange) =>
    ['transfers', 'account', id, range] as const,
  transfers: (range: DateRange) => ['transfers', range] as const,
  adminUsers: ['admin', 'users'] as const,
}
