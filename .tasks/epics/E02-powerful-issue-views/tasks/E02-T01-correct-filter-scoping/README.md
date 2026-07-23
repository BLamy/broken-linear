# E02-T01 — Correct filter scoping

Status: `done`

## User outcome

Every filter option and result is correct for the issue view the user is
currently viewing.

## Acceptance criteria

- Statuses, assignees, labels, projects, and teams only show applicable values.
- Switching team or project views clears or translates invalid criteria.
- `Unassigned`, `No project`, and `No labels` return the correct issues.
- Active filter counts and empty results remain accurate after navigation.

Create `work/` when implementation starts and record evidence in
`work/RESULTS.md`.
