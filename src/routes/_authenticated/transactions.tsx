import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { ArrowUpDown, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { PageHeader } from '#/components/page-header'
import { DateRangeFilter } from '#/components/date-range-filter'
import { EmptyState, ErrorState, LoadingRows } from '#/components/states'
import { TransactionDialog } from '#/components/transactions/transaction-dialog'
import { ConfirmDialog } from '#/components/confirm-dialog'
import {
  useDeleteTransaction,
  useTransactions,
} from '#/hooks/use-transactions'
import type { TransactionType } from '#/hooks/use-transactions'
import { useAccounts } from '#/hooks/use-accounts'
import { useCategories } from '#/hooks/use-categories'
import { useCurrencies } from '#/hooks/use-currencies'
import { useDateRange } from '#/lib/store'
import { formatDate, formatMoney } from '#/lib/format'
import { ApiError } from '#/lib/api'
import type { Account, Currency, Transaction, TransactionCategory } from '#/types'

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const range = useDateRange()
  const [type, setType] = useState<TransactionType>('all')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ])

  const transactionsQuery = useTransactions(range, type)
  const accountsQuery = useAccounts()
  const categoriesQuery = useCategories()
  const currenciesQuery = useCurrencies()
  const deleteTransaction = useDeleteTransaction()

  const accountById = useMemo(
    () => new Map<number, Account>((accountsQuery.data ?? []).map((a) => [a.id, a])),
    [accountsQuery.data],
  )
  const categoryById = useMemo(
    () =>
      new Map<number, TransactionCategory>(
        (categoriesQuery.data ?? []).map((c) => [c.id, c]),
      ),
    [categoriesQuery.data],
  )
  const currencyById = useMemo(
    () =>
      new Map<number, Currency>(
        (currenciesQuery.data ?? []).map((c) => [c.id, c]),
      ),
    [currenciesQuery.data],
  )

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction.mutateAsync(id)
      toast.success('Transaction deleted')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = categoryById.get(row.original.transactionCategoryId)
          if (!category) return '—'
          return (
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
              <Badge
                variant="outline"
                className={
                  category.isExpense
                    ? 'border-destructive/40 text-destructive'
                    : 'border-emerald-600/40 text-emerald-600'
                }
              >
                {category.isExpense ? 'Expense' : 'Income'}
              </Badge>
            </div>
          )
        },
      },
      {
        id: 'account',
        header: 'Account',
        cell: ({ row }) =>
          row.original.accountId
            ? (accountById.get(row.original.accountId)?.name ?? '—')
            : '—',
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.comment || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const category = categoryById.get(row.original.transactionCategoryId)
          const account = row.original.accountId
            ? accountById.get(row.original.accountId)
            : undefined
          const currency = account
            ? currencyById.get(account.currencyId)
            : undefined
          const isExpense = category?.isExpense
          return (
            <span
              className={`font-medium ${
                isExpense ? 'text-destructive' : 'text-emerald-600'
              }`}
            >
              {isExpense ? '-' : '+'}
              {formatMoney(row.original.amount, currency)}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <TransactionDialog
                  transaction={row.original}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <ConfirmDialog
                  title="Delete transaction?"
                  description="The account balance will be adjusted accordingly."
                  onConfirm={() => void handleDelete(row.original.id)}
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
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountById, categoryById, currencyById],
  )

  const table = useReactTable({
    data: transactionsQuery.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Track your incomes and expenses"
        actions={
          <TransactionDialog
            trigger={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New transaction
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="incomes">Incomes</TabsTrigger>
          </TabsList>
        </Tabs>
        <DateRangeFilter />
      </div>

      {transactionsQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : transactionsQuery.isError ? (
        <ErrorState error={transactionsQuery.error} />
      ) : (transactionsQuery.data ?? []).length === 0 ? (
        <EmptyState
          title="No transactions"
          description="No transactions for the selected period."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
