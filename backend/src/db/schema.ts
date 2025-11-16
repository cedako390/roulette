import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const prizes = sqliteTable("prizes", {
  id: integer({ mode: "number" })
    .primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  amount: integer({ mode: "number" }).notNull(),
  weight: integer({ mode: "number" }).notNull(),
});

export const selectPrizesSchema = toZodV4SchemaTyped(createSelectSchema(prizes));

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  balance: integer("balance").notNull().default(1000),
});

export const selectUsersSchema = toZodV4SchemaTyped(createSelectSchema(users));

// export const tasks = sqliteTable("tasks", {
//   id: integer({ mode: "number" })
//     .primaryKey({ autoIncrement: true }),
//   name: text().notNull(),
//   done: integer({ mode: "boolean" })
//     .notNull()
//     .default(false),
//   createdAt: integer({ mode: "timestamp" })
//     .$defaultFn(() => new Date()),
//   updatedAt: integer({ mode: "timestamp" })
//     .$defaultFn(() => new Date())
//     .$onUpdate(() => new Date()),
// });
//
// export const selectTasksSchema = toZodV4SchemaTyped(createSelectSchema(tasks));
//
// export const insertTasksSchema = toZodV4SchemaTyped(createInsertSchema(
//   tasks,
//   {
//     name: field => field.min(1).max(500),
//   },
// ).required({
//   done: true,
// }).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// }));
//
// // @ts-expect-error partial exists on zod v4 type
// export const patchTasksSchema = insertTasksSchema.partial();
