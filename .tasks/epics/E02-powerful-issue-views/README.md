# E02 — Powerful issue views

Status: `qa`

## Outcome

Users can reliably build, understand, save, and share precise issue views.

## Dependency

Builds on E00's issue list, search, and basic single-value filters.

## Tasks

| Task                                                        | Outcome                                                    | Status      |
| ----------------------------------------------------------- | ---------------------------------------------------------- | ----------- |
| [E02-T01](tasks/E02-T01-correct-filter-scoping/README.md)   | Correct, view-aware filter options and empty-value filters | done        |
| [E02-T02](tasks/E02-T02-multiselect-filter-chips/README.md) | Multi-select filters with visible, removable criteria      | done        |
| [E02-T03](tasks/E02-T03-saved-shareable-views/README.md)    | Persistent, saved, and shareable issue views               | done        |
| [E02-T04](tasks/E02-T04-replayqa-release-gate/README.md)    | Authenticated Replay QA release gate                       | in_progress |

## Release criteria

- Filters only offer values valid for the active workspace and view.
- Empty-value filters and combinations return correct issues.
- Active criteria are visible and removable without reopening the menu.
- Filter, sort, and density state survives URLs, refresh, and browser history.
- Saved views can be created, renamed, applied, shared, and deleted.
- Replay QA proves the complete view lifecycle with no unresolved defects.
