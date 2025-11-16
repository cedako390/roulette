import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { z } from "zod";

import { selectPrizesSchema } from "@/db/schema";

const tags = ["Prizes"];

export const list = createRoute({
  path: "/prizes",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectPrizesSchema),
      "The list of prizes",
    ),
  },
});

export const twist = createRoute({
  path: "/twist",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPrizesSchema,
      "Prize",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
      "Insufficient balance",
    ),
  },
});

export type ListRoute = typeof list;
export type TwistRoute = typeof twist;
