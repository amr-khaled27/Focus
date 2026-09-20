import { drizzle } from "drizzle-orm/libsql";
import { reset } from "drizzle-seed";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { join } from "path";

const dbPath = join(process.cwd(), "app.db");

async function purgeDatabase() {
  const client = createClient({ url: "file:" + dbPath });
  const db = drizzle(client);

  await reset(db, schema);
  console.log("Database purged at", dbPath);

  client.close();
}

purgeDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
