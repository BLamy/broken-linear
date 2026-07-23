# E02-T04 — Replay QA release gate

Status: `in_progress`

## User outcome

Powerful issue views are proven reliable enough to release.

## Acceptance criteria

- Run only after E02-T01 through E02-T03 pass locally.
- Reuse the canonical project from `.replay/config.json`; do not create another
  Replay QA project.
- Local build, lint, formatting, and focused filter checks pass.
- Authenticated Replay QA combines filters and exercises empty-value filters.
- Journeys prove chip removal, saved views, shared URLs, and browser history.
- Network evidence and final UI state agree with the expected result counts.
- Product defects are fixed and rerun until no unresolved bugs remain.

Create `work/` when QA starts and record project, run, recording, commit, and PR
evidence in `work/RESULTS.md`.
