import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  pin: text("pin").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  sessionId: text("sessionId").primaryKey(),
  userId: integer("id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});
