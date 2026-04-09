import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@/drizzle/schema";

// Configure WebSocket for Node.js environments (< v22)
// This is required for the Pool to work with interactive transactions
neonConfig.webSocketConstructor = ws;

// Use the Neon serverless driver with Pool for full transaction support
// WebSocket mode supports interactive transactions (BEGIN/COMMIT/ROLLBACK)
// HTTP mode (neon-http) only supports non-interactive transactions
function createDbClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle({ client: pool, schema });
}

// Create a singleton instance for the request lifecycle
let dbInstance: ReturnType<typeof createDbClient> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDbClient>, {
  get(_target, prop) {
    if (!dbInstance) {
      dbInstance = createDbClient();
    }
    return dbInstance[prop as keyof typeof dbInstance];
  },
});
