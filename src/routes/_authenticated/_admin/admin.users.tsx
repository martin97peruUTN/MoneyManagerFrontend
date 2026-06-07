import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '#/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { PageHeader } from '#/components/page-header'
import { EmptyState, ErrorState, LoadingRows } from '#/components/states'
import { useAdminUsers } from '#/hooks/use-admin'

export const Route = createFileRoute('/_authenticated/_admin/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const usersQuery = useAdminUsers()
  const users = usersQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="All registered users (admin)" />

      {usersQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : usersQuery.isError ? (
        <ErrorState error={usersQuery.error} />
      ) : users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.name} {user.lastname}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
