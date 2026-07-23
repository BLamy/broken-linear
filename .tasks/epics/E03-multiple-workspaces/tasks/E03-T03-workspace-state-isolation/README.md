# E03-T03 — Workspace state isolation

Status: `pending`

## User outcome

Every screen and action reflects only the active workspace.

## Acceptance criteria

- Teams, projects, issues, comments, search, and counts are workspace-scoped.
- Saved views, create defaults, navigation, and preferences are workspace-scoped.
- Query caches and mutations cannot leak or invalidate another workspace.
- Refresh and deep links restore the intended workspace and view.
- Unavailable or disconnected workspace URLs show a clear recovery path.

Create `work/` when implementation starts and record evidence in
`work/RESULTS.md`.
