import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { FieldError } from '#/components/form/field-error'
import { useAccounts } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { useCreateTransfer, useUpdateTransfer } from '#/hooks/use-transfers'
import { ApiError } from '#/lib/api'
import { formatYmd } from '#/lib/format'
import type { Transfer } from '#/types'

export function TransferDialog({
  transfer,
  trigger,
}: {
  transfer?: Transfer
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isEdit = Boolean(transfer)
  const accountsQuery = useAccounts()
  const currenciesQuery = useCurrencies()
  const createTransfer = useCreateTransfer()
  const updateTransfer = useUpdateTransfer()

  const accounts = accountsQuery.data ?? []
  const currencyById = new Map(
    (currenciesQuery.data ?? []).map((c) => [c.id, c]),
  )

  const form = useForm({
    defaultValues: {
      originAccountId: transfer?.originAccountId
        ? String(transfer.originAccountId)
        : '',
      destinyAccountId: transfer?.destinyAccountId
        ? String(transfer.destinyAccountId)
        : '',
      amount: transfer ? String(transfer.amount) : '',
      destinyAmount: transfer ? String(transfer.destinyAmount) : '',
      comment: transfer?.comment ?? '',
      date: transfer
        ? formatYmd(new Date(transfer.date))
        : formatYmd(new Date()),
    },
    onSubmit: async ({ value }) => {
      const originId = Number(value.originAccountId)
      const destinyId = Number(value.destinyAccountId)
      if (originId === destinyId) {
        toast.error('Origin and destination must be different accounts')
        return
      }
      const origin = accounts.find((a) => a.id === originId)
      const destiny = accounts.find((a) => a.id === destinyId)
      const sameCurrency =
        origin && destiny && origin.currencyId === destiny.currencyId
      const amount = Number(value.amount)
      const destinyAmount = sameCurrency
        ? amount
        : Number(value.destinyAmount)

      const payload = {
        originAccountId: originId,
        destinyAccountId: destinyId,
        amount,
        destinyAmount,
        comment: value.comment.trim() || null,
        date: new Date(value.date).toISOString(),
      }
      try {
        if (transfer) {
          await updateTransfer.mutateAsync({ id: transfer.id, ...payload })
          toast.success('Transfer updated')
        } else {
          await createTransfer.mutateAsync(payload)
          toast.success('Transfer created')
        }
        setOpen(false)
        form.reset()
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : 'Request failed')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit transfer' : 'New transfer'}</DialogTitle>
          <DialogDescription>
            Move money between two of your accounts.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="originAccountId"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Select an account'),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label>From</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Origin account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name} (
                        {currencyById.get(account.currencyId)?.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="destinyAccountId"
            validators={{
              onChangeListenTo: ['originAccountId'],
              onChange: ({ value, fieldApi }) => {
                if (!value) return 'Select an account'
                if (value === fieldApi.form.getFieldValue('originAccountId')) {
                  return 'Must differ from the origin account'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label>To</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name} (
                        {currencyById.get(account.currencyId)?.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              originAccountId: state.values.originAccountId,
              destinyAccountId: state.values.destinyAccountId,
              amount: state.values.amount,
            })}
          >
            {({ originAccountId, destinyAccountId, amount }) => {
              const origin = accounts.find(
                (a) => a.id === Number(originAccountId),
              )
              const destiny = accounts.find(
                (a) => a.id === Number(destinyAccountId),
              )
              const crossCurrency =
                origin &&
                destiny &&
                origin.currencyId !== destiny.currencyId
              const insufficient =
                origin && Number(amount) > origin.balance

              return (
                <>
                  <form.Field
                    name="amount"
                    validators={{
                      onChange: ({ value }) =>
                        Number(value) > 0
                          ? undefined
                          : 'Amount must be greater than 0',
                    }}
                  >
                    {(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>
                          Amount{' '}
                          {origin && (
                            <span className="text-muted-foreground">
                              ({currencyById.get(origin.currencyId)?.code})
                            </span>
                          )}
                        </Label>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  {crossCurrency && (
                    <form.Field
                      name="destinyAmount"
                      validators={{
                        onChange: ({ value }) =>
                          Number(value) > 0
                            ? undefined
                            : 'Required for cross-currency transfers',
                      }}
                    >
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={field.name}>
                            Destination amount{' '}
                            <span className="text-muted-foreground">
                              ({currencyById.get(destiny.currencyId)?.code})
                            </span>
                          </Label>
                          <Input
                            id={field.name}
                            type="number"
                            step="0.01"
                            min="0"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <FieldError errors={field.state.meta.errors} />
                        </div>
                      )}
                    </form.Field>
                  )}

                  {insufficient && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        This amount is greater than the origin account balance.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )
            }}
          </form.Subscribe>

          <form.Field name="date">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Date</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="comment">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Comment</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
