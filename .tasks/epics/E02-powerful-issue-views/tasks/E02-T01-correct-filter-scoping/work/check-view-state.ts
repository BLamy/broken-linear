import assert from "node:assert/strict"
import {
  EMPTY_VALUE,
  createDefaultIssueViewState,
  filterAndSortIssues,
  issueViewStateSearch,
  readIssueViewState,
  toggleIssueFilter,
} from "../../../../../../src/lib/issue-view-state.ts"
import type { Issue } from "../../../../../../src/lib/types.ts"

const issue = (id: string, overrides: Partial<Issue> = {}): Issue => ({
  id,
  identifier: `ENG-${id}`,
  title: id,
  description: null,
  teamId: "engineering",
  projectId: null,
  status: "todo",
  priority: 3,
  assigneeId: null,
  labelIds: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: `2026-01-0${id}T00:00:00.000Z`,
  ...overrides,
})

const issues = [
  issue("1"),
  issue("2", {
    status: "in_progress",
    priority: 1,
    assigneeId: "developer",
    projectId: "project-a",
    labelIds: ["bug"],
  }),
  issue("3", { teamId: "product", status: "done" }),
]

let state = createDefaultIssueViewState()
state = toggleIssueFilter(state, "status", "todo")
state = toggleIssueFilter(state, "status", "in_progress")
assert.deepEqual(
  filterAndSortIssues(issues, state).map((item) => item.id),
  ["2", "1"],
  "values within a filter category should match inclusively"
)

state = toggleIssueFilter(state, "assignee", EMPTY_VALUE)
assert.deepEqual(
  filterAndSortIssues(issues, state).map((item) => item.id),
  ["1"],
  "unassigned should match only issues without an assignee"
)

state = toggleIssueFilter(state, "team", "engineering")
state = { ...state, sort: "identifier", density: "compact" }
const restored = readIssueViewState(issueViewStateSearch(state))
assert.equal(
  issueViewStateSearch(restored),
  issueViewStateSearch(state),
  "view state should round-trip through the URL"
)

console.log("Issue view state checks passed")
