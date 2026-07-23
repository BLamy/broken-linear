import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUIStore } from "@/store/ui-store"
import { IssueLabelPicker } from "@/components/issue-label-picker"
import {
  useCreateIssue,
  useLabels,
  useProjects,
  useTeams,
  useUsers,
} from "@/queries/issues"
import {
  PRIORITY_META,
  STATUS_META,
  type IssueStatus,
  type Priority,
} from "@/lib/types"

export function AddIssueDialog() {
  const open = useUIStore((s) => s.addIssueOpen)
  const setOpen = useUIStore((s) => s.setAddIssueOpen)
  const view = useUIStore((s) => s.view)
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const { data: labels = [] } = useLabels()
  const { data: users = [] } = useUsers()
  const create = useCreateIssue()

  const fallbackTeamId = teams[0]?.id ?? ""
  const defaultTeamId = view.startsWith("team:")
    ? view.slice("team:".length)
    : view.startsWith("project:")
      ? (projects.find((p) => p.id === view.slice("project:".length))?.teamId ??
        fallbackTeamId)
      : fallbackTeamId

  const defaultProjectId = view.startsWith("project:")
    ? view.slice("project:".length)
    : ""

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>(0)
  const [status, setStatus] = useState<IssueStatus>("todo")
  const [teamId, setTeamId] = useState("")
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [assigneeId, setAssigneeId] = useState("")
  const [labelIds, setLabelIds] = useState<string[] | null>(null)
  const activeTeamId = teamId || defaultTeamId
  const bugLabelId = labels.find(
    (label) => label.name.toLowerCase() === "bug"
  )?.id
  const activeLabelIds = labelIds ?? (bugLabelId ? [bugLabelId] : [])

  const teamProjects = projects.filter((p) => p.teamId === activeTeamId)

  const reset = () => {
    setTitle("")
    setDescription("")
    setPriority(0)
    setStatus("todo")
    setTeamId("")
    setProjectId(defaultProjectId)
    setAssigneeId("")
    setLabelIds(null)
  }

  const submit = () => {
    if (!title.trim() || !activeTeamId) return
    create.mutate(
      {
        title,
        description: description || null,
        priority,
        status,
        teamId: activeTeamId,
        projectId: projectId || null,
        assigneeId: assigneeId || null,
        labelIds: activeLabelIds,
      },
      {
        onSuccess: () => {
          toast.success("Issue created")
          reset()
          setOpen(false)
        },
        onError: () => toast.error("Could not create issue"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-2xl translate-y-0 gap-0 border-white/10 bg-[#161618] p-0">
        <div className="p-4">
          <DialogTitle className="sr-only">New issue</DialogTitle>
          <DialogDescription className="sr-only">
            Create an issue and assign its triage metadata.
          </DialogDescription>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.metaKey || e.ctrlKey) &&
                !create.isPending
              ) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Issue title"
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description…"
            rows={3}
            className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as IssueStatus)}
            >
              <SelectTrigger
                size="sm"
                className="h-7 text-xs"
                aria-label="Status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    aria-label={`Set status to ${meta.label}`}
                  >
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={activeTeamId}
              onValueChange={(v) => {
                setTeamId(v)
                setProjectId("")
              }}
            >
              <SelectTrigger
                size="sm"
                className="h-7 text-xs"
                aria-label="Team"
              >
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={t.id}
                    aria-label={`Select team ${t.name}`}
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={projectId || "none"}
              onValueChange={(v) => setProjectId(v === "none" ? "" : v)}
            >
              <SelectTrigger
                size="sm"
                className="h-7 text-xs"
                aria-label="Project"
              >
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" aria-label="Select no project">
                  No project
                </SelectItem>
                {teamProjects.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    aria-label={`Select project ${p.name}`}
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(priority)}
              onValueChange={(v) => setPriority(Number(v) as Priority)}
            >
              <SelectTrigger
                size="sm"
                className="h-7 text-xs"
                aria-label="Priority"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([0, 1, 2, 3, 4] as Priority[]).map((p) => (
                  <SelectItem
                    key={p}
                    value={String(p)}
                    aria-label={`Set priority to ${PRIORITY_META[p].label}`}
                  >
                    {PRIORITY_META[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={assigneeId || "none"}
              onValueChange={(v) => setAssigneeId(v === "none" ? "" : v)}
            >
              <SelectTrigger
                size="sm"
                className="h-7 text-xs"
                aria-label="Assignee"
              >
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" aria-label="Select no assignee">
                  Unassigned
                </SelectItem>
                {users.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    aria-label={`Assign to ${user.name}`}
                  >
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <IssueLabelPicker
              labels={labels}
              value={activeLabelIds}
              onChange={setLabelIds}
              disabled={create.isPending}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/6 px-4 py-3">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#5e6ad2] hover:bg-[#4f5bc4]"
            onClick={submit}
            disabled={!title.trim() || !activeTeamId || create.isPending}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Create issue
            <span className="ml-1 hidden text-[10px] text-white/60 sm:inline">
              ⌘↵
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
