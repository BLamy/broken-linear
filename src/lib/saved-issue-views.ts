import {
  createDefaultIssueViewState,
  type IssueViewState,
} from "@/lib/issue-view-state"

export interface SavedIssueView {
  id: string
  name: string
  state: IssueViewState
  createdAt: string
  updatedAt: string
}

function storageKey(scopeId: string): string {
  return `linear.saved-issue-views.${scopeId}`
}

export function readSavedIssueViews(scopeId: string): SavedIssueView[] {
  if (!scopeId) return []

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(scopeId)) || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedIssueView)
  } catch {
    return []
  }
}

export function createSavedIssueView(
  scopeId: string,
  name: string,
  state: IssueViewState
): SavedIssueView[] {
  const current = readSavedIssueViews(scopeId)
  const now = new Date().toISOString()
  const saved: SavedIssueView = {
    id: crypto.randomUUID(),
    name: name.trim(),
    state,
    createdAt: now,
    updatedAt: now,
  }
  return writeSavedIssueViews(scopeId, [...current, saved])
}

export function renameSavedIssueView(
  scopeId: string,
  id: string,
  name: string
): SavedIssueView[] {
  return writeSavedIssueViews(
    scopeId,
    readSavedIssueViews(scopeId).map((view) =>
      view.id === id
        ? { ...view, name: name.trim(), updatedAt: new Date().toISOString() }
        : view
    )
  )
}

export function deleteSavedIssueView(
  scopeId: string,
  id: string
): SavedIssueView[] {
  return writeSavedIssueViews(
    scopeId,
    readSavedIssueViews(scopeId).filter((view) => view.id !== id)
  )
}

function writeSavedIssueViews(
  scopeId: string,
  views: SavedIssueView[]
): SavedIssueView[] {
  localStorage.setItem(storageKey(scopeId), JSON.stringify(views))
  return views
}

function isSavedIssueView(value: unknown): value is SavedIssueView {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<SavedIssueView>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    isIssueViewState(candidate.state)
  )
}

function isIssueViewState(value: unknown): value is IssueViewState {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<IssueViewState>
  const defaults = createDefaultIssueViewState()
  return (
    (candidate.sort === "updated" ||
      candidate.sort === "priority" ||
      candidate.sort === "identifier") &&
    (candidate.density === "comfortable" || candidate.density === "compact") &&
    Boolean(candidate.filters) &&
    Object.keys(defaults.filters).every((key) =>
      Array.isArray(candidate.filters?.[key as keyof typeof defaults.filters])
    )
  )
}
