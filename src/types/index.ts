export type Role = 'User' | 'Admin'

export interface SessionUser {
  id: number
  username: string
  name: string
  lastname: string
  role: Role
}

export interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

export interface Account {
  id: number
  name: string
  balance: number
  currencyId: number
  userId: number
}

export interface TransactionCategory {
  id: number
  name: string
  isExpense: boolean
  public: boolean
  userId: number | null
}

export interface Transaction {
  id: number
  amount: number
  comment: string | null
  date: string
  accountId: number | null
  transactionCategoryId: number
}

export interface Transfer {
  id: number
  amount: number
  destinyAmount: number
  comment: string | null
  date: string
  originAccountId: number | null
  destinyAccountId: number | null
}

export interface AdminUser {
  id: number
  username: string
  name: string
  lastname: string
  role: Role
}

/** Date range used by the transactions/transfers filters (YYYY-MM-DD). */
export interface DateRange {
  dateFrom: string
  dateTo: string
}
