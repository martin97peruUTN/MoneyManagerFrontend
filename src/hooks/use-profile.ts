import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { SessionUser } from '#/types'

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<SessionUser>({ path: '/api/user/me' }),
  })
}

export interface ProfileInput {
  name?: string
  lastname?: string
  password?: string
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: ProfileInput & { id: number }) =>
      api<SessionUser>({ path: `/api/user/${id}`, method: 'PATCH', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  })
}

export function useDeleteProfile() {
  return useMutation({
    mutationFn: (id: number) =>
      api({ path: `/api/user/${id}`, method: 'DELETE' }),
  })
}
