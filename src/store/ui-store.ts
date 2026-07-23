import { create } from "zustand"
import type { ViewId } from "@/lib/types"

interface UIState {
  view: ViewId
  selectedIssueId: string | null
  addIssueOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string

  setView: (view: ViewId) => void
  selectIssue: (id: string | null) => void
  setAddIssueOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  syncViewFromLocation: () => void
}

function viewFromPathname(pathname: string): ViewId {
  const teamMatch = pathname.match(/^\/teams\/([^/]+)$/)
  if (teamMatch) return `team:${decodeURIComponent(teamMatch[1])}`
  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/)
  if (projectMatch) return `project:${decodeURIComponent(projectMatch[1])}`
  if (pathname === "/inbox") return "inbox"
  if (pathname === "/my-issues") return "my-issues"
  if (pathname === "/search") return "search"
  return "active"
}

function pathnameForView(view: ViewId): string {
  if (view.startsWith("team:")) {
    return `/teams/${encodeURIComponent(view.slice("team:".length))}`
  }
  if (view.startsWith("project:")) {
    return `/projects/${encodeURIComponent(view.slice("project:".length))}`
  }
  if (view === "inbox") return "/inbox"
  if (view === "my-issues") return "/my-issues"
  if (view === "search") return "/search"
  return "/"
}

function readCollapsed(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sidebar.collapsed") || "false")
  } catch {
    return false
  }
}

export const useUIStore = create<UIState>((set) => ({
  view:
    typeof window === "undefined"
      ? "active"
      : viewFromPathname(window.location.pathname),
  selectedIssueId: null,
  addIssueOpen: false,
  sidebarCollapsed: readCollapsed(),
  searchQuery: "",

  setView: (view) => {
    const pathname = pathnameForView(view)
    if (window.location.pathname !== pathname) {
      window.history.pushState(null, "", pathname)
    }
    set({ view, selectedIssueId: null })
  },
  selectIssue: (id) => set({ selectedIssueId: id }),
  setAddIssueOpen: (open) => set({ addIssueOpen: open }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem("sidebar.collapsed", JSON.stringify(next))
      return { sidebarCollapsed: next }
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  syncViewFromLocation: () =>
    set({
      view: viewFromPathname(window.location.pathname),
      selectedIssueId: null,
    }),
}))
