import { useState } from "react"
import { Filter, Plus, SlidersHorizontal } from "lucide-react"
import { useUIStore } from "@/store/ui-store"
import { useIssues, useProjects, useSession, useTeams } from "@/queries/issues"
import { filterIssuesForView } from "@/lib/issue-filters"
import { IssueList } from "@/components/issue-list"
import { SearchView } from "@/components/search-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function useViewTitle() {
  const view = useUIStore((s) => s.view)
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()

  if (view.startsWith("team:")) {
    const id = view.slice("team:".length)
    const team = teams.find((t) => t.id === id)
    return { title: team?.name ?? "Team", subtitle: "All issues" }
  }
  if (view.startsWith("project:")) {
    const id = view.slice("project:".length)
    const project = projects.find((p) => p.id === id)
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
  const view = useUIStore((s) => s.view)
  const setAddIssueOpen = useUIStore((s) => s.setAddIssueOpen)
  const { title, subtitle } = useViewTitle()
  const { data: session } = useSession()

  const { data: issues = [], isLoading } = useIssues(view)

  if (view === "search") {
    return <SearchView />
  }

  const filtered = filterIssuesForView(issues, view, session?.user?.id)

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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
          >
            <Filter className="size-3.5" /> Filter
          </Button>
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
            <DropdownMenuContent align="end" className="w-40">
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
        ) : (
          <IssueList issues={filtered} />
        )}
      </div>
    </div>
  )
}
