import type { Context, Next } from "hono";

import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import db from "@/db";
import { users } from "@/db/schema";

const COOKIE_NAME = "auth_id";

export async function authMiddleware(c: Context, next: Next) {
  const raw = getCookie(c, COOKIE_NAME);
  let user;

  if (raw) {
    const id = Number(raw);
    user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  if (!user) {
    user = await db.insert(users).values({}).returning();
    setCookie(c, COOKIE_NAME, String(user[0].id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  c.set("user", user);
  await next();
}
