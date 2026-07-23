# Agent workflow

The `.tasks/` directory is the product backlog and execution record.

## Product-first rule

- Epics must describe user-visible outcomes.
- Infrastructure may only be added when a product task cannot be delivered or
  verified without it.
- Each task lives in its own folder with a `README.md`.
- While working, create `work/` inside that task for notes, scripts, screenshots,
  recordings, or other evidence. Do not put secrets in evidence.

## Epic loop

1. Create one branch and one PR for the epic.
2. Work through tasks in order and update their status.
3. Verify each task with the smallest meaningful checks and record the result in
   its `work/RESULTS.md`.
4. After all feature tasks pass, run the epic's authenticated Replay QA journeys.
5. Treat queued, incomplete, OAuth-only, or infrastructure-failed runs as
   inconclusive. Fix product defects and rerun until the journeys pass.
6. Merge the epic PR only when its acceptance criteria, local checks, CI, and
   Replay QA gate are green.

## Status

Use `pending`, `in_progress`, `qa`, `blocked`, or `done`. An epic is `done` only
after its PR is merged.
