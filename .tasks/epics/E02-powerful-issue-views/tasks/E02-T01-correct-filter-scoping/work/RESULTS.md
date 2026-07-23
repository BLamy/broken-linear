# E02-T01 results

Result: `pass`

## Evidence

- Filter options are scoped to the active team or project when applicable.
- `Unassigned`, `No project`, and `No labels` use explicit empty-value
  semantics.
- Navigating to another issue view clears criteria that belonged to the prior
  view.
- `check-view-state.ts`: pass for inclusive status matching, unassigned
  matching, and URL round-tripping.
- Authenticated browser checks: pass for empty-value filters, scoped team
  options, unavailable shared criteria, and accurate result counts.
