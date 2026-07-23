# E06 — Project planning and roadmap

Status: `pending`

## Outcome

Users can create and manage projects, understand progress, and scan delivery
plans across the active workspace.

## Dependencies

Uses E03 workspace isolation and E05 cycle context where available.

## Tasks

| Task                                                     | Outcome                                             | Status  |
| -------------------------------------------------------- | --------------------------------------------------- | ------- |
| [E06-T01](tasks/E06-T01-project-overview/README.md)      | Rich project status, ownership, dates, and progress | pending |
| [E06-T02](tasks/E06-T02-project-lifecycle/README.md)     | Create, edit, archive, and restore projects         | pending |
| [E06-T03](tasks/E06-T03-workspace-roadmap/README.md)     | Cross-team roadmap with useful filters              | pending |
| [E06-T04](tasks/E06-T04-replayqa-release-gate/README.md) | Authenticated Replay QA release gate                | pending |

## Release criteria

- Project pages communicate ownership, timing, health, and progress.
- Authorized users can manage the complete project lifecycle safely.
- The roadmap organizes delivery across teams and target windows.
- Project and issue changes update progress without a hard refresh.
- Replay QA proves persisted project and roadmap workflows.
