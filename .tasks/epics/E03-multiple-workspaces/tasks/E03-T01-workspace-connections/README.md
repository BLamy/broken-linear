# E03-T01 — Workspace connections

Status: `pending`

## User outcome

Users can connect, recover, and remove workspace access without losing their
other workspace sessions.

## Acceptance criteria

- OAuth can add another workspace without replacing existing connections.
- Connected workspaces list name, identity, and connection health.
- Expired connections expose a recoverable reconnect action.
- Disconnect requires confirmation and does not affect other workspaces.
- Workspace credentials remain server-side and are never exposed to the client.

Create `work/` when implementation starts and record evidence in
`work/RESULTS.md`.
