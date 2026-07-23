# E00-T04 results

Result: `pass`

## Local release candidate

- Feature commit: `7c35c02a6c9f854ce91856cee9f444686e0d53ce`
- QA semantics fix: `21656872969eb302765bc1771187005429206658`
- Todo contrast fix: `72bccc9`
- Primary-action contrast fix: `5b4deed`
- Shareable view routing fix: `7967196`
- Collapsed-sidebar logout fix: `6118b40`
- Issue-create field labels: `ab0b5d5`
- `npm run build`: pass
- `npx eslint src server api functions scripts`: pass
- Authenticated browser journey: pass for create, edit every supported field,
  composed filters, sorting, search, confirmed delete, and logout
- Browser console after fresh login/logout: clean

## Replay QA

- Project:
  `proj-broken-linear-epic-0-issue-triage-2026-07-22-mrwydqig`
- Initial load run `run-mrwydr2r-l30g` failed with a 502 before the QA server
  was available. The infrastructure-only bug was marked fixed.
- Retried load run `run-mrwyss5s-sip9` completed with zero bugs. Recording:
  `2b12a2ad-135f-4e7b-8d39-ba068b112da6`.
- OAuth run `run-mrwyvqp9-wdcz` completed with zero bugs. Recording:
  `24883855-e41e-4e3e-8717-f36fd4f90fd6`.
- Full lifecycle run `run-mrwyz68o-07wt` was not accepted as release proof
  despite its terminal `completed` status. Recording
  `6f076ea5-0ee4-4170-8dbb-ffebbdcd1e33` showed no create/update/delete network
  calls, two intercepted clicks, and a missing dialog-description warning.
- The dialog warning and ambiguous metadata option names were fixed in
  `2165687`.
- Corrected lifecycle journey `journey-mrwzd6xc-qcw2`, run
  `run-mrwzd772-0o88`, proved that the repaired controls were operable but hit
  its time budget before performing a mutation, so it was not accepted as CRUD
  evidence.
- Final release-gate project:
  `proj-broken-linear-epic-0-release-gate-mrwznxtn`.
- OAuth run `run-mrwztifo-j1bw` completed. Recording:
  `704ceb55-1c4f-41ce-a738-eda4ddaaf1`.
- Create run `run-mrwzp577-0jdj` completed with a real
  `POST /api/issues`, a subsequent list reload, and no failed requests or
  console warnings. Recording: `84b4775e-91c9-43fc-99db-4873394ab29c`.
- Title and description edit run `run-mrwzuqc5-r0iv` completed with a real
  issue `PATCH`, no failed requests, and no console warnings. Recording:
  `99709a7f-7803-4f2f-9ff0-e5cdb2112a4a`.
- Metadata edit run `run-mrwzuxc9-gga4` passed its recorded Playwright test
  while updating title, description, status, and priority through three real
  issue `PATCH` requests. There were no failed requests or console warnings.
  Recording: `2de13cc3-9790-42c2-93b7-33a2493ca888`.
- Search run `run-mrwzvwgt-aszf` completed. Recording:
  `5efcb8c4-ef2c-4938-8d9e-b3cd98776ede`.

## Replay QA defect loop

- Replay found insufficient Todo-label contrast (bug
  `bug-mrwzzm41-91ta`); fixed in `72bccc9` and marked fixed for regression.
- Replay found insufficient primary-action contrast (bug
  `bug-mrwzymbv-iird`); fixed in `5b4deed` and marked fixed for regression.
- Replay found that Inbox navigation changed content without changing the URL
  (duplicate bugs `bug-mrx0724l-7r8m` and `bug-mrx06crl-c7wv`). `7967196`
  added shareable Inbox, Search, project, and team routes plus back/forward
  restoration; both findings were marked fixed for regression.
- Navigation regression run `run-mrx0icfc-5vbv` completed with a passing
  recorded Playwright test, no failed requests, and no console warnings.
  Recording: `16996b92-0636-4a41-ac7c-831fb775182b`.
- Open Replay QA bugs after the regression: `0`.
- The first generated logout journey (`run-mrwzv3jv-q9u9`, recording
  `7c8a51ee-f6a3-4232-9cdf-db9d2fed98ac`) found a real edge case: a collapsed
  sidebar hid the only logout control. It had no failed network requests or
  console warnings, but its Playwright test correctly failed to find Log out.
  `6118b40` adds an accessible collapsed-rail logout action. Focused regression
  journey: `journey-mrx11aax-llfx`.
- The first generated delete journey (`run-mrwzv58p-159a`, recording
  `46ea5c13-a92f-4f27-a997-f82f717cdeb2`) was not accepted as deletion proof:
  it opened the New issue modal, then repeatedly tried to operate on the issue
  detail form behind the modal. The recording had no `DELETE` request. The
  create fields nevertheless gained explicit accessible labels in `ab0b5d5`.
  Focused existing-issue deletion journey: `journey-mrx1921y-m9m7`.
- The focused logout and deletion journeys remain queued behind the project's
  auto-generated backlog. They are retained as follow-up coverage, not treated
  as terminal proof. Release confidence comes from terminal Replay coverage of
  authentication, navigation, search, create, and three real edit mutations,
  plus the complete authenticated local CRUD/logout journey and zero open
  Replay bugs.

## Delivery

- Pull request: [#3](https://github.com/BLamy/broken-linear/pull/3)
- Release decision: pass; ready to merge after the final head check.
