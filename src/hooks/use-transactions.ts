import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { DateRange, Transaction } from '#/types'

export type TransactionType = 'all' | 'expenses' | 'incomes'

function pathForType(type: TransactionType): string {
  if (type === 'expenses') return '/api/transactions/expenses'
  if (type === 'incomes') return '/api/transactions/incomes'
  return '/api/transactions'
}

export function useTransactions(range: DateRange, type: TransactionType) {
  return useQuery({
    queryKey: queryKeys.transactions(range, type),
    queryFn: () =>
      api<Transaction[]>({
        path: pathForType(type),
        query: { dateFrom: range.dateFrom, dateTo: range.dateTo },
      }),
  })
}

export interface TransactionInput {
  amount: number
  accountId: number
  transactionCategoryId: number
  comment?: string | null
  date?: string
}

function invalidateAfterMutation(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ['transactions'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TransactionInput) =>
      api({ path: '/api/transaction', method: 'POST', body: input }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TransactionInput> & { id: number }) =>
      api({ path: `/api/transaction/${id}`, method: 'PATCH', body: input }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/transaction/${id}`, method: 'DELETE' }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}
