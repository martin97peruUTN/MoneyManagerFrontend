import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { DateRange, Transfer } from '#/types'

export function useTransfers(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.transfers(range),
    queryFn: () =>
      api<Transfer[]>({
        path: '/api/transfers',
        query: { dateFrom: range.dateFrom, dateTo: range.dateTo },
      }),
  })
}

export function useAccountTransfers(accountId: number, range: DateRange) {
  return useQuery({
    queryKey: queryKeys.accountTransfers(accountId, range),
    queryFn: () =>
      api<Transfer[]>({
        path: `/api/transfers/account/${accountId}`,
        query: { dateFrom: range.dateFrom, dateTo: range.dateTo },
      }),
    enabled: Number.isFinite(accountId),
  })
}

export interface TransferInput {
  amount: number
  destinyAmount: number
  originAccountId: number
  destinyAccountId: number
  comment?: string | null
  date?: string
}

function invalidateAfterMutation(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ['transfers'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TransferInput) =>
      api({ path: '/api/transfer', method: 'POST', body: input }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TransferInput> & { id: number }) =>
      api({ path: `/api/transfer/${id}`, method: 'PATCH', body: input }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/transfer/${id}`, method: 'DELETE' }),
    onSuccess: () => invalidateAfterMutation(queryClient),
  })
}
