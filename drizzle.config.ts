import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./src/main/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "file:app.db",
  },
});
