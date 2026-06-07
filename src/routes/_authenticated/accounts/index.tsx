import { createFileRoute, Link } from '@tanstack/react-router'
import { MoreVertical, Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { PageHeader } from '#/components/page-header'
import { EmptyState, ErrorState, LoadingRows } from '#/components/states'
import { AccountDialog } from '#/components/accounts/account-dialog'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useAccounts, useDeleteAccount } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { formatMoney } from '#/lib/format'
import { ApiError } from '#/lib/api'
import type { Currency } from '#/types'

export const Route = createFileRoute('/_authenticated/accounts/')({
  component: AccountsPage,
})

function AccountsPage() {
  const accountsQuery = useAccounts()
  const currenciesQuery = useCurrencies()
  const deleteAccount = useDeleteAccount()

  const currencyById = new Map<number, Currency>(
    (currenciesQuery.data ?? []).map((c) => [c.id, c]),
  )

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount.mutateAsync(id)
      toast.success('Account deleted')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  const accounts = accountsQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage the accounts you track"
        actions={
          <AccountDialog
            trigger={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New account
              </Button>
            }
          />
        }
      />

      {accountsQuery.isLoading ? (
        <LoadingRows rows={4} />
      ) : accountsQuery.isError ? (
        <ErrorState error={accountsQuery.error} />
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start tracking your money."
          icon={Wallet}
          action={
            <AccountDialog
              trigger={<Button>Create account</Button>}
            />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const currency = currencyById.get(account.currencyId)
            return (
              <Card key={account.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      <Link
                        to="/accounts/$accountId"
                        params={{ accountId: String(account.id) }}
                        className="hover:underline"
                      >
                        {account.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {currency && (
                        <Badge variant="outline">{currency.code}</Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AccountDialog
                            account={account}
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            }
                          />
                          <ConfirmDialog
                            title="Delete account?"
                            description={`"${account.name}" and its association will be removed.`}
                            onConfirm={() => void handleDelete(account.id)}
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {formatMoney(account.balance, currency)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
