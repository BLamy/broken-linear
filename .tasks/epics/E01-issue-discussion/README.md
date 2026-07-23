# E01 — Issue discussion

Status: `qa`

## Outcome

A signed-in user can read an issue's conversation and create, edit, or delete
comments without leaving the issue detail view.

## Tasks

| Task | Outcome | Status |
|---|---|---|
| [E01-T01](tasks/E01-T01-comment-api/README.md) | Complete comment lifecycle through the Linear API | done |
| [E01-T02](tasks/E01-T02-discussion-ui/README.md) | Useful discussion thread in issue details | done |
| [E01-T03](tasks/E01-T03-comment-polish/README.md) | Keyboard, accessibility, and failure-state polish | done |
| [E01-T04](tasks/E01-T04-replayqa-release-gate/README.md) | Authenticated Replay QA release gate | in_progress |

## Release criteria

- Existing comments load in chronological order with author and timestamp.
- A user can post a comment, edit it, and delete it after confirmation.
- Empty, loading, pending, and error states are understandable and recoverable.
- Comment controls are keyboard-operable and expose useful accessible names.
- Authenticated Replay QA proves the discussion lifecycle and the epic has no
  unresolved product defects.
