import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";
import { env } from "./env";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: Pool | null = null;

function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: env.databaseUrl,
    });
  }
  return poolInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    if (!dbInstance) {
      dbInstance = drizzle(getPool(), { schema });
    }
    return dbInstance[prop as keyof typeof dbInstance];
  },
});
