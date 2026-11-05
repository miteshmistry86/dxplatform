import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { db?: Db };

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Supabase's transaction pooler needs both settings:
  // - `prepare: false`: it does not support named prepared statements.
  // - `max_pipeline: 1`: it mishandles several queries queued on one connection, so any page
  //   running more queries at once than there are connections would hang forever.
  const client = postgres(url, { prepare: false, max: 5, max_pipeline: 1 });
  return drizzle(client, { schema });
}

/** Lazily-created singleton so builds don't need a database connection. */
export function getDb(): Db {
  if (!globalForDb.db) globalForDb.db = createDb();
  return globalForDb.db;
}

export { schema };
