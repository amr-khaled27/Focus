import { app } from "electron";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

let db: ReturnType<typeof drizzle> | undefined;

export function getDatabase() {
  if (!db) {
    throw new Error("Database has not been initialized");
  }
  return db;
}

export async function initializeDatabase() {
  let dbUrl = "";
  if (is.dev) {
    console.log("dev db at: " + join(process.cwd(), "app.db"));
    dbUrl = join(process.cwd(), "app.db");
  } else {
    dbUrl = join(app.getPath("userData"), "app.db");
  }

  const client = createClient({
    url: "file:" + dbUrl,
  });
  const database = drizzle(client);
  db = database;

  await migrate(database, {
    migrationsFolder: join(app.getAppPath(), "drizzle"),
  });
}
