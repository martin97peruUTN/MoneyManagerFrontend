import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { PageHeader } from '#/components/page-header'
import { EmptyState, ErrorState, LoadingRows } from '#/components/states'
import { CurrencyDialog } from '#/components/currencies/currency-dialog'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useCurrencies, useDeleteCurrency } from '#/hooks/use-currencies'
import { ApiError } from '#/lib/api'

export const Route = createFileRoute('/_authenticated/_admin/admin/currencies')({
  component: AdminCurrenciesPage,
})

function AdminCurrenciesPage() {
  const currenciesQuery = useCurrencies()
  const deleteCurrency = useDeleteCurrency()
  const currencies = currenciesQuery.data ?? []

  const handleDelete = async (id: number) => {
    try {
      await deleteCurrency.mutateAsync(id)
      toast.success('Currency deleted')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currencies"
        description="Manage the currencies available to all users (admin)"
        actions={
          <CurrencyDialog
            trigger={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New currency
              </Button>
            }
          />
        }
      />

      {currenciesQuery.isLoading ? (
        <LoadingRows rows={5} />
      ) : currenciesQuery.isError ? (
        <ErrorState error={currenciesQuery.error} />
      ) : currencies.length === 0 ? (
        <EmptyState title="No currencies" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CurrencyDialog
                        currency={currency}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title="Delete currency?"
                        description={`"${currency.name}" will be removed.`}
                        onConfirm={() => void handleDelete(currency.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
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
