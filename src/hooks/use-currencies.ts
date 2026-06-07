import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { Currency } from '#/types'

export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.currencies,
    queryFn: () => api<Currency[]>({ path: '/api/currencies' }),
  })
}

interface CurrencyInput {
  name: string
  symbol: string
  code: string
}

export function useCreateCurrency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CurrencyInput) =>
      api<Currency>({ path: '/api/admin/currency', method: 'POST', body: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  })
}

export function useUpdateCurrency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: CurrencyInput & { id: number }) =>
      api<Currency>({
        path: `/api/admin/currency/${id}`,
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  })
}

export function useDeleteCurrency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/admin/currency/${id}`, method: 'DELETE' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
  })
}
