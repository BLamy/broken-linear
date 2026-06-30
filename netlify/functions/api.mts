import type { Config } from "@netlify/functions"
import { handleLinearRequest } from "../../server/linear-api.ts"

export default async (req: Request) => {
  return handleLinearRequest(req)
}

export const config: Config = {
  path: "/api/*",
}
