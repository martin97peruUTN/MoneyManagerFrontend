import { createFileRoute } from '@tanstack/react-router'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
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
import { TransferDialog } from '#/components/transfers/transfer-dialog'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useDeleteTransfer, useTransfers } from '#/hooks/use-transfers'
import { useAccounts } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { useDateRange } from '#/lib/store'
import { formatDate, formatMoney } from '#/lib/format'
import { ApiError } from '#/lib/api'

export const Route = createFileRoute('/_authenticated/transfers')({
  component: TransfersPage,
})

function TransfersPage() {
  const range = useDateRange()
  const transfersQuery = useTransfers(range)
  const accountsQuery = useAccounts()
  const currenciesQuery = useCurrencies()
  const deleteTransfer = useDeleteTransfer()

  const accountById = new Map((accountsQuery.data ?? []).map((a) => [a.id, a]))
  const currencyById = new Map(
    (currenciesQuery.data ?? []).map((c) => [c.id, c]),
  )

  const currencyForAccount = (accountId: number | null) => {
    if (accountId == null) return undefined
    const account = accountById.get(accountId)
    return account ? currencyById.get(account.currencyId) : undefined
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTransfer.mutateAsync(id)
      toast.success('Transfer deleted')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  const transfers = transfersQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfers"
        description="Move money between your accounts"
        actions={
          <TransferDialog
            trigger={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New transfer
              </Button>
            }
          />
        }
      />

      <div className="flex justify-end">
        <DateRangeFilter />
      </div>

      {transfersQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : transfersQuery.isError ? (
        <ErrorState error={transfersQuery.error} />
      ) : transfers.length === 0 ? (
        <EmptyState
          title="No transfers"
          description="No transfers for the selected period."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => {
                const originCurrency = currencyForAccount(
                  transfer.originAccountId,
                )
                const destinyCurrency = currencyForAccount(
                  transfer.destinyAccountId,
                )
                const crossCurrency =
                  originCurrency &&
                  destinyCurrency &&
                  originCurrency.id !== destinyCurrency.id
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
                    <TableCell className="text-right font-medium">
                      {formatMoney(transfer.amount, originCurrency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {crossCurrency
                        ? formatMoney(transfer.destinyAmount, destinyCurrency)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transfer.comment || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <TransferDialog
                              transfer={transfer}
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
                              title="Delete transfer?"
                              description="Both account balances will be adjusted accordingly."
                              onConfirm={() => void handleDelete(transfer.id)}
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
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
