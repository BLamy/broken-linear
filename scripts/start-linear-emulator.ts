type EmulatorApi = {
  createEmulator: (options: {
    service: "linear"
    port: number
    seed: Record<string, unknown>
  }) => Promise<{ url: string }>
}

const submoduleApiUrl = new URL(
  "../emulate/packages/emulate/dist/api.js",
  import.meta.url
).href
const { createEmulator } = (await import(submoduleApiUrl)) as EmulatorApi

const port = Number(process.env.LINEAR_EMULATOR_PORT ?? 4012)
const appUrl = (process.env.PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
)

const emulator = await createEmulator({
  service: "linear",
  port,
  seed: {
    linear: {
      organization: {
        name: "Acme",
        url_key: "acme",
      },
      users: [
        { email: "admin@example.com", name: "Admin User", admin: true },
        { email: "dev@example.com", name: "Developer" },
      ],
      teams: [
        {
          key: "ENG",
          name: "Engineering",
          states: [
            { name: "Backlog", type: "backlog" },
            { name: "Todo", type: "unstarted" },
            { name: "In Progress", type: "started" },
            { name: "In Review", type: "started" },
            { name: "Done", type: "completed" },
          ],
        },
      ],
      labels: [
        { name: "Bug", color: "#d92d20", team: "ENG" },
        { name: "Feature", color: "#2563eb", team: "ENG" },
      ],
      issues: [
        {
          team: "ENG",
          title: "Fix local checkout test",
          description: "Reproduce and fix the checkout failure.",
          state: "Todo",
          assignee: "dev@example.com",
          labels: ["Bug"],
        },
        {
          team: "ENG",
          title: "Add workspace import flow",
          description:
            "A feature issue that should be filtered out by the bug view.",
          state: "Backlog",
          assignee: "admin@example.com",
          labels: ["Feature"],
        },
      ],
      oauth_apps: [
        {
          client_id: "lin_example_client_id",
          client_secret: "example_client_secret",
          name: "Broken Linear Local",
          redirect_uris: [
            `${appUrl}/api/auth/callback`,
            `${appUrl}/api/auth/callback/linear`,
          ],
          scopes: ["read", "write", "issues:create", "comments:create"],
          actor: "user",
        },
      ],
      tokens: [
        {
          token: "lin_test_admin",
          user: "admin@example.com",
          scopes: [
            "read",
            "write",
            "issues:create",
            "comments:create",
            "admin",
          ],
        },
      ],
      strict_scopes: false,
    },
  },
})

console.log(`Linear emulator ready at ${emulator.url}`)
console.log(`Use LINEAR_EMULATOR_URL=${emulator.url} with npm run dev:vercel`)

await new Promise(() => {})
