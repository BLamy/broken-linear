import { handleLinearRequest } from "../../server/linear-api"

export const onRequest: PagesFunction<Record<string, string>> = async (context) => {
  return handleLinearRequest(context.request, context.env)
}
