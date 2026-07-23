import { useState } from "react"
import {
  Bookmark,
  Check,
  Copy,
  Filter,
  Pencil,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  activeIssueFilterCount,
  createDefaultIssueViewState,
  removeIssueFilter,
  toggleIssueFilter,
  type FilterKey,
  type IssueViewState,
} from "@/lib/issue-view-state"
import type { SavedIssueView } from "@/lib/saved-issue-views"

export interface FilterOption {
  value: string
  label: string
}

export interface FilterGroup {
  key: FilterKey
  label: string
  options: FilterOption[]
}

interface NameEditor {
  mode: "create" | "rename"
  id?: string
  name: string
}

export function IssueViewToolbar({
  state,
  filterGroups,
  savedViews,
  resultSummary,
  unavailableCriteria,
  onStateChange,
  onApplySavedView,
  onCreateSavedView,
  onRenameSavedView,
  onDeleteSavedView,
  onCopyLink,
}: {
  state: IssueViewState
  filterGroups: FilterGroup[]
  savedViews: SavedIssueView[]
  resultSummary: string
  unavailableCriteria: string[]
  onStateChange: (state: IssueViewState) => void
  onApplySavedView: (view: SavedIssueView) => void
  onCreateSavedView: (name: string) => void
  onRenameSavedView: (id: string, name: string) => void
  onDeleteSavedView: (id: string) => void
  onCopyLink: () => void
}) {
  const [nameEditor, setNameEditor] = useState<NameEditor | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const filterCount = activeIssueFilterCount(state)

  const labelFor = (key: FilterKey, value: string) => {
    const group = filterGroups.find((item) => item.key === key)
    return (
      group?.options.find((option) => option.value === value)?.label ??
      `Unavailable ${group?.label.toLowerCase() ?? "filter"}`
    )
  }

  const submitName = () => {
    if (!nameEditor?.name.trim()) return
    if (nameEditor.mode === "create") {
      onCreateSavedView(nameEditor.name)
    } else if (nameEditor.id) {
      onRenameSavedView(nameEditor.id, nameEditor.name)
    }
    setNameEditor(null)
  }

  return (
    <>
      <div className="border-b border-white/6 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filterCount ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                aria-label={`Filter issues${filterCount ? `, ${filterCount} active` : ""}`}
              >
                <Filter className="size-3.5" />
                Filter
                {filterCount > 0 && (
                  <span className="rounded bg-[#5c68cf] px-1.5 text-[10px] text-white">
                    {filterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Filter issues</DropdownMenuLabel>
              {filterGroups.map((group) => (
                <DropdownMenuSub key={group.key}>
                  <DropdownMenuSubTrigger>
                    {group.label}
                    {state.filters[group.key].length > 0 && (
                      <span className="mr-1 ml-auto text-xs text-muted-foreground">
                        {state.filters[group.key].length}
                      </span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {group.options.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No applicable options
                      </DropdownMenuItem>
                    ) : (
                      group.options.map((option) => (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={state.filters[group.key].includes(
                            option.value
                          )}
                          onCheckedChange={() =>
                            onStateChange(
                              toggleIssueFilter(state, group.key, option.value)
                            )
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          {option.label}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
              {filterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      onStateChange({
                        ...state,
                        filters: createDefaultIssueViewState().filters,
                      })
                    }
                  >
                    <X className="size-3.5" /> Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
              >
                <SlidersHorizontal className="size-3.5" /> Display
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Row density</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.density}
                onValueChange={(density) =>
                  onStateChange({
                    ...state,
                    density: density as IssueViewState["density"],
                  })
                }
              >
                <DropdownMenuRadioItem value="comfortable">
                  Comfortable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">
                  Compact
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.sort}
                onValueChange={(sort) =>
                  onStateChange({
                    ...state,
                    sort: sort as IssueViewState["sort"],
                  })
                }
              >
                <DropdownMenuRadioItem value="updated">
                  Recently updated
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority">
                  Priority
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="identifier">
                  Identifier
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
              >
                <Bookmark className="size-3.5" /> Saved views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onSelect={() => setNameEditor({ mode: "create", name: "" })}
              >
                <Bookmark className="size-3.5" /> Save current view
              </DropdownMenuItem>
              {savedViews.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Personal views</DropdownMenuLabel>
                  {savedViews.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onSelect={() => onApplySavedView(view)}
                    >
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setManageOpen(true)}>
                    Manage saved views
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={onCopyLink}
          >
            <Copy className="size-3.5" /> Copy link
          </Button>

          <span
            className="ml-auto text-xs text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {resultSummary}
          </span>
        </div>

        {filterCount > 0 && (
          <div
            className="mt-2 flex flex-wrap gap-1.5"
            aria-label="Active filters"
          >
            {(Object.keys(state.filters) as FilterKey[]).flatMap((key) =>
              state.filters[key].map((value) => (
                <button
                  key={`${key}:${value}`}
                  type="button"
                  onClick={() =>
                    onStateChange(removeIssueFilter(state, key, value))
                  }
                  className="inline-flex h-6 items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2 text-[11px] text-foreground hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#8f98ff] focus-visible:outline-none"
                  aria-label={`Remove ${labelFor(key, value)} filter`}
                >
                  <span className="text-muted-foreground">
                    {filterGroups.find((group) => group.key === key)?.label}:
                  </span>
                  {labelFor(key, value)}
                  <X className="size-3" />
                </button>
              ))
            )}
          </div>
        )}

        {unavailableCriteria.length > 0 && (
          <p
            className="mt-2 text-xs text-[#f2c94c]"
            role="status"
            aria-live="polite"
          >
            This shared view references unavailable criteria:{" "}
            {unavailableCriteria.join(", ")}. Remove them to broaden the
            results.
          </p>
        )}
      </div>

      <Dialog
        open={nameEditor !== null}
        onOpenChange={(open) => !open && setNameEditor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {nameEditor?.mode === "rename"
                ? "Rename saved view"
                : "Save issue view"}
            </DialogTitle>
            <DialogDescription>
              Saved views keep the current filters, sorting, and row density for
              this workspace.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitName()
            }}
            className="space-y-4"
          >
            <Input
              autoFocus
              aria-label="Saved view name"
              value={nameEditor?.name ?? ""}
              maxLength={80}
              onChange={(event) =>
                setNameEditor((current) =>
                  current ? { ...current, name: event.target.value } : null
                )
              }
              placeholder="e.g. Urgent unassigned bugs"
            />
            <DialogFooter className="mx-0 mb-0 px-0 pb-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNameEditor(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!nameEditor?.name.trim()}>
                {nameEditor?.mode === "rename" ? "Rename" : "Save view"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage saved views</DialogTitle>
            <DialogDescription>
              Apply, rename, or delete personal views for this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {savedViews.map((view) => (
              <div
                key={view.id}
                className="flex items-center gap-2 rounded-lg border border-white/8 p-2"
              >
                <span className="min-w-0 flex-1 truncate">{view.name}</span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Apply saved view"
                  aria-label={`Apply ${view.name}`}
                  onClick={() => {
                    onApplySavedView(view)
                    setManageOpen(false)
                  }}
                >
                  <Check />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Rename saved view"
                  aria-label={`Rename ${view.name}`}
                  onClick={() => {
                    setManageOpen(false)
                    setNameEditor({
                      mode: "rename",
                      id: view.id,
                      name: view.name,
                    })
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Delete saved view"
                  aria-label={`Delete ${view.name}`}
                  onClick={() => onDeleteSavedView(view.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
