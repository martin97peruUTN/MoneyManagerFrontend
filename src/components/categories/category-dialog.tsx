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
import { Switch } from '#/components/ui/switch'
import { FieldError } from '#/components/form/field-error'
import {
  useCreateCategory,
  useUpdateCategory,
} from '#/hooks/use-categories'
import { ApiError } from '#/lib/api'
import type { TransactionCategory } from '#/types'

export function CategoryDialog({
  category,
  defaultIsExpense = true,
  trigger,
}: {
  category?: TransactionCategory
  defaultIsExpense?: boolean
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isEdit = Boolean(category)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const form = useForm({
    defaultValues: {
      name: category?.name ?? '',
      isExpense: category?.isExpense ?? defaultIsExpense,
    },
    onSubmit: async ({ value }) => {
      const payload = { name: value.name.trim(), isExpense: value.isExpense }
      try {
        if (category) {
          await updateCategory.mutateAsync({ id: category.id, ...payload })
          toast.success('Category updated')
        } else {
          await createCategory.mutateAsync(payload)
          toast.success('Category created')
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
          <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
          <DialogDescription>
            Categories help you classify your transactions.
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
                  placeholder="e.g. Groceries"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="isExpense">
            {(field) => (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor={field.name}>Expense category</Label>
                  <p className="text-xs text-muted-foreground">
                    {field.state.value
                      ? 'Used for money going out'
                      : 'Used for money coming in'}
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
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
