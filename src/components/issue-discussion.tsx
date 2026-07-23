import { useState } from "react"
import { formatDistanceToNowStrict } from "date-fns"
import {
  Loader2,
  MessageSquare,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useSession,
  useUpdateComment,
} from "@/queries/issues"
import type { Comment } from "@/lib/types"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function authorInitials(comment: Comment) {
  return comment.author?.initials || "?"
}

function CommentItem({
  comment,
  issueId,
}: {
  comment: Comment
  issueId: string
}) {
  const update = useUpdateComment(issueId)
  const remove = useDeleteComment(issueId)
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(comment.body)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const changed = body.trim() !== comment.body

  const save = () => {
    if (!body.trim() || !changed || update.isPending) return
    update.mutate(
      { id: comment.id, body: body.trim() },
      {
        onSuccess: () => {
          toast.success("Comment updated")
          setEditing(false)
        },
        onError: (error) =>
          toast.error(errorMessage(error, "Could not update comment")),
      }
    )
  }

  return (
    <article
      className="group flex gap-3"
      aria-label={`Comment by ${comment.author?.name ?? "Unknown user"}`}
    >
      <Avatar size="sm" className="mt-0.5">
        {comment.author?.avatarUrl && (
          <AvatarImage
            src={comment.author.avatarUrl}
            alt={comment.author.name}
          />
        )}
        <AvatarFallback
          style={{ backgroundColor: comment.author?.color ?? undefined }}
          className="text-[10px] text-white"
        >
          {authorInitials(comment)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex min-h-6 items-center gap-2">
          <span className="truncate text-xs font-medium">
            {comment.author?.name ?? "Unknown user"}
          </span>
          <time
            dateTime={comment.createdAt}
            title={new Date(comment.createdAt).toLocaleString()}
            className="text-[11px] text-muted-foreground"
          >
            {formatDistanceToNowStrict(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </time>
          {comment.updatedAt !== comment.createdAt && (
            <span className="text-[11px] text-muted-foreground">edited</span>
          )}

          {comment.isOwn && !editing && !confirmDelete && (
            <div className="ml-auto flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Edit comment"
                title="Edit comment"
                onClick={() => {
                  setBody(comment.body)
                  setEditing(true)
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete comment"
                title="Delete comment"
                className="text-[#eb5757]"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              autoFocus
              aria-label="Edit comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault()
                  save()
                }
                if (event.key === "Escape" && !update.isPending) {
                  setBody(comment.body)
                  setEditing(false)
                }
              }}
              disabled={update.isPending}
              className="min-h-20 bg-white/[0.02]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={update.isPending}
                onClick={() => {
                  setBody(comment.body)
                  setEditing(false)
                }}
              >
                <X /> Cancel
              </Button>
              <Button
                size="sm"
                disabled={!body.trim() || !changed || update.isPending}
                onClick={save}
              >
                {update.isPending && <Loader2 className="animate-spin" />}
                Save comment
              </Button>
            </div>
          </div>
        ) : confirmDelete ? (
          <div className="mt-1 rounded-md border border-[#eb575744] bg-[#eb57570d] p-3">
            <p className="text-xs">Delete this comment permanently?</p>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(comment.id, {
                    onSuccess: () => toast.success("Comment deleted"),
                    onError: (error) =>
                      toast.error(
                        errorMessage(error, "Could not delete comment")
                      ),
                  })
                }
              >
                {remove.isPending && <Loader2 className="animate-spin" />}
                Delete comment
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 break-words whitespace-pre-wrap text-[#d8d8dc]">
            {comment.body}
          </p>
        )}
      </div>
    </article>
  )
}

export function IssueDiscussion({ issueId }: { issueId: string }) {
  const { data: session } = useSession()
  const comments = useComments(issueId)
  const create = useCreateComment(issueId)
  const [body, setBody] = useState("")

  const submit = () => {
    if (!body.trim() || create.isPending) return
    create.mutate(body.trim(), {
      onSuccess: () => {
        setBody("")
        toast.success("Comment added")
      },
      onError: (error) =>
        toast.error(errorMessage(error, "Could not add comment")),
    })
  }

  return (
    <section className="mt-6 border-t border-white/6 pt-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Discussion</h2>
        {comments.data && comments.data.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {comments.data.length}
          </span>
        )}
      </div>

      {comments.isLoading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading discussion…
        </div>
      ) : comments.isError ? (
        <div className="rounded-md border border-[#eb575744] bg-[#eb57570d] p-3">
          <p className="text-xs text-[#f19a9a]">
            {errorMessage(comments.error, "Could not load discussion")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => void comments.refetch()}
          >
            <RotateCcw /> Retry
          </Button>
        </div>
      ) : comments.data?.length ? (
        <div className="space-y-5">
          {comments.data.map((comment) => (
            <CommentItem key={comment.id} comment={comment} issueId={issueId} />
          ))}
        </div>
      ) : (
        <p className="py-3 text-xs text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <Avatar size="sm" className="mt-1">
          {session?.user?.avatarUrl && (
            <AvatarImage src={session.user.avatarUrl} alt={session.user.name} />
          )}
          <AvatarFallback className="text-[10px]">
            {session?.user?.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Textarea
            aria-label="Add a comment"
            placeholder="Leave a comment…"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                submit()
              }
            }}
            disabled={create.isPending}
            className="min-h-20 bg-white/[0.02]"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground">
              ⌘ Enter to send
            </span>
            <Button
              size="sm"
              disabled={!body.trim() || create.isPending}
              onClick={submit}
            >
              {create.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              Comment
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
