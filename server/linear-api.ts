import type { Issue, IssueStatus, Label, Priority, Project, Team, User } from "../src/lib/types"

type Env = Record<string, string | undefined>

type Session = {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  user: {
    id: string
    name: string
    email?: string
    avatarUrl?: string | null
  }
  organization?: {
    id: string
    name: string
    urlKey?: string
  }
}

type LinearConfig = {
  authUrl: string
  tokenUrl: string
  graphqlUrl: string
  clientId: string
  clientSecret: string
  scopes: string
  redirectUri: string
  sessionSecret: string
  emulator: boolean
}

type LinearIssue = {
  id: string
  identifier: string
  title: string
  description: string | null
  priority: number
  url?: string
  createdAt: string
  updatedAt: string
  team: LinearTeam
  state: LinearState
  assignee: LinearUser | null
  labels: { nodes: LinearLabel[] }
  project: LinearProject | null
}

type LinearTeam = {
  id: string
  key: string
  name: string
  color?: string | null
  states?: { nodes: LinearState[] }
  projects?: { nodes: LinearProject[] }
}

type LinearState = {
  id: string
  name: string
  type: string
}

type LinearUser = {
  id: string
  name: string
  displayName?: string
  email?: string
  initials?: string
  avatarUrl?: string | null
  avatarBackgroundColor?: string | null
}

type LinearLabel = {
  id: string
  name: string
  color: string
  team?: { id: string } | null
}

type LinearProject = {
  id: string
  name: string
  team?: { id: string } | null
}

const SESSION_COOKIE = "linear_session"
const STATE_COOKIE = "linear_oauth_state"
const DEFAULT_LINEAR_SCOPES = "read,write,issues:create,comments:create"
const DEFAULT_EMULATOR_CLIENT_ID = "lin_example_client_id"
const DEFAULT_EMULATOR_CLIENT_SECRET = "example_client_secret"

const textEncoder = new TextEncoder()

export async function handleLinearRequest(request: Request, env: Env = {}): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"

  try {
    if (path === "/auth/login" && request.method === "GET") {
      return handleLogin(request, env)
    }

    if (path === "/auth/callback" && request.method === "GET") {
      return handleCallback(request, env)
    }

    if (path === "/auth/logout" && request.method === "POST") {
      return redirect("/", [clearCookie(SESSION_COOKIE)])
    }

    if (path === "/session" && request.method === "GET") {
      const session = await readSession(request, env)
      return json({
        authenticated: Boolean(session),
        user: session?.user ?? null,
        organization: session?.organization ?? null,
      })
    }

    const session = await requireSession(request, env)

    if (path === "/teams" && request.method === "GET") {
      const data = await fetchLinearData(session, env)
      return json(data.teams)
    }

    if (path === "/projects" && request.method === "GET") {
      const teamId = url.searchParams.get("teamId")
      const data = await fetchLinearData(session, env)
      const projects = teamId
        ? data.projects.filter((project) => project.teamId === teamId)
        : data.projects
      return json(projects)
    }

    if (path === "/labels" && request.method === "GET") {
      const data = await fetchLinearData(session, env)
      return json(data.labels)
    }

    if (path === "/users" && request.method === "GET") {
      const data = await fetchLinearData(session, env)
      return json(data.users)
    }

    if (path === "/issues" && request.method === "GET") {
      const teamId = url.searchParams.get("teamId")
      const projectId = url.searchParams.get("projectId")
      const data = await fetchLinearData(session, env)
      let issues = data.issues
      if (teamId) issues = issues.filter((issue) => issue.teamId === teamId)
      if (projectId) {
        issues = issues.filter((issue) => issue.projectId === projectId)
      }
      return json(issues)
    }

    if (path === "/issues" && request.method === "POST") {
      const input = (await request.json()) as Partial<Issue> & { teamId: string }
      const issue = await createLinearIssue(session, env, input)
      return json(issue, 201)
    }

    if (path === "/search" && request.method === "GET") {
      const query = (url.searchParams.get("q") || "").trim().toLowerCase()
      const data = await fetchLinearData(session, env)
      const results = query
        ? data.issues.filter(
            (issue) =>
              issue.title.toLowerCase().includes(query) ||
              issue.identifier.toLowerCase().includes(query)
          )
        : []
      return json({ query, results })
    }

    const issueMatch = path.match(/^\/issues\/([^/]+)$/)
    if (issueMatch) {
      const id = decodeURIComponent(issueMatch[1])
      if (request.method === "PATCH") {
        const patch = (await request.json()) as Partial<Issue>
        const issue = await updateLinearIssue(session, env, id, patch)
        return json(issue)
      }
      if (request.method === "DELETE") {
        const issue = await deleteLinearIssue(session, env, id)
        return json(issue)
      }
    }

    return json({ error: "not found", path }, 404)
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ error: error.message }, error.status)
    }
    console.error(error)
    return json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
}

class ApiError extends Error {
  readonly status: number

  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

function envValue(env: Env, key: string): string | undefined {
  const processEnv =
    typeof process !== "undefined" ? process.env[key] : undefined
  return env[key] ?? processEnv
}

function requestOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedHost = request.headers.get("x-forwarded-host")
  if (forwardedHost) {
    return `${forwardedProto || url.protocol.replace(":", "")}://${forwardedHost}`
  }
  return url.origin
}

function getConfig(request: Request, env: Env): LinearConfig {
  const emulatorUrl = envValue(env, "LINEAR_EMULATOR_URL")?.replace(/\/$/, "")
  const baseUrl =
    envValue(env, "PUBLIC_APP_URL")?.replace(/\/$/, "") ?? requestOrigin(request)
  const redirectUri =
    envValue(env, "LINEAR_REDIRECT_URI") ?? `${baseUrl}/api/auth/callback`
  const emulator = Boolean(emulatorUrl)
  const clientId =
    envValue(env, "LINEAR_CLIENT_ID") ??
    envValue(env, "LINEAR_OAUTH_CLIENT_ID") ??
    (emulator ? DEFAULT_EMULATOR_CLIENT_ID : "")
  const clientSecret =
    envValue(env, "LINEAR_CLIENT_SECRET") ??
    envValue(env, "LINEAR_OAUTH_CLIENT_SECRET") ??
    (emulator ? DEFAULT_EMULATOR_CLIENT_SECRET : "")
  const sessionSecret =
    envValue(env, "SESSION_SECRET") ??
    envValue(env, "LINEAR_SESSION_SECRET") ??
    (emulator ? "local-linear-emulator-session-secret" : "")

  if (!clientId) throw new ApiError("LINEAR_CLIENT_ID is not configured", 500)
  if (!clientSecret) {
    throw new ApiError("LINEAR_CLIENT_SECRET is not configured", 500)
  }
  if (!sessionSecret) throw new ApiError("SESSION_SECRET is not configured", 500)

  return {
    authUrl:
      envValue(env, "LINEAR_AUTH_URL") ??
      (emulator
        ? `${emulatorUrl}/oauth/authorize`
        : "https://linear.app/oauth/authorize"),
    tokenUrl:
      envValue(env, "LINEAR_TOKEN_URL") ??
      (emulator ? `${emulatorUrl}/oauth/token` : "https://api.linear.app/oauth/token"),
    graphqlUrl:
      envValue(env, "LINEAR_GRAPHQL_URL") ??
      (emulator ? `${emulatorUrl}/graphql` : "https://api.linear.app/graphql"),
    clientId,
    clientSecret,
    scopes: envValue(env, "LINEAR_OAUTH_SCOPES") ?? DEFAULT_LINEAR_SCOPES,
    redirectUri,
    sessionSecret,
    emulator,
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const config = getConfig(request, env)
  const state = randomToken()
  const authUrl = new URL(config.authUrl)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", config.clientId)
  authUrl.searchParams.set("redirect_uri", config.redirectUri)
  authUrl.searchParams.set("scope", config.scopes)
  authUrl.searchParams.set("state", state)
  return redirect(authUrl.toString(), [
    cookie(STATE_COOKIE, state, request, { maxAge: 600 }),
  ])
}

async function handleCallback(request: Request, env: Env): Promise<Response> {
  const config = getConfig(request, env)
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const expectedState = parseCookies(request.headers.get("cookie"))[STATE_COOKIE]

  if (!code) throw new ApiError("Linear did not return an OAuth code", 400)
  if (!state || !expectedState || state !== expectedState) {
    throw new ApiError("OAuth state did not match", 400)
  }

  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const message = await tokenRes.text()
    throw new ApiError(`Linear token exchange failed: ${message}`, 502)
  }

  const token = (await tokenRes.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
  }

  if (!token.access_token) {
    throw new ApiError("Linear token exchange did not return an access token", 502)
  }

  const profile = await fetchLinearProfile(token.access_token, config.graphqlUrl)
  const session: Session = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: token.expires_in
      ? Date.now() + token.expires_in * 1000
      : undefined,
    user: profile.user,
    organization: profile.organization,
  }

  return redirect("/", [
    cookie(
      SESSION_COOKIE,
      await signSession(session, config.sessionSecret),
      request,
      { maxAge: 60 * 60 * 24 * 14 }
    ),
    clearCookie(STATE_COOKIE),
  ])
}

async function readSession(request: Request, env: Env): Promise<Session | null> {
  const raw = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE]
  if (!raw) return null
  const config = getConfig(request, env)
  const session = await verifySession(raw, config.sessionSecret)
  if (!session) return null
  if (session.expiresAt && session.expiresAt < Date.now()) return null
  return session
}

async function requireSession(request: Request, env: Env): Promise<Session> {
  const session = await readSession(request, env)
  if (!session) throw new ApiError("Not authenticated with Linear", 401)
  return session
}

const PROFILE_QUERY = `
query LinearProfile {
  viewer {
    id
    name
    displayName
    email
    avatarUrl
  }
  organization {
    id
    name
    urlKey
  }
}
`

const BOOTSTRAP_QUERY = `
query LinearAppData {
  teams(first: 100) {
    nodes {
      id
      key
      name
      color
      states(first: 50) {
        nodes {
          id
          name
          type
        }
      }
      projects(first: 100) {
        nodes {
          id
          name
          team { id }
        }
      }
    }
  }
  users(first: 100) {
    nodes {
      id
      name
      displayName
      email
      initials
      avatarUrl
      avatarBackgroundColor
    }
  }
  issueLabels(first: 100) {
    nodes {
      id
      name
      color
      team { id }
    }
  }
  projects(first: 100) {
    nodes {
      id
      name
      team { id }
    }
  }
  issues(first: 100) {
    nodes {
      id
      identifier
      title
      description
      priority
      url
      createdAt
      updatedAt
      team { id key name }
      state { id name type }
      assignee {
        id
        name
        displayName
        email
        initials
        avatarUrl
        avatarBackgroundColor
      }
      labels(first: 20) {
        nodes { id name color team { id } }
      }
      project { id name team { id } }
    }
  }
}
`

const ISSUE_FIELDS = `
fragment IssueFields on Issue {
  id
  identifier
  title
  description
  priority
  url
  createdAt
  updatedAt
  team { id key name }
  state { id name type }
  assignee {
    id
    name
    displayName
    email
    initials
    avatarUrl
    avatarBackgroundColor
  }
  labels(first: 20) {
    nodes { id name color team { id } }
  }
  project { id name team { id } }
}
`

async function fetchLinearProfile(
  accessToken: string,
  graphqlUrl: string
): Promise<Pick<Session, "user" | "organization">> {
  const data = await linearGraphql<{
    viewer: LinearUser
    organization: { id: string; name: string; urlKey: string }
  }>(accessToken, graphqlUrl, PROFILE_QUERY)
  return {
    user: {
      id: data.viewer.id,
      name: data.viewer.displayName || data.viewer.name,
      email: data.viewer.email,
      avatarUrl: data.viewer.avatarUrl,
    },
    organization: data.organization,
  }
}

async function fetchLinearData(
  session: Session,
  env: Env
): Promise<{
  teams: Team[]
  projects: Project[]
  labels: Label[]
  users: User[]
  issues: Issue[]
  statesByTeam: Map<string, LinearState[]>
}> {
  const config = getConfig(new Request("http://local.invalid/api/session"), env)
  const data = await linearGraphql<{
    teams: { nodes: LinearTeam[] }
    users: { nodes: LinearUser[] }
    issueLabels: { nodes: LinearLabel[] }
    projects: { nodes: LinearProject[] }
    issues: { nodes: LinearIssue[] }
  }>(session.accessToken, config.graphqlUrl, BOOTSTRAP_QUERY)

  const bugNames = new Set(
    (envValue(env, "LINEAR_BUG_LABELS") ?? "Bug,bug")
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean)
  )
  const statesByTeam = new Map(
    data.teams.nodes.map((team) => [team.id, team.states?.nodes ?? []])
  )
  const projectMap = new Map<string, Project>()

  for (const team of data.teams.nodes) {
    for (const project of team.projects?.nodes ?? []) {
      projectMap.set(project.id, mapProject(project, team.id))
    }
  }
  for (const project of data.projects.nodes) {
    projectMap.set(
      project.id,
      mapProject(project, project.team?.id ?? data.teams.nodes[0]?.id ?? "linear")
    )
  }

  return {
    teams: data.teams.nodes.map(mapTeam),
    projects: [...projectMap.values()],
    labels: data.issueLabels.nodes.map(mapLabel),
    users: data.users.nodes.map(mapUser),
    issues: data.issues.nodes
      .filter((issue) =>
        issue.labels.nodes.some((label) => bugNames.has(label.name.toLowerCase()))
      )
      .map(mapIssue),
    statesByTeam,
  }
}

async function createLinearIssue(
  session: Session,
  env: Env,
  input: Partial<Issue> & { teamId: string }
): Promise<Issue> {
  const config = getConfig(new Request("http://local.invalid/api/session"), env)
  const data = await fetchLinearData(session, env)
  const stateId = input.status
    ? stateIdForStatus(data.statesByTeam.get(input.teamId), input.status)
    : undefined
  const result = await linearGraphql<{
    issueCreate: { success: boolean; issue: LinearIssue | null }
  }>(
    session.accessToken,
    config.graphqlUrl,
    `
    ${ISSUE_FIELDS}
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { ...IssueFields }
      }
    }
    `,
    {
      input: {
        teamId: input.teamId,
        title: (input.title || "").trim(),
        description: input.description ?? undefined,
        priority: input.priority ?? 0,
        projectId: input.projectId ?? undefined,
        assigneeId: input.assigneeId ?? undefined,
        labelIds: input.labelIds ?? undefined,
        stateId,
      },
    }
  )
  if (!result.issueCreate.issue) {
    throw new ApiError("Linear did not return the created issue", 502)
  }
  return mapIssue(result.issueCreate.issue)
}

async function updateLinearIssue(
  session: Session,
  env: Env,
  id: string,
  patch: Partial<Issue>
): Promise<Issue> {
  const config = getConfig(new Request("http://local.invalid/api/session"), env)
  const existing = await getLinearIssue(session, env, id)
  const data = await fetchLinearData(session, env)
  const input: Record<string, unknown> = {}
  if ("title" in patch) input.title = patch.title
  if ("description" in patch) input.description = patch.description
  if ("priority" in patch) input.priority = patch.priority
  if ("assigneeId" in patch) input.assigneeId = patch.assigneeId
  if ("projectId" in patch) input.projectId = patch.projectId
  if ("labelIds" in patch) input.labelIds = patch.labelIds
  if ("status" in patch && patch.status) {
    input.stateId = stateIdForStatus(data.statesByTeam.get(existing.teamId), patch.status)
  }

  const result = await linearGraphql<{
    issueUpdate: { success: boolean; issue: LinearIssue | null }
  }>(
    session.accessToken,
    config.graphqlUrl,
    `
    ${ISSUE_FIELDS}
    mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { ...IssueFields }
      }
    }
    `,
    { id, input }
  )
  if (!result.issueUpdate.issue) {
    throw new ApiError("Linear did not return the updated issue", 502)
  }
  return mapIssue(result.issueUpdate.issue)
}

async function deleteLinearIssue(
  session: Session,
  env: Env,
  id: string
): Promise<Issue> {
  const config = getConfig(new Request("http://local.invalid/api/session"), env)
  const existing = await getLinearIssue(session, env, id)
  await linearGraphql(
    session.accessToken,
    config.graphqlUrl,
    `
    mutation DeleteIssue($id: String!) {
      issueDelete(id: $id) {
        success
      }
    }
    `,
    { id }
  )
  return existing
}

async function getLinearIssue(
  session: Session,
  env: Env,
  id: string
): Promise<Issue> {
  const config = getConfig(new Request("http://local.invalid/api/session"), env)
  const result = await linearGraphql<{ issue: LinearIssue | null }>(
    session.accessToken,
    config.graphqlUrl,
    `
    ${ISSUE_FIELDS}
    query Issue($id: String!) {
      issue(id: $id) { ...IssueFields }
    }
    `,
    { id }
  )
  if (!result.issue) throw new ApiError("Issue not found", 404)
  return mapIssue(result.issue)
}

async function linearGraphql<T>(
  accessToken: string,
  graphqlUrl: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
  const body = (await res.json()) as {
    data?: T
    errors?: { message: string }[]
  }
  if (!res.ok || body.errors?.length || !body.data) {
    throw new ApiError(
      body.errors?.map((error) => error.message).join("; ") ||
        `Linear GraphQL failed: ${res.status}`,
      502
    )
  }
  return body.data
}

function mapTeam(team: LinearTeam): Team {
  return { id: team.id, name: team.name, key: team.key }
}

function mapProject(project: LinearProject, fallbackTeamId: string): Project {
  return {
    id: project.id,
    teamId: project.team?.id ?? fallbackTeamId,
    name: project.name,
    color: "#5e6ad2",
  }
}

function mapUser(user: LinearUser): User {
  return {
    id: user.id,
    name: user.displayName || user.name,
    initials: user.initials || initialsForName(user.displayName || user.name),
    color: user.avatarBackgroundColor || "#5e6ad2",
    avatarUrl: user.avatarUrl ?? null,
  }
}

function mapLabel(label: LinearLabel): Label {
  return { id: label.id, name: label.name, color: label.color || "#95a2b3" }
}

function mapIssue(issue: LinearIssue): Issue {
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    teamId: issue.team.id,
    projectId: issue.project?.id ?? null,
    status: statusForState(issue.state),
    priority: normalizePriority(issue.priority),
    assigneeId: issue.assignee?.id ?? null,
    labelIds: issue.labels.nodes.map((label) => label.id),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    url: issue.url,
  }
}

function statusForState(state: LinearState): IssueStatus {
  if (state.type === "backlog") return "backlog"
  if (state.type === "unstarted") return "todo"
  if (state.type === "completed") return "done"
  if (state.type === "canceled") return "canceled"
  if (state.name.toLowerCase().includes("review")) return "in_review"
  return "in_progress"
}

function stateIdForStatus(
  states: LinearState[] | undefined,
  status: IssueStatus
): string | undefined {
  if (!states?.length) return undefined
  const preferredType: Record<IssueStatus, string> = {
    backlog: "backlog",
    todo: "unstarted",
    in_progress: "started",
    in_review: "started",
    done: "completed",
    canceled: "canceled",
  }
  if (status === "in_review") {
    const reviewState = states.find((state) =>
      state.name.toLowerCase().includes("review")
    )
    if (reviewState) return reviewState.id
  }
  return states.find((state) => state.type === preferredType[status])?.id ?? states[0]?.id
}

function normalizePriority(priority: number): Priority {
  return [0, 1, 2, 3, 4].includes(priority) ? (priority as Priority) : 0
}

function initialsForName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  )
}

async function signSession(session: Session, secret: string): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify(session))
  const signature = await hmac(payload, secret)
  return `${payload}.${signature}`
}

async function verifySession(
  value: string,
  secret: string
): Promise<Session | null> {
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null
  if ((await hmac(payload, secret)) !== signature) return null
  try {
    return JSON.parse(base64UrlDecode(payload)) as Session
  } catch {
    return null
  }
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payload)
  )
  return base64UrlEncode(new Uint8Array(signature))
}

function base64UrlEncode(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? textEncoder.encode(value) : value
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(value: string): string {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=")
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

function randomToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of header?.split(";") ?? []) {
    const [rawName, ...rawValue] = part.trim().split("=")
    if (!rawName || rawValue.length === 0) continue
    out[rawName] = decodeURIComponent(rawValue.join("="))
  }
  return out
}

function cookie(
  name: string,
  value: string,
  request: Request,
  opts: { maxAge: number }
): string {
  const secure = new URL(request.url).protocol === "https:"
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${opts.maxAge}${secure ? "; Secure" : ""}`
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ location })
  for (const value of cookies) headers.append("set-cookie", value)
  return new Response(null, { status: 302, headers })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}
