import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { queryKeys } from '#/lib/query-keys'
import type { AdminUser } from '#/types'

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => api<AdminUser[]>({ path: '/api/admin/user' }),
  })
}
