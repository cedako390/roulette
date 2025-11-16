import type { Context } from "hono";

import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute, TwistRoute } from "@/routes/prizes/prizes.routes";

import db from "@/db";
import { users } from "@/db/schema";

export const list: AppRouteHandler<ListRoute> = async (c: Context) => {
  const prizes = await db.query.prizes.findMany();
  return c.json(prizes);
};

export const twist: AppRouteHandler<TwistRoute> = async (c: Context) => {
  const user = c.get("user");

  if (user.balance < 100) {
    return c.json(
      { message: "Insufficient balance" },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const prizes = await db.query.prizes.findMany();

  const cumulativeWeights = [];
  let sum = 0;

  for (const prize of prizes) {
    sum += prize.weight;
    cumulativeWeights.push(sum);
  }

  const random = Math.random() * sum;

  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      const result = prizes[i];
      await db.update(users).set({
        // Совместил подарок и плату за прокрутку
        balance: user.balance + result.amount - 100,
      }).where(eq(users.id, user.id));

      return c.json(result, HttpStatusCodes.OK);
    }
  }

  throw new Error("Failed to calculate prize");
};
