# E04-T02 — Bulk metadata updates

Status: `pending`

## User outcome

Users can apply common triage decisions to several issues in one action.

## Acceptance criteria

- Selected issues can change status, priority, assignee, project, and cycle.
- The bulk toolbar shows the selected count and pending state.
- Choices invalid for the selected teams are disabled with an explanation.
- Successful changes update all affected issue views without a hard reload.
- Double-submit is prevented and failures preserve the user's selection.

Create `work/` when implementation starts and record evidence in
`work/RESULTS.md`.
