# E03-T04 — Replay QA release gate

Status: `pending`

## User outcome

Multiple-workspace behavior is proven isolated and releasable.

## Acceptance criteria

- Run only after E03-T01 through E03-T03 pass locally.
- Reuse the canonical project from `.replay/config.json`; do not create another
  Replay QA project.
- Local build, lint, formatting, and workspace-isolation checks pass.
- Replay QA connects two workspaces and switches between them repeatedly.
- Journeys create and search in each workspace, refresh deep links, and disconnect.
- Network evidence proves requests use the intended workspace connection.
- No cross-workspace UI leakage or unresolved product defects remain.

Create `work/` when QA starts and record project, run, recording, commit, and PR
evidence in `work/RESULTS.md`.
