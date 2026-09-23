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
  cost: real("cost").notNull(),
});

export const paperTemplates = sqliteTable("paper_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  cost: real("cost").notNull(),
  price: real("price").notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  total: real("total").notNull(),
  status: text("status").default("pending").notNull(),
});

// Parent polymorphic entity for all orderable item types
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemType: text("item_type").notNull(), // "photo" | "paper" | future item types
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  createdAt: text("created_at").notNull(),
});

export const photoItems = sqliteTable("photo_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  templateId: integer("template_id")
    .notNull()
    .references(() => photoTemplates.id, { onDelete: "restrict" }),
  price: real("price").notNull(),
  width: integer("width").notNull(),
  cost: real("cost").default(0).notNull(),
  height: integer("height").notNull(),
  qty: integer("qty").notNull(),
  personName: text("person_name"),
  photoName: text("photo_name"),
});

export const paperItems = sqliteTable("paper_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  paperTemplateId: integer("paper_template_id")
    .notNull()
    .references(() => paperTemplates.id, { onDelete: "restrict" }),
  qty: integer("qty").notNull(),
  price: real("price").notNull(),
  cost: real("cost").default(0).notNull(),
  createdAt: text("created_at").notNull(),
  addedBy: integer("added_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  createdAt: text("created_at").notNull(),
});
