import { createRouter } from "@/lib/create-app";

import * as handlers from "./prizes.handlers";
import * as routes from "./prizes.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.twist, handlers.twist);

export default router;
