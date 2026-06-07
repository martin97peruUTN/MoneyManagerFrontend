import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { Account } from '#/types'

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => api<Account[]>({ path: '/api/accounts' }),
  })
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: queryKeys.account(id),
    queryFn: () => api<Account>({ path: `/api/account/${id}` }),
    enabled: Number.isFinite(id),
  })
}

export interface AccountInput {
  name: string
  currencyId: number
  balance?: number
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AccountInput) =>
      api<Account>({ path: '/api/account', method: 'POST', body: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<AccountInput> & { id: number }) =>
      api<Account>({ path: `/api/account/${id}`, method: 'PATCH', body: input }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.account(variables.id),
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/account/${id}`, method: 'DELETE' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  })
}
