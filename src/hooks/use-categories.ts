import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { TransactionCategory } from '#/types'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () =>
      api<TransactionCategory[]>({ path: '/api/transactionCategories' }),
  })
}

export interface CategoryInput {
  name: string
  isExpense: boolean
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      api<TransactionCategory>({
        path: '/api/transactionCategory',
        method: 'POST',
        body: input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CategoryInput> & { id: number }) =>
      api<TransactionCategory>({
        path: `/api/transactionCategory/${id}`,
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/transactionCategory/${id}`, method: 'DELETE' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}
