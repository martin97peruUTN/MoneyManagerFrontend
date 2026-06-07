import { RotateCcw } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { resetDateRange, setDateRange, useDateRange } from '#/lib/store'

/**
 * Shared month/date-range filter backed by the TanStack Store. Both the
 * Transactions and Transfers pages read from the same global range.
 */
export function DateRangeFilter() {
  const { dateFrom, dateTo } = useDateRange()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="dateFrom"
          type="date"
          value={dateFrom}
          max={dateTo}
          className="w-auto"
          onChange={(e) => setDateRange(e.target.value, dateTo)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="dateTo"
          type="date"
          value={dateTo}
          min={dateFrom}
          className="w-auto"
          onChange={(e) => setDateRange(dateFrom, e.target.value)}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => resetDateRange()}
        title="Reset to current month"
      >
        <RotateCcw className="mr-1 h-3.5 w-3.5" />
        This month
      </Button>
    </div>
  )
}
