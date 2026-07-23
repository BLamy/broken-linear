# E04-T04 — Replay QA release gate

Status: `pending`

## User outcome

Bulk triage is proven safe enough to release.

## Acceptance criteria

- Run only after E04-T01 through E04-T03 pass locally.
- Reuse the canonical project from `.replay/config.json`; do not create another
  Replay QA project.
- Local build, lint, formatting, and focused selection checks pass.
- Replay QA proves range selection and filtered select-all.
- Journeys mutate metadata and labels, recover from partial failure, and delete.
- Recorded mutation counts and issue identifiers match the selected issues.
- No unintended issue changes or unresolved product defects remain.

Create `work/` when QA starts and record project, run, recording, commit, and PR
evidence in `work/RESULTS.md`.
