# E05-T04 — Replay QA release gate

Status: `pending`

## User outcome

Cycle planning is proven accurate and releasable.

## Acceptance criteria

- Run only after E05-T01 through E05-T03 pass locally.
- Reuse the canonical project from `.replay/config.json`; do not create another
  Replay QA project.
- Local build, lint, formatting, and focused cycle checks pass.
- Replay QA opens current, upcoming, completed, and empty cycle states.
- Journeys assign, move, and remove issues and verify progress changes.
- Reloaded data and network evidence confirm every mutation persisted.
- Product defects are fixed and rerun until no unresolved bugs remain.

Create `work/` when QA starts and record project, run, recording, commit, and PR
evidence in `work/RESULTS.md`.
