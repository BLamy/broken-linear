import { useMemo, useState } from "react"
import { ExternalLink, Loader2, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IssueLabelPicker } from "@/components/issue-label-picker"
import { IssueDiscussion } from "@/components/issue-discussion"
import { useUIStore } from "@/store/ui-store"
import {
  useDeleteIssue,
  useIssues,
  useLabels,
  useProjects,
  useTeams,
  useUpdateIssue,
  useUsers,
} from "@/queries/issues"
import {
  PRIORITY_META,
  STATUS_META,
  type Issue,
  type IssueStatus,
  type Priority,
} from "@/lib/types"

function DetailBody({ issue }: { issue: Issue }) {
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const { data: users = [] } = useUsers()
  const { data: labels = [] } = useLabels()
  const update = useUpdateIssue()
  const remove = useDeleteIssue()
  const selectIssue = useUIStore((s) => s.selectIssue)
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description ?? "")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const team = teams.find((item) => item.id === issue.teamId)
  const teamProjects = projects.filter((item) => item.teamId === issue.teamId)
  const dirty =
    title.trim() !== issue.title ||
    description.trim() !== (issue.description ?? "")

  const patch = (next: Partial<Issue>, successMessage = "Issue updated") => {
    update.mutate(
      { id: issue.id, patch: next },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Could not update issue"
          ),
      }
    )
  }

  const saveText = () => {
    if (!title.trim() || !dirty) return
    patch(
      {
        title: title.trim(),
        description: description.trim() || null,
      },
      "Issue details saved"
    )
  }

  return (
    <div className="flex max-h-[85vh] flex-col">
      <DialogTitle className="sr-only">{issue.title}</DialogTitle>
      <DialogDescription className="sr-only">
        View, edit, or delete this issue.
      </DialogDescription>

      <div className="flex items-center gap-2 border-b border-white/6 px-5 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          {issue.identifier}
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          {team?.name ?? "Team"}
        </span>
        {issue.url && (
          <a
            className="ml-auto flex items-center gap-1 text-xs text-[#8f98ff] hover:text-[#b6bcff]"
            href={issue.url}
            target="_blank"
            rel="noreferrer"
          >
            Open in Linear <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="overflow-y-auto p-5">
        <div className="space-y-3">
          <Input
            aria-label="Issue title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-auto border-transparent px-0 py-1 text-lg font-semibold focus-visible:border-white/10 focus-visible:px-2"
          />
          <Textarea
            aria-label="Issue description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a description…"
            className="min-h-24 border-white/8 bg-white/[0.02]"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={saveText}
              disabled={!dirty || !title.trim() || update.isPending}
            >
              {update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save details
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[100px_minmax(0,1fr)] items-center gap-y-3 border-t border-white/6 pt-5 text-sm">
          <span className="text-muted-foreground">Status</span>
          <Select
            value={issue.status}
            disabled={update.isPending}
            onValueChange={(value) =>
              patch({ status: value as IssueStatus }, "Status updated")
            }
          >
            <SelectTrigger size="sm" className="h-7 w-44" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <SelectItem key={key} value={key}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">Priority</span>
          <Select
            value={String(issue.priority)}
            disabled={update.isPending}
            onValueChange={(value) =>
              patch({ priority: Number(value) as Priority }, "Priority updated")
            }
          >
            <SelectTrigger size="sm" className="h-7 w-44" aria-label="Priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {([0, 1, 2, 3, 4] as Priority[]).map((priority) => (
                <SelectItem key={priority} value={String(priority)}>
                  {PRIORITY_META[priority].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">Project</span>
          <Select
            value={issue.projectId ?? "none"}
            disabled={update.isPending}
            onValueChange={(value) =>
              patch(
                { projectId: value === "none" ? null : value },
                "Project updated"
              )
            }
          >
            <SelectTrigger size="sm" className="h-7 w-44" aria-label="Project">
              <SelectValue placeholder="No project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {teamProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">Assignee</span>
          <Select
            value={issue.assigneeId ?? "none"}
            disabled={update.isPending}
            onValueChange={(value) =>
              patch(
                { assigneeId: value === "none" ? null : value },
                "Assignee updated"
              )
            }
          >
            <SelectTrigger size="sm" className="h-7 w-44" aria-label="Assignee">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="self-start pt-1 text-muted-foreground">Labels</span>
          <div className="min-w-0">
            <IssueLabelPicker
              labels={labels}
              value={issue.labelIds}
              disabled={update.isPending}
              onChange={(labelIds) => patch({ labelIds }, "Labels updated")}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {issue.labelIds.map((id) => {
                const label = labels.find((item) => item.id === id)
                return label ? (
                  <span
                    key={id}
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${label.color}33`,
                      border: `1px solid ${label.color}88`,
                    }}
                  >
                    {label.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>

        <IssueDiscussion issueId={issue.id} />
      </div>

      <div className="border-t border-white/6 px-5 py-3">
        {confirmDelete ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Permanently delete {issue.identifier}?
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={remove.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(issue.id, {
                    onSuccess: () => {
                      toast.success("Issue deleted")
                      selectIssue(null)
                    },
                    onError: (error) =>
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Could not delete issue"
                      ),
                  })
                }
              >
                {remove.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Delete issue
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#eb5757]"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" /> Delete issue
          </Button>
        )}
      </div>
    </div>
  )
}

export function IssueDetailDialog() {
  const selectedIssueId = useUIStore((state) => state.selectedIssueId)
  const selectIssue = useUIStore((state) => state.selectIssue)
  const { data: issues = [] } = useIssues("active")
  const issue = useMemo(
    () => issues.find((item) => item.id === selectedIssueId),
    [issues, selectedIssueId]
  )

  return (
    <Dialog
      open={selectedIssueId != null}
      onOpenChange={(open) => !open && selectIssue(null)}
    >
      <DialogContent className="max-w-2xl gap-0 border-white/10 bg-[#161618] p-0">
        {issue ? (
          <DetailBody key={issue.id} issue={issue} />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            <DialogTitle className="sr-only">Issue</DialogTitle>
            <DialogDescription className="sr-only">
              The selected issue could not be found.
            </DialogDescription>
            Issue not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
