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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { FieldError } from '#/components/form/field-error'
import { useAccounts } from '#/hooks/use-accounts'
import { useCategories } from '#/hooks/use-categories'
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '#/hooks/use-transactions'
import { ApiError } from '#/lib/api'
import { formatYmd } from '#/lib/format'
import type { Transaction } from '#/types'

export function TransactionDialog({
  transaction,
  trigger,
}: {
  transaction?: Transaction
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isEdit = Boolean(transaction)
  const accountsQuery = useAccounts()
  const categoriesQuery = useCategories()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()

  const editingCategory = categoriesQuery.data?.find(
    (c) => c.id === transaction?.transactionCategoryId,
  )

  const [type, setType] = useState<'expense' | 'income'>(
    editingCategory?.isExpense === false ? 'income' : 'expense',
  )

  const categories = (categoriesQuery.data ?? []).filter(
    (c) => c.isExpense === (type === 'expense'),
  )

  const form = useForm({
    defaultValues: {
      amount: transaction ? String(transaction.amount) : '',
      accountId: transaction?.accountId ? String(transaction.accountId) : '',
      transactionCategoryId: transaction
        ? String(transaction.transactionCategoryId)
        : '',
      comment: transaction?.comment ?? '',
      date: transaction
        ? formatYmd(new Date(transaction.date))
        : formatYmd(new Date()),
    },
    onSubmit: async ({ value }) => {
      const payload = {
        amount: Number(value.amount),
        accountId: Number(value.accountId),
        transactionCategoryId: Number(value.transactionCategoryId),
        comment: value.comment.trim() || null,
        date: new Date(value.date).toISOString(),
      }
      try {
        if (transaction) {
          await updateTransaction.mutateAsync({ id: transaction.id, ...payload })
          toast.success('Transaction updated')
        } else {
          await createTransaction.mutateAsync(payload)
          toast.success('Transaction created')
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
          <DialogTitle>
            {isEdit ? 'Edit transaction' : 'New transaction'}
          </DialogTitle>
          <DialogDescription>
            Record an expense or income on one of your accounts.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={type}
          onValueChange={(value) => {
            setType(value as 'expense' | 'income')
            form.setFieldValue('transactionCategoryId', '')
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) =>
                Number(value) > 0 ? undefined : 'Amount must be greater than 0',
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Amount</Label>
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

          <form.Field
            name="accountId"
            validators={{
              onChange: ({ value }) => (value ? undefined : 'Select an account'),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accountsQuery.data ?? []).map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="transactionCategoryId"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : 'Select a category',
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

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
