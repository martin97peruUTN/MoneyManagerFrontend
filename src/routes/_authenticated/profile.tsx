import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Badge } from '#/components/ui/badge'
import { FieldError } from '#/components/form/field-error'
import { PageHeader } from '#/components/page-header'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useAuth } from '#/lib/auth-client'
import { useDeleteProfile, useUpdateProfile } from '#/hooks/use-profile'
import { ApiError } from '#/lib/api'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, signOut } = useAuth()
  const updateProfile = useUpdateProfile()
  const deleteProfile = useDeleteProfile()

  const form = useForm({
    defaultValues: {
      name: user?.name ?? '',
      lastname: user?.lastname ?? '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      if (!user) return
      const payload: { name?: string; lastname?: string; password?: string } = {
        name: value.name.trim(),
        lastname: value.lastname.trim(),
      }
      if (value.password) payload.password = value.password
      try {
        await updateProfile.mutateAsync({ id: user.id, ...payload })
        toast.success('Profile updated')
        form.setFieldValue('password', '')
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : 'Request failed')
      }
    },
  })

  const handleDelete = async () => {
    if (!user) return
    try {
      await deleteProfile.mutateAsync(user.id)
      toast.success('Account deleted')
      await signOut()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account details" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            @{user.username}
            {user.role === 'Admin' && (
              <Badge variant="secondary">Admin</Badge>
            )}
          </CardTitle>
          <CardDescription>Update your name or password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit()
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    value.trim() ? undefined : 'Required',
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>First name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
              <form.Field
                name="lastname"
                validators={{
                  onChange: ({ value }) =>
                    value.trim() ? undefined : 'Required',
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Last name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value || value.length >= 6
                    ? undefined
                    : 'At least 6 characters',
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>New password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-xl border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>
            Deleting your account is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmDialog
            title="Delete your account?"
            description="This will permanently remove your account. This action cannot be undone."
            confirmLabel="Delete my account"
            onConfirm={() => void handleDelete()}
            trigger={
              <Button variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete account
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
