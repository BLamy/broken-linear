# E01-T01 results

Result: `pass`

- Added authenticated list/create/update/delete comment routes backed by Linear
  GraphQL.
- Comments are mapped to the app contract with author, timestamps, issue, and
  viewer ownership.
- Empty bodies and bodies over 10,000 characters are rejected.
- Edit and delete enforce comment ownership before mutation.
- TanStack Query invalidates only the affected issue discussion.
- `npm run build`: pass.
- `npx eslint src server api functions scripts`: pass.
