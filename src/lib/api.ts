import type { Issue, Label, Project, Session, Team, User } from "./types"

const BASE = "/api"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // Keep the status text when the response is not JSON.
    }
    throw new ApiError(message, res.status)
  }
  return res.json() as Promise<T>
}

export const api = {
  getSession: () => http<Session>("/session"),
  logout: () => http<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  getTeams: () => http<Team[]>("/teams"),
  getProjects: (teamId?: string) =>
    http<Project[]>(`/projects${teamId ? `?teamId=${teamId}` : ""}`),
  getLabels: () => http<Label[]>("/labels"),
  getUsers: () => http<User[]>("/users"),
  getIssues: (opts?: { teamId?: string; projectId?: string }) => {
    const params = new URLSearchParams()
    if (opts?.teamId) params.set("teamId", opts.teamId)
    if (opts?.projectId) params.set("projectId", opts.projectId)
    const qs = params.toString()
    return http<Issue[]>(`/issues${qs ? `?${qs}` : ""}`)
  },
  search: (q: string) =>
    http<{ query: string; results: Issue[] }>(
      `/search?q=${encodeURIComponent(q)}`
    ),
  createIssue: (input: Partial<Issue> & { teamId: string }) =>
    http<Issue>("/issues", { method: "POST", body: JSON.stringify(input) }),
  updateIssue: (id: string, patch: Partial<Issue>) =>
    http<Issue>(`/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteIssue: (id: string) =>
    http<Issue>(`/issues/${id}`, { method: "DELETE" }),
}
