# E04 — Bulk issue triage

Status: `pending`

## Outcome

Users can process a backlog efficiently without opening and editing issues one
at a time.

## Dependencies

Selection respects E02 filtered views and E03 workspace boundaries.

## Tasks

| Task                                                           | Outcome                                                     | Status  |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| [E04-T01](tasks/E04-T01-row-selection/README.md)               | Accessible single, range, and visible-list selection        | pending |
| [E04-T02](tasks/E04-T02-bulk-metadata/README.md)               | Bulk status, priority, assignee, project, and cycle changes | pending |
| [E04-T03](tasks/E04-T03-bulk-labels-delete-recovery/README.md) | Safe labels, deletion, and partial-failure recovery         | pending |
| [E04-T04](tasks/E04-T04-replayqa-release-gate/README.md)       | Authenticated Replay QA release gate                        | pending |

## Release criteria

- Mouse and keyboard users can select individual, range, and visible issues.
- Bulk metadata actions prevent invalid cross-team changes.
- Labels are added or removed without overwriting unrelated labels.
- Partial failures are understandable and retry only failed changes.
- Replay QA proves mutation counts match the intended selection.
