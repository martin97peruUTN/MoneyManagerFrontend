import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightLeft,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { PageHeader } from '#/components/page-header'
import { LoadingRows, ErrorState, EmptyState } from '#/components/states'
import { useAccounts } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { useTransactions } from '#/hooks/use-transactions'
import { useDateRange } from '#/lib/store'
import { formatMoney } from '#/lib/format'
import type { Currency } from '#/types'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const range = useDateRange()
  const accountsQuery = useAccounts()
  const currenciesQuery = useCurrencies()
  const expensesQuery = useTransactions(range, 'expenses')
  const incomesQuery = useTransactions(range, 'incomes')

  const currencyById = new Map<number, Currency>(
    (currenciesQuery.data ?? []).map((c) => [c.id, c]),
  )

  const accounts = accountsQuery.data ?? []

  const balancesByCurrency = new Map<number, number>()
  for (const account of accounts) {
    balancesByCurrency.set(
      account.currencyId,
      (balancesByCurrency.get(account.currencyId) ?? 0) + account.balance,
    )
  }

  const totalExpenses = (expensesQuery.data ?? []).reduce(
    (sum, t) => sum + t.amount,
    0,
  )
  const totalIncomes = (incomesQuery.data ?? []).reduce(
    (sum, t) => sum + t.amount,
    0,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your accounts and activity at a glance"
        actions={
          <Button asChild>
            <Link to="/transactions">
              <Plus className="mr-1 h-4 w-4" />
              New transaction
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {accountsQuery.isLoading ? (
              <LoadingRows rows={2} />
            ) : balancesByCurrency.size === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet</p>
            ) : (
              [...balancesByCurrency.entries()].map(([currencyId, total]) => (
                <p key={currencyId} className="text-2xl font-semibold">
                  {formatMoney(total, currencyById.get(currencyId))}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    {currencyById.get(currencyId)?.code}
                  </span>
                </p>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Income this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomesQuery.isLoading ? (
              <LoadingRows rows={1} />
            ) : (
              <p className="text-2xl font-semibold text-emerald-600">
                {formatMoney(totalIncomes)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Expenses this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expensesQuery.isLoading ? (
              <LoadingRows rows={1} />
            ) : (
              <p className="text-2xl font-semibold text-destructive">
                {formatMoney(totalExpenses)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link to="/accounts">
            <Wallet className="mr-1 h-4 w-4" />
            Add account
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/transactions">
            <Receipt className="mr-1 h-4 w-4" />
            Add transaction
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/transfers">
            <ArrowRightLeft className="mr-1 h-4 w-4" />
            New transfer
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Accounts</h2>
        {accountsQuery.isLoading ? (
          <LoadingRows rows={3} />
        ) : accountsQuery.isError ? (
          <ErrorState error={accountsQuery.error} />
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            description="Create your first account to start tracking your money."
            action={
              <Button asChild>
                <Link to="/accounts">Create account</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const currency = currencyById.get(account.currencyId)
              return (
                <Link
                  key={account.id}
                  to="/accounts/$accountId"
                  params={{ accountId: String(account.id) }}
                >
                  <Card className="transition-colors hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {account.name}
                        </CardTitle>
                        {currency && (
                          <Badge variant="outline">{currency.code}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold">
                        {formatMoney(account.balance, currency)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
