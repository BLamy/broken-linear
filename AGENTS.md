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
4. Do not run Replay QA while feature tasks are still being implemented. Use
   local checks and focused browser verification during development.
5. After every feature task in the epic passes locally, move the epic to `qa`
   and run its authenticated Replay QA release gate once.
6. Always reuse the canonical Broken Linear Replay QA project configured in
   `.replay/config.json`:
   `proj-broken-linear-qa-localhost-20260722-mrw4p4rq`. Create a new app version
   and epic-specific journeys inside that project; never create a project per
   epic, task, fix, or regression.
7. If the canonical project is unavailable or cannot accept a new version, stop
   and report the blocker. Do not silently create a replacement project.
8. Treat queued, incomplete, OAuth-only, or infrastructure-failed runs as
   inconclusive. Fix defects found by the end-of-epic gate and rerun only the
   affected journeys in the same project until they pass.
9. Merge the epic PR only when its acceptance criteria, local checks, CI, and
   Replay QA gate are green.

## Status

Use `pending`, `in_progress`, `qa`, `blocked`, or `done`. An epic is `done` only
after its PR is merged.
