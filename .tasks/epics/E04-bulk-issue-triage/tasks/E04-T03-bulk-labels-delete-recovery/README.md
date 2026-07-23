# E04-T03 — Bulk labels, deletion, and recovery

Status: `pending`

## User outcome

Users can perform risky bulk actions without losing unrelated data or repeating
successful work.

## Acceptance criteria

- Labels can be added or removed without replacing unrelated labels.
- Bulk deletion requires confirmation that includes the issue count.
- Partial failures identify every failed issue and reason.
- Failed issues remain selected and can be retried independently.
- Successful mutations are not repeated during recovery.

Create `work/` when implementation starts and record evidence in
`work/RESULTS.md`.
