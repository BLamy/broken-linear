# E00 — Issue triage and editing

Status: `done`

## Outcome

A signed-in user can manage the useful lifecycle of an issue without leaving the
app: create it with the right metadata, find it, filter and sort the backlog,
edit every supported field, and delete it safely.

## Tasks

| Task | Outcome | Status |
|---|---|---|
| [E00-T01](tasks/E00-T01-complete-issue-editor/README.md) | Complete issue creation and editing | done |
| [E00-T02](tasks/E00-T02-filter-sort/README.md) | Working filters and sorting | done |
| [E00-T03](tasks/E00-T03-keyboard-polish/README.md) | Keyboard-first and resilient workflows | done |
| [E00-T04](tasks/E00-T04-replayqa-release-gate/README.md) | Authenticated Replay QA release gate | done |

## Release criteria

- Create and edit title, description, status, priority, project, assignee, and labels.
- Filter by status, priority, assignee, and label; sort by updated date, priority, or identifier.
- Keyboard shortcuts open create and search without firing inside form fields.
- Destructive deletion requires confirmation and all mutations show pending/error feedback.
- Authenticated Replay QA covers login, create, edit, filter/search, delete, and logout.
- The epic PR is merged only after the release gate passes.
