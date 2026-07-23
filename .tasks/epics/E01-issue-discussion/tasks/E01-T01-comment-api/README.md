# E01-T01 — Comment API

Status: `done`

## User outcome

Issue discussions use real Linear comments rather than local-only state.

## Acceptance criteria

- Comments for one issue can be listed in chronological order.
- Comments can be created, updated, and deleted.
- API errors use the existing JSON error contract.
- Comment mutations invalidate only the affected issue discussion.
