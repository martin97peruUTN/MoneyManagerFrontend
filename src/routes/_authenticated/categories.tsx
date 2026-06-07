import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Card, CardContent } from '#/components/ui/card'
import { PageHeader } from '#/components/page-header'
import { EmptyState, ErrorState, LoadingRows } from '#/components/states'
import { CategoryDialog } from '#/components/categories/category-dialog'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useCategories, useDeleteCategory } from '#/hooks/use-categories'
import { useAuth } from '#/lib/auth-client'
import { ApiError } from '#/lib/api'
import type { TransactionCategory } from '#/types'

export const Route = createFileRoute('/_authenticated/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const [tab, setTab] = useState<'expense' | 'income'>('expense')
  const { isAdmin } = useAuth()
  const categoriesQuery = useCategories()
  const deleteCategory = useDeleteCategory()

  const isExpenseTab = tab === 'expense'
  const categories = (categoriesQuery.data ?? []).filter(
    (c) => c.isExpense === isExpenseTab,
  )

  const canManage = (category: TransactionCategory) =>
    !category.public || isAdmin

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id)
      toast.success('Category deleted')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Request failed')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your transactions"
        actions={
          <CategoryDialog
            defaultIsExpense={isExpenseTab}
            trigger={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New category
              </Button>
            }
          />
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'expense' | 'income')}>
        <TabsList>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Incomes</TabsTrigger>
        </TabsList>
      </Tabs>

      {categoriesQuery.isLoading ? (
        <LoadingRows rows={5} />
      ) : categoriesQuery.isError ? (
        <ErrorState error={categoriesQuery.error} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories"
          description={`You don't have any ${isExpenseTab ? 'expense' : 'income'} categories yet.`}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  {category.public ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>
                {canManage(category) && (
                  <div className="flex items-center gap-1">
                    <CategoryDialog
                      category={category}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      title="Delete category?"
                      description={`"${category.name}" will be removed.`}
                      onConfirm={() => void handleDelete(category.id)}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
