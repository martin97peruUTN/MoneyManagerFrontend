import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
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
import { ErrorState, LoadingRows } from '#/components/states'
import { AccountDialog } from '#/components/accounts/account-dialog'
import { useAccount, useAccounts } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { useCategories } from '#/hooks/use-categories'
import { useTransactions } from '#/hooks/use-transactions'
import { useAccountTransfers } from '#/hooks/use-transfers'
import { useDateRange } from '#/lib/store'
import { formatDate, formatMoney } from '#/lib/format'

export const Route = createFileRoute('/_authenticated/accounts/$accountId')({
  component: AccountDetailPage,
})

function AccountDetailPage() {
  const { accountId } = Route.useParams()
  const id = Number(accountId)
  const range = useDateRange()

  const accountQuery = useAccount(id)
  const currenciesQuery = useCurrencies()
  const accountsQuery = useAccounts()
  const categoriesQuery = useCategories()
  const transactionsQuery = useTransactions(range, 'all')
  const transfersQuery = useAccountTransfers(id, range)

  const currency = currenciesQuery.data?.find(
    (c) => c.id === accountQuery.data?.currencyId,
  )
  const categoryById = new Map(
    (categoriesQuery.data ?? []).map((c) => [c.id, c]),
  )
  const accountById = new Map((accountsQuery.data ?? []).map((a) => [a.id, a]))

  const accountTransactions = (transactionsQuery.data ?? []).filter(
    (t) => t.accountId === id,
  )

  if (accountQuery.isLoading) return <LoadingRows rows={4} />
  if (accountQuery.isError) return <ErrorState error={accountQuery.error} />
  if (!accountQuery.data) return null

  const account = accountQuery.data

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/accounts">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Accounts
        </Link>
      </Button>

      <PageHeader
        title={account.name}
        actions={
          <AccountDialog
            account={account}
            trigger={
              <Button variant="outline">
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
            }
          />
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            Current balance
            {currency && <Badge variant="outline">{currency.code}</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {formatMoney(account.balance, currency)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <CardDescription>
            {range.dateFrom} to {range.dateTo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <LoadingRows rows={3} />
          ) : accountTransactions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No transactions in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTransactions.map((t) => {
                  const category = categoryById.get(t.transactionCategoryId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell>{category?.name ?? '—'}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          category?.isExpense
                            ? 'text-destructive'
                            : 'text-emerald-600'
                        }`}
                      >
                        {category?.isExpense ? '-' : '+'}
                        {formatMoney(t.amount, currency)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent transfers</CardTitle>
          <CardDescription>
            {range.dateFrom} to {range.dateTo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfersQuery.isLoading ? (
            <LoadingRows rows={3} />
          ) : (transfersQuery.data ?? []).length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No transfers in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transfersQuery.data ?? []).map((transfer) => {
                  const outgoing = transfer.originAccountId === id
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>{formatDate(transfer.date)}</TableCell>
                      <TableCell>
                        {transfer.originAccountId
                          ? (accountById.get(transfer.originAccountId)?.name ??
                            '—')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {transfer.destinyAccountId
                          ? (accountById.get(transfer.destinyAccountId)?.name ??
                            '—')
                          : '—'}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          outgoing ? 'text-destructive' : 'text-emerald-600'
                        }`}
                      >
                        {outgoing ? '-' : '+'}
                        {formatMoney(
                          outgoing ? transfer.amount : transfer.destinyAmount,
                          currency,
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
