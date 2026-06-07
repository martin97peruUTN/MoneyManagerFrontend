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
import { FieldError } from '#/components/form/field-error'
import {
  useCreateCurrency,
  useUpdateCurrency,
} from '#/hooks/use-currencies'
import { ApiError } from '#/lib/api'
import type { Currency } from '#/types'

export function CurrencyDialog({
  currency,
  trigger,
}: {
  currency?: Currency
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isEdit = Boolean(currency)
  const createCurrency = useCreateCurrency()
  const updateCurrency = useUpdateCurrency()

  const form = useForm({
    defaultValues: {
      name: currency?.name ?? '',
      symbol: currency?.symbol ?? '',
      code: currency?.code ?? '',
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name.trim(),
        symbol: value.symbol.trim(),
        code: value.code.trim().toUpperCase(),
      }
      try {
        if (currency) {
          await updateCurrency.mutateAsync({ id: currency.id, ...payload })
          toast.success('Currency updated')
        } else {
          await createCurrency.mutateAsync(payload)
          toast.success('Currency created')
        }
        setOpen(false)
        form.reset()
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : 'Request failed')
      }
    },
  })

  const required = (value: string) => (value.trim() ? undefined : 'Required')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit currency' : 'New currency'}</DialogTitle>
          <DialogDescription>
            Currencies are shared across all users.
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
            validators={{ onChange: ({ value }) => required(value) }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="US Dollar"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="symbol"
              validators={{ onChange: ({ value }) => required(value) }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Symbol</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="$"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
            <form.Field
              name="code"
              validators={{ onChange: ({ value }) => required(value) }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Code</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="USD"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

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
