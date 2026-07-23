import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
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
import {
  createDefaultIssueViewState,
  EMPTY_VALUE,
  filterAndSortIssues,
  issueViewStateSearch,
  readIssueViewState,
  type IssueViewState,
} from "@/lib/issue-view-state"
import {
  createSavedIssueView,
  deleteSavedIssueView,
  readSavedIssueViews,
  renameSavedIssueView,
  type SavedIssueView,
} from "@/lib/saved-issue-views"
import { IssueList } from "@/components/issue-list"
import { SearchView } from "@/components/search-view"
import {
  IssueViewToolbar,
  type FilterGroup,
} from "@/components/issue-view-toolbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PRIORITY_META, STATUS_META, type Issue } from "@/lib/types"

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
  const view = useUIStore((state) => state.view)
  const setAddIssueOpen = useUIStore((state) => state.setAddIssueOpen)
  const { title, subtitle } = useViewTitle()
  const { data: session } = useSession()
  const workspaceId = session?.organization?.id ?? ""
  const [viewState, setViewState] = useState<IssueViewState>(() =>
    typeof window === "undefined"
      ? createDefaultIssueViewState()
      : readIssueViewState(window.location.search)
  )
  const [savedViews, setSavedViews] = useState<SavedIssueView[]>(() =>
    readSavedIssueViews(workspaceId)
  )
  const { data: users = [] } = useUsers()
  const { data: labels = [] } = useLabels()
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const {
    data: issues = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useIssues(view)

  useEffect(() => {
    const syncFromHistory = () =>
      setViewState(readIssueViewState(window.location.search))
    window.addEventListener("popstate", syncFromHistory)
    return () => window.removeEventListener("popstate", syncFromHistory)
  }, [])

  const updateViewState = useCallback(
    (next: IssueViewState, mode: "push" | "replace" = "push") => {
      const nextUrl = `${window.location.pathname}${issueViewStateSearch(next)}${window.location.hash}`
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (nextUrl !== currentUrl) {
        window.history[mode === "push" ? "pushState" : "replaceState"](
          null,
          "",
          nextUrl
        )
      }
      setViewState(next)
    },
    []
  )

  const baseIssues = filterIssuesForView(issues, view, session?.user?.id)
  const filtered = useMemo(
    () => filterAndSortIssues(baseIssues, viewState),
    [baseIssues, viewState]
  )

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const activeTeamId = view.startsWith("team:")
      ? view.slice("team:".length)
      : view.startsWith("project:")
        ? projects.find(
            (project) => project.id === view.slice("project:".length)
          )?.teamId
        : undefined
    const activeProjectId = view.startsWith("project:")
      ? view.slice("project:".length)
      : undefined
    const scopedTeams = activeTeamId
      ? teams.filter((team) => team.id === activeTeamId)
      : teams
    const scopedProjects = activeProjectId
      ? projects.filter((project) => project.id === activeProjectId)
      : activeTeamId
        ? projects.filter((project) => project.teamId === activeTeamId)
        : projects

    return [
      {
        key: "status",
        label: "Status",
        options: Object.entries(STATUS_META).map(([value, meta]) => ({
          value,
          label: meta.label,
        })),
      },
      {
        key: "priority",
        label: "Priority",
        options: ([0, 1, 2, 3, 4] as Issue["priority"][]).map((priority) => ({
          value: String(priority),
          label: PRIORITY_META[priority].label,
        })),
      },
      {
        key: "assignee",
        label: "Assignee",
        options: [
          { value: EMPTY_VALUE, label: "Unassigned" },
          ...users.map((user) => ({ value: user.id, label: user.name })),
        ],
      },
      {
        key: "project",
        label: "Project",
        options: [
          { value: EMPTY_VALUE, label: "No project" },
          ...scopedProjects.map((project) => ({
            value: project.id,
            label: project.name,
          })),
        ],
      },
      {
        key: "team",
        label: "Team",
        options: scopedTeams.map((team) => ({
          value: team.id,
          label: team.name,
        })),
      },
      {
        key: "label",
        label: "Label",
        options: [
          { value: EMPTY_VALUE, label: "No labels" },
          ...labels.map((label) => ({ value: label.id, label: label.name })),
        ],
      },
    ]
  }, [labels, projects, teams, users, view])

  const unavailableCriteria = useMemo(() => {
    const unavailable: string[] = []
    for (const group of filterGroups) {
      const available = new Set(group.options.map((option) => option.value))
      for (const selected of viewState.filters[group.key]) {
        if (!available.has(selected)) {
          unavailable.push(`${group.label}: ${selected}`)
        }
      }
    }
    return unavailable
  }, [filterGroups, viewState.filters])

  if (view === "search") {
    return <SearchView />
  }

  const applySavedView = (saved: SavedIssueView) => {
    updateViewState(saved.state)
    toast.success(`Applied “${saved.name}”`)
  }

  const createView = (name: string) => {
    setSavedViews(createSavedIssueView(workspaceId, name, viewState))
    toast.success(`Saved “${name.trim()}”`)
  }

  const renameView = (id: string, name: string) => {
    setSavedViews(renameSavedIssueView(workspaceId, id, name))
    toast.success("Saved view renamed")
  }

  const deleteView = (id: string) => {
    setSavedViews(deleteSavedIssueView(workspaceId, id))
    toast.success("Saved view deleted")
  }

  const copyLink = () => {
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("View link copied"))
      .catch(() => toast.error("Could not copy the view link"))
  }

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d]">
      <header className="flex items-center justify-between border-b border-white/6 px-6 py-3">
        <div>
          <h1 className="text-[15px] font-medium">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Button
          size="sm"
          className="h-7 bg-[#5c68cf] text-xs hover:bg-[#4f5bc4]"
          onClick={() => setAddIssueOpen(true)}
        >
          <Plus className="size-3.5" /> New issue
        </Button>
      </header>

      <IssueViewToolbar
        state={viewState}
        filterGroups={filterGroups}
        savedViews={savedViews}
        resultSummary={`${filtered.length} of ${baseIssues.length} issues`}
        unavailableCriteria={unavailableCriteria}
        onStateChange={updateViewState}
        onApplySavedView={applySavedView}
        onCreateSavedView={createView}
        onRenameSavedView={renameView}
        onDeleteSavedView={deleteView}
        onCopyLink={copyLink}
      />

      <div
        className={cn(
          "flex-1 overflow-y-auto px-4",
          viewState.density === "compact" ? "py-0 text-[12px]" : "py-2"
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
              unavailableCriteria.length > 0
                ? "No issues match this shared view. Remove unavailable criteria to recover."
                : filtered.length !== baseIssues.length
                  ? "No issues match these filters. Remove a filter to see more."
                  : "No issues here."
            }
          />
        )}
      </div>
    </div>
  )
}
