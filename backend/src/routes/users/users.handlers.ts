import type { Context } from "hono";

import type { AppRouteHandler } from "@/lib/types";
import type { MeRoute } from "@/routes/users/users.routes";

export const me: AppRouteHandler<MeRoute> = async (c: Context) => {
  const user = await c.get("user");

  return c.json(user);
};
