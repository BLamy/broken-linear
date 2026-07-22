# Broken Linear

A Linear issue browser that requires Linear OAuth and lists bug-labeled issues from the signed-in workspace. The UI keeps the generated Linear-style shell, but the data now comes from Linear GraphQL rather than an in-memory mock.

## Stack

- Vite + React 19, TypeScript, Tailwind v4, shadcn/ui
- Zustand for UI/navigation state
- TanStack Query for server state
- Shared Linear API handler with adapters for Vercel Functions and Cloudflare Pages Functions
- `emulate` Linear service for local OAuth and GraphQL validation

## Features

- Dark Linear-inspired UI
- Linear OAuth login gate
- Teams, projects, users, labels, and issues loaded from Linear GraphQL
- Bug filtering via `LINEAR_BUG_LABELS`, defaulting to `Bug`
- Issues with identifiers, status workflow, priority, assignees, labels, and Linear links
- Views: Inbox, My issues, Active, team/project filters, search
- Create, update, and delete routed through Linear GraphQL mutations

## Local Emulation

Run the Linear emulator in one terminal:

```bash
git submodule update --init
npm install
npm run emulate:linear
```

The emulator is pinned as the `emulate/` submodule. `npm run emulate:linear`
installs its locked workspace dependencies, builds the local `emulate` package,
and starts that exact revision.

Run the Vercel local dev server in another terminal:

```bash
PUBLIC_APP_URL=http://localhost:3000 \
LINEAR_EMULATOR_URL=http://127.0.0.1:4012 \
npm run dev:vercel -- --yes
```

The local emulator uses:

- `LINEAR_CLIENT_ID=lin_example_client_id`
- `LINEAR_CLIENT_SECRET=example_client_secret`
- callback URL `http://localhost:3000/api/auth/callback`

If Vercel CLI cannot run locally because account setup is blocked, the same API handler can be validated directly against the emulator because all platform adapters share `server/linear-api.ts`.

## Production Secrets

Set these in GitHub Actions and Cloudflare Pages:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploy Cloudflare Pages and sync Pages secrets |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for Pages |
| `LINEAR_CLIENT_ID` | Linear OAuth app client ID |
| `LINEAR_CLIENT_SECRET` | Linear OAuth app client secret |
| `SESSION_SECRET` | HMAC secret for signed session cookies |
| `PUBLIC_APP_URL` | Production URL used for OAuth callback construction |

Optional vars:

- `LINEAR_BUG_LABELS`, comma-separated, defaults to `Bug`
- `LINEAR_OAUTH_SCOPES`, defaults to `read,write,issues:create,comments:create`

## Cloudflare Release

Pushes to `main` run `.github/workflows/cloudflare-release.yml`. The workflow builds the Vite app, ensures the Cloudflare Pages project exists, syncs the runtime secrets to Cloudflare Pages, and deploys `dist`.

## Scripts

| Script | What |
|---|---|
| `npm run emulate:linear` | Start the local Linear emulator on `:4012` |
| `npm run dev:vercel` | Start Vercel local dev on `:3000` |
| `npm start` | Alias for `npm run dev:vercel` |
| `npm run dev` | Vite only |
| `npm run build` | typecheck + production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run deploy:cloudflare` | Direct Cloudflare Pages deploy of `dist` |

## Layout

```
server/linear-api.ts              # shared Linear OAuth + GraphQL API handler
api/[...path].ts                  # Vercel Function adapter
functions/api/[[path]].ts         # Cloudflare Pages Function adapter
scripts/start-linear-emulator.ts  # local Linear emulator seed
src/store/ui-store.ts             # Zustand navigation store
src/queries/issues.ts             # TanStack Query hooks
src/lib/issue-filters.ts          # view filtering logic
src/components/*                  # sidebar, issue list, dialogs
```
