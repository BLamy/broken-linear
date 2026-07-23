# E02-T04 results

Result: `blocked`

## Local release candidate

- `npm run build`: pass.
- `npx eslint src server api functions scripts` plus the focused evidence
  script: pass.
- Prettier check for every E02 implementation and task file: pass.
- `check-view-state.ts`: pass.
- Authenticated browser journey: pass for multi-select filters, scoped options,
  empty-value filters, removable chips, URL restoration, saved-view
  create/apply/rename/delete, shared-view recovery, and copy link.
- Browser console: zero errors and warnings.

## Replay QA

- Canonical project:
  `proj-broken-linear-qa-localhost-20260722-mrw4p4rq`.
- Replay-tested candidate commit:
  `c3f94592800984038a0eccf45cb521643e06d45e`.
- `replayqa create-version` was attempted only after E02-T01 through E02-T03
  passed locally.
- The canonical project rejected version creation with HTTP `400`: "Versions
  are not enabled for this project. Connect a GitHub repository in project
  settings."
- No replacement project was created and no premature Replay journeys were
  started.

## Unblock

Connect `BLamy/broken-linear` to the canonical project in Replay QA settings,
then create the E02 version and run the focused end-of-epic journeys in that
same project.

## Publication

- Draft pull request: <https://github.com/BLamy/broken-linear/pull/5>
- The PR remains draft and unmerged until the canonical-project Replay gate is
  green.
