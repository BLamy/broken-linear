# E03 — Multiple workspaces

Status: `pending`

## Outcome

Users can connect and move between multiple Linear workspaces without signing
out or mixing product data.

## Dependency

Builds on E02's URL and saved-view state contract.

## Tasks

| Task                                                         | Outcome                                       | Status  |
| ------------------------------------------------------------ | --------------------------------------------- | ------- |
| [E03-T01](tasks/E03-T01-workspace-connections/README.md)     | Connect, reconnect, and disconnect workspaces | pending |
| [E03-T02](tasks/E03-T02-workspace-switcher/README.md)        | Fast, accessible workspace switching          | pending |
| [E03-T03](tasks/E03-T03-workspace-state-isolation/README.md) | Strictly workspace-scoped data and UI state   | pending |
| [E03-T04](tasks/E03-T04-replayqa-release-gate/README.md)     | Authenticated Replay QA release gate          | pending |

## Release criteria

- A user can keep more than one workspace connection.
- The workspace switcher restores each workspace's last location.
- Queries, mutations, counts, search, comments, and saved views never leak.
- Deep links and expired or disconnected workspaces recover clearly.
- Replay QA proves isolation across two authenticated workspaces.
