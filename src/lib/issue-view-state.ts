import type { Issue } from "@/lib/types"

export type FilterKey =
  | "status"
  | "priority"
  | "assignee"
  | "project"
  | "team"
  | "label"

export type SortMode = "updated" | "priority" | "identifier"
export type RowDensity = "comfortable" | "compact"

export type IssueViewFilters = Record<FilterKey, string[]>

export interface IssueViewState {
  filters: IssueViewFilters
  sort: SortMode
  density: RowDensity
}

export const EMPTY_VALUE = "none"

const FILTER_PARAMS: Record<FilterKey, string> = {
  status: "status",
  priority: "priority",
  assignee: "assignee",
  project: "project",
  team: "team",
  label: "label",
}

const FILTER_KEYS = Object.keys(FILTER_PARAMS) as FilterKey[]
const VALID_SORTS = new Set<SortMode>(["updated", "priority", "identifier"])
const VALID_DENSITIES = new Set<RowDensity>(["comfortable", "compact"])

export function createDefaultIssueViewState(): IssueViewState {
  return {
    filters: {
      status: [],
      priority: [],
      assignee: [],
      project: [],
      team: [],
      label: [],
    },
    sort: "updated",
    density: "comfortable",
  }
}

export function readIssueViewState(search: string): IssueViewState {
  const params = new URLSearchParams(search)
  const state = createDefaultIssueViewState()

  for (const key of FILTER_KEYS) {
    state.filters[key] = unique(
      params
        .getAll(FILTER_PARAMS[key])
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  }

  const sort = params.get("sort") as SortMode | null
  const density = params.get("density") as RowDensity | null
  if (sort && VALID_SORTS.has(sort)) state.sort = sort
  if (density && VALID_DENSITIES.has(density)) state.density = density

  return state
}

export function issueViewStateSearch(state: IssueViewState): string {
  const params = new URLSearchParams()

  for (const key of FILTER_KEYS) {
    for (const value of unique(state.filters[key]).sort()) {
      params.append(FILTER_PARAMS[key], value)
    }
  }

  if (state.sort !== "updated") params.set("sort", state.sort)
  if (state.density !== "comfortable") params.set("density", state.density)

  const query = params.toString()
  return query ? `?${query}` : ""
}

export function toggleIssueFilter(
  state: IssueViewState,
  key: FilterKey,
  value: string
): IssueViewState {
  const selected = state.filters[key]
  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]

  return {
    ...state,
    filters: {
      ...state.filters,
      [key]: next,
    },
  }
}

export function removeIssueFilter(
  state: IssueViewState,
  key: FilterKey,
  value: string
): IssueViewState {
  return {
    ...state,
    filters: {
      ...state.filters,
      [key]: state.filters[key].filter((item) => item !== value),
    },
  }
}

export function activeIssueFilterCount(state: IssueViewState): number {
  return FILTER_KEYS.reduce(
    (total, key) => total + state.filters[key].length,
    0
  )
}

export function filterAndSortIssues(
  issues: Issue[],
  state: IssueViewState
): Issue[] {
  const { filters } = state
  const result = issues.filter((issue) => {
    if (!matches(filters.status, issue.status)) return false
    if (!matches(filters.priority, String(issue.priority))) return false
    if (!matches(filters.assignee, issue.assigneeId ?? EMPTY_VALUE))
      return false
    if (!matches(filters.project, issue.projectId ?? EMPTY_VALUE)) return false
    if (!matches(filters.team, issue.teamId)) return false
    if (
      filters.label.length > 0 &&
      !filters.label.some((label) =>
        label === EMPTY_VALUE
          ? issue.labelIds.length === 0
          : issue.labelIds.includes(label)
      )
    ) {
      return false
    }
    return true
  })

  return result.sort((a, b) => {
    if (state.sort === "priority") {
      return priorityRank(a.priority) - priorityRank(b.priority)
    }
    if (state.sort === "identifier") {
      return a.identifier.localeCompare(b.identifier, undefined, {
        numeric: true,
      })
    }
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

function matches(selected: string[], actual: string): boolean {
  return selected.length === 0 || selected.includes(actual)
}

function priorityRank(priority: Issue["priority"]): number {
  return priority === 0 ? 5 : priority
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
