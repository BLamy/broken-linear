import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleLinearRequest } from "../server/linear-api"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const protocol = String(req.headers["x-forwarded-proto"] || "http")
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "localhost")
  const url = new URL(req.url || "/", `${protocol}://${host}`)
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : JSON.stringify(req.body ?? {})
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body,
  })
  const response = await handleLinearRequest(request)

  res.status(response.status)
  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  const setCookies = getSetCookie?.call(response.headers)
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value)
  })
  for (const value of setCookies ?? []) res.appendHeader("set-cookie", value)
  res.send(await response.text())
}
