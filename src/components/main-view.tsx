import { useMemo, useState } from "react"
import { Filter, Plus, SlidersHorizontal, X } from "lucide-react"
import { useUIStore } from "@/store/ui-store"
import {
  useIssues,
  useLabels,
  useProjects,
  useSession,
  useTeams,
  useUsers,
} from "@/queries/issues"
import { filterIssuesForView } from "@/lib/issue-filters"
import { IssueList } from "@/components/issue-list"
import { SearchView } from "@/components/search-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
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
import { cn } from "@/lib/utils"
import { PRIORITY_META, STATUS_META, type Issue } from "@/lib/types"

type SortMode = "updated" | "priority" | "identifier"
type FilterState = {
  status: string
  priority: string
  assignee: string
  label: string
}

const EMPTY_FILTERS: FilterState = {
  status: "all",
  priority: "all",
  assignee: "all",
  label: "all",
}

function priorityRank(priority: Issue["priority"]) {
  return priority === 0 ? 5 : priority
}

function useViewTitle() {
  const view = useUIStore((state) => state.view)
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()

  if (view.startsWith("team:")) {
    const id = view.slice("team:".length)
    const team = teams.find((item) => item.id === id)
    return { title: team?.name ?? "Team", subtitle: "All issues" }
  }
  if (view.startsWith("project:")) {
    const id = view.slice("project:".length)
    const project = projects.find((item) => item.id === id)
    return { title: project?.name ?? "Project", subtitle: "Project issues" }
  }
  const titles: Record<string, { title: string; subtitle: string }> = {
    inbox: { title: "Inbox", subtitle: "Triage new issues" },
    "my-issues": { title: "My issues", subtitle: "Assigned to you" },
    active: { title: "Active issues", subtitle: "All open work" },
    search: { title: "Search", subtitle: "" },
  }
  return titles[view] ?? { title: "Issues", subtitle: "" }
}

export function MainView() {
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  )
  const [sort, setSort] = useState<SortMode>("updated")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const view = useUIStore((state) => state.view)
  const setAddIssueOpen = useUIStore((state) => state.setAddIssueOpen)
  const { title, subtitle } = useViewTitle()
  const { data: session } = useSession()
  const { data: users = [] } = useUsers()
  const { data: labels = [] } = useLabels()
  const {
    data: issues = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useIssues(view)

  const baseIssues = filterIssuesForView(issues, view, session?.user?.id)
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length
  const filtered = useMemo(() => {
    const result = baseIssues.filter((issue) => {
      if (filters.status !== "all" && issue.status !== filters.status) {
        return false
      }
      if (
        filters.priority !== "all" &&
        String(issue.priority) !== filters.priority
      ) {
        return false
      }
      if (
        filters.assignee !== "all" &&
        (filters.assignee === "unassigned"
          ? issue.assigneeId !== null
          : issue.assigneeId !== filters.assignee)
      ) {
        return false
      }
      if (filters.label !== "all" && !issue.labelIds.includes(filters.label)) {
        return false
      }
      return true
    })

    return result.sort((a, b) => {
      if (sort === "priority") {
        return priorityRank(a.priority) - priorityRank(b.priority)
      }
      if (sort === "identifier") {
        return a.identifier.localeCompare(b.identifier, undefined, {
          numeric: true,
        })
      }
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [baseIssues, filters, sort])

  if (view === "search") {
    return <SearchView />
  }

  const setFilter = (key: keyof FilterState, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }))

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d]">
      <header className="flex items-center justify-between border-b border-white/6 px-6 py-3">
        <div>
          <h1 className="text-[15px] font-medium">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={activeFilterCount ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs text-muted-foreground"
              >
                <Filter className="size-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="rounded bg-[#5e6ad2] px-1.5 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter issues</DropdownMenuLabel>
              <FilterSubmenu
                label="Status"
                value={filters.status}
                onValueChange={(value) => setFilter("status", value)}
                options={[
                  { value: "all", label: "Any status" },
                  ...Object.entries(STATUS_META).map(([value, meta]) => ({
                    value,
                    label: meta.label,
                  })),
                ]}
              />
              <FilterSubmenu
                label="Priority"
                value={filters.priority}
                onValueChange={(value) => setFilter("priority", value)}
                options={[
                  { value: "all", label: "Any priority" },
                  ...([0, 1, 2, 3, 4] as Issue["priority"][]).map(
                    (priority) => ({
                      value: String(priority),
                      label: PRIORITY_META[priority].label,
                    })
                  ),
                ]}
              />
              <FilterSubmenu
                label="Assignee"
                value={filters.assignee}
                onValueChange={(value) => setFilter("assignee", value)}
                options={[
                  { value: "all", label: "Anyone" },
                  { value: "unassigned", label: "Unassigned" },
                  ...users.map((user) => ({
                    value: user.id,
                    label: user.name,
                  })),
                ]}
              />
              <FilterSubmenu
                label="Label"
                value={filters.label}
                onValueChange={(value) => setFilter("label", value)}
                options={[
                  { value: "all", label: "Any label" },
                  ...labels.map((label) => ({
                    value: label.id,
                    label: label.name,
                  })),
                ]}
              />
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setFilters(EMPTY_FILTERS)}>
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Row density</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={density}
                onValueChange={(value) =>
                  setDensity(value as "comfortable" | "compact")
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
                value={sort}
                onValueChange={(value) => setSort(value as SortMode)}
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

          <Button
            size="sm"
            className="h-7 bg-[#5e6ad2] text-xs hover:bg-[#4f5bc4]"
            onClick={() => setAddIssueOpen(true)}
          >
            <Plus className="size-3.5" /> New issue
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-4",
          density === "compact" ? "py-0 text-[12px]" : "py-2"
        )}
      >
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-[#eb5757]">
              {error instanceof Error
                ? error.message
                : "Could not load issues."}
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <IssueList
            issues={filtered}
            emptyMessage={
              activeFilterCount
                ? "No issues match these filters. Clear filters to see everything."
                : "No issues here."
            }
          />
        )}
      </div>
    </div>
  )
}

function FilterSubmenu({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-52">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
