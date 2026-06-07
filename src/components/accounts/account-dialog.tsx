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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { FieldError } from '#/components/form/field-error'
import { useCreateAccount, useUpdateAccount } from '#/hooks/use-accounts'
import { useCurrencies } from '#/hooks/use-currencies'
import { ApiError } from '#/lib/api'
import type { Account } from '#/types'

export function AccountDialog({
  account,
  trigger,
}: {
  account?: Account
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isEdit = Boolean(account)
  const currenciesQuery = useCurrencies()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const form = useForm({
    defaultValues: {
      name: account?.name ?? '',
      currencyId: account ? String(account.currencyId) : '',
      balance: account ? String(account.balance) : '0',
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name.trim(),
        currencyId: Number(value.currencyId),
        balance: Number(value.balance),
      }
      try {
        if (account) {
          await updateAccount.mutateAsync({ id: account.id, ...payload })
          toast.success('Account updated')
        } else {
          await createAccount.mutateAsync(payload)
          toast.success('Account created')
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
          <DialogTitle>{isEdit ? 'Edit account' : 'New account'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the account details.'
              : 'Create a new account to track a balance.'}
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
            name="name"
            validators={{
              onChange: ({ value }) => (value.trim() ? undefined : 'Required'),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Savings"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="currencyId"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Select a currency'),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {(currenciesQuery.data ?? []).map((currency) => (
                      <SelectItem key={currency.id} value={String(currency.id)}>
                        {currency.code} — {currency.name} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="balance">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>
                  {isEdit ? 'Balance' : 'Initial balance'}
                </Label>
                <Input
                  id={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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
