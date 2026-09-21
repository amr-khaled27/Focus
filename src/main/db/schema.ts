import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

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

export const photoTemplates = sqliteTable("photo_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  unit: text("unit").default("cm").notNull(),
  price: real("price").notNull(),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  templateId: integer("template_id")
    .notNull()
    .references(() => photoTemplates.id, { onDelete: "restrict" }),
  price: real("price").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  qty: integer("qty").default(1).notNull(),
  personName: text("person_name"),
  photoName: text("photo_name"),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  photoId: integer("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  total: real("total").notNull(),
});
