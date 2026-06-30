import { ArrowRight, Bug, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoginView() {
  return (
    <main className="flex h-svh w-full items-center justify-center bg-[#0d0d0d] px-6 text-foreground">
      <section className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-[#5e6ad2] text-white">
            <Bug className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Linear bugs</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to load bug-labeled issues from your workspace.
            </p>
          </div>
        </div>

        <a href="/api/auth/login">
          <Button className="h-9 w-full justify-between bg-[#5e6ad2] hover:bg-[#4f5bc4]">
            <span className="flex items-center gap-2">
              <LockKeyhole className="size-4" />
              Continue with Linear
            </span>
            <ArrowRight className="size-4" />
          </Button>
        </a>
      </section>
    </main>
  )
}
