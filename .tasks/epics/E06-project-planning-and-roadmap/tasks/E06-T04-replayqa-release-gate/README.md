# E06-T04 — Replay QA release gate

Status: `pending`

## User outcome

Project planning and the workspace roadmap are proven releasable.

## Acceptance criteria

- Run only after E06-T01 through E06-T03 pass locally.
- Reuse the canonical project from `.replay/config.json`; do not create another
  Replay QA project.
- Local build, lint, formatting, and focused project checks pass.
- Replay QA creates and edits a project and attaches representative issues.
- Journeys verify progress, roadmap filters, archive, and restore.
- Network evidence proves every project mutation persisted.
- Product defects are fixed and rerun until no unresolved bugs remain.

Create `work/` when QA starts and record project, run, recording, commit, and PR
evidence in `work/RESULTS.md`.
