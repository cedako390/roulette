import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";

import { selectUsersSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Users"];

export const me = createRoute({
  path: "/me",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUsersSchema,
      "User info",
    ),
  },
});

export type MeRoute = typeof me;
