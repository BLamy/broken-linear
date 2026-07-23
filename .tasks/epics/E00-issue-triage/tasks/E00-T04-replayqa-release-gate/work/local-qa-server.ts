import { createServer, type IncomingMessage } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, resolve, sep } from "node:path"
import { handleLinearRequest } from "../../../../../../server/linear-api.ts"

const host = "127.0.0.1"
const port = 3000
const root = resolve(process.cwd(), "dist")
const env = {
  LINEAR_EMULATOR_URL: "http://127.0.0.1:4012",
  PUBLIC_APP_URL: "http://localhost:3000",
  SESSION_SECRET: "local-linear-emulator-session-secret",
}

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
}

async function bodyFor(request: IncomingMessage) {
  if (request.method === "GET" || request.method === "HEAD") return undefined
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined
}

createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url ?? "/", `http://${incoming.headers.host}`)

    if (url.pathname.startsWith("/api/")) {
      const headers = new Headers()
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (Array.isArray(value)) {
          for (const item of value) headers.append(name, item)
        } else if (value != null) {
          headers.set(name, value)
        }
      }

      const response = await handleLinearRequest(
        new Request(url, {
          method: incoming.method,
          headers,
          body: await bodyFor(incoming),
          redirect: "manual",
        }),
        env
      )

      outgoing.statusCode = response.status
      response.headers.forEach((value, name) => {
        if (name !== "set-cookie") outgoing.setHeader(name, value)
      })
      const cookies = response.headers.getSetCookie()
      if (cookies.length > 0) outgoing.setHeader("set-cookie", cookies)
      outgoing.end(Buffer.from(await response.arrayBuffer()))
      return
    }

    const requested = resolve(root, `.${decodeURIComponent(url.pathname)}`)
    const safePath =
      requested === root || requested.startsWith(`${root}${sep}`)
        ? requested
        : resolve(root, "index.html")
    const file = await stat(safePath)
      .then((entry) =>
        entry.isFile() ? safePath : resolve(root, "index.html")
      )
      .catch(() => resolve(root, "index.html"))
    const content = await readFile(file)
    outgoing.statusCode = 200
    outgoing.setHeader(
      "content-type",
      contentTypes[extname(file)] ?? "application/octet-stream"
    )
    outgoing.end(incoming.method === "HEAD" ? undefined : content)
  } catch (error) {
    outgoing.statusCode = 500
    outgoing.setHeader("content-type", "text/plain; charset=utf-8")
    outgoing.end(error instanceof Error ? error.message : "Internal error")
  }
}).listen(port, host, () => {
  console.log(`Replay QA task server ready at http://localhost:${port}`)
})
