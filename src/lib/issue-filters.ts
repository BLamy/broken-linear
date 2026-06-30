import type { Issue, ViewId } from "./types"

const ACTIVE_STATUSES = new Set<Issue["status"]>([
  "backlog",
  "todo",
  "in_progress",
  "in_review",
])

function matchesView(
  issue: Issue,
  view: ViewId,
  currentUserId?: string
): boolean {
  if (view === "inbox") {
    return issue.status === "backlog" && issue.assigneeId === null
  }
  if (view === "my-issues") {
    return (
      issue.assigneeId === currentUserId &&
      issue.status !== "done" &&
      issue.status !== "canceled"
    )
  }
  if (view === "active") {
    return ACTIVE_STATUSES.has(issue.status)
  }
  if (view.startsWith("team:")) {
    return issue.teamId === view.slice("team:".length)
  }
  if (view.startsWith("project:")) {
    return issue.projectId === view.slice("project:".length)
  }
  return true
}

export function filterIssuesForView(
  issues: Issue[],
  view: ViewId,
  currentUserId?: string
): Issue[] {
  return issues
    .filter((i) => matchesView(i, view, currentUserId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function countInbox(issues: Issue[]): number {
  return issues.filter(
    (i) => i.status === "backlog" && i.assigneeId === null
  ).length
}

export function countMyIssues(issues: Issue[], currentUserId?: string): number {
  return issues.filter(
    (i) =>
      i.assigneeId === currentUserId &&
      i.status !== "done" &&
      i.status !== "canceled"
  ).length
}
