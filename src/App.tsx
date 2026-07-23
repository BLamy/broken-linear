import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { AddIssueDialog } from "@/components/add-issue-dialog"
import { IssueDetailDialog } from "@/components/issue-detail"
import { LoginView } from "@/components/login-view"
import { useSession } from "@/queries/issues"
import { useUIStore } from "@/store/ui-store"

export function App() {
  const syncViewFromLocation = useUIStore((s) => s.syncViewFromLocation)
  const setView = useUIStore((s) => s.setView)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const setAddIssueOpen = useUIStore((s) => s.setAddIssueOpen)
  const { data: session, isLoading } = useSession()

  useEffect(() => {
    window.addEventListener("popstate", syncViewFromLocation)
    return () => window.removeEventListener("popstate", syncViewFromLocation)
  }, [syncViewFromLocation])

  useEffect(() => {
    if (!session?.authenticated) return

    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      if (isEditable || event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === "/") {
        event.preventDefault()
        setSearchQuery("")
        setView("search")
      } else if (event.key.toLowerCase() === "c") {
        event.preventDefault()
        setAddIssueOpen(true)
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [session?.authenticated, setAddIssueOpen, setSearchQuery, setView])

  if (isLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-[#0d0d0d] text-sm text-muted-foreground">
        Loading Linear session...
      </div>
    )
  }

  if (!session?.authenticated) {
    return <LoginView />
  }

  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#0d0d0d] text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <MainView />
      </main>
      <AddIssueDialog />
      <IssueDetailDialog />
    </div>
  )
}

export default App
