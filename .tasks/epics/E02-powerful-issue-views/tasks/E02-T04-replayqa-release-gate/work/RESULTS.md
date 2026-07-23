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
- The first exploration, `expl-1784824815411-j0km0zrb`, reached the app but
  could not complete authentication because the tunnel initially allowed
  `localhost` but not the OAuth emulator on `127.0.0.1`.
- The same canonical tunnel was restarted with
  `--allow localhost,127.0.0.1` and reported ready.
- The focused E02 exploration is `expl-1784825035952-vo0mr7ac`. Although its
  prompt limited testing to filters and saved views and prohibited issue
  mutations, the planner generated unrelated edit, status-change, and
  issue-creation journeys. The tunnel was stopped before those write journeys
  executed.
- Relevant journey definitions were generated for filters
  (`journey-mrxqwsai-ha6c`), display options (`journey-mrxqy02t-wmgx`), and
  saved-view persistence (`journey-mrxr0qtp-446a`), but Replay QA did not
  schedule a current E02 test run or produce a recording.
- Creating a focused journey directly failed with HTTP `500`:
  `column "feedback_id" of relation "test_runs" does not exist`.
- No replacement project was created.
- The release gate is blocked on Replay QA infrastructure. No Replay-verified
  product defect has been identified, and the available run state is
  inconclusive.

## Publication

- Draft pull request: <https://github.com/BLamy/broken-linear/pull/5>
- The PR remains draft and unmerged until the canonical-project Replay gate
  produces scoped, terminal evidence.
