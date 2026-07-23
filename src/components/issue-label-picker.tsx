import { Tag } from "lucide-react"
import type { Label } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function IssueLabelPicker({
  labels,
  value,
  onChange,
  disabled,
}: {
  labels: Label[]
  value: string[]
  onChange: (labelIds: string[]) => void
  disabled?: boolean
}) {
  const selected = new Set(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 justify-start text-xs"
          disabled={disabled}
          aria-label="Choose labels"
        >
          <Tag className="size-3.5" />
          {value.length === 0
            ? "Labels"
            : `${value.length} label${value.length === 1 ? "" : "s"}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="px-1 text-xs font-medium text-muted-foreground">Labels</p>
        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {labels.map((label) => {
            const checked = selected.has(label.id)
            return (
              <label
                key={label.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) => {
                    onChange(
                      next
                        ? [...value, label.id]
                        : value.filter((id) => id !== label.id)
                    )
                  }}
                />
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {label.name}
                </span>
              </label>
            )
          })}
          {labels.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No labels available.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
