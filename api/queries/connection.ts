import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

// Auto-detect if we need SSL (Render, AWS, etc. require SSL)
function needsSsl(url: string): boolean {
  // Render PostgreSQL always requires SSL
  if (url.includes("render.com")) return true;
  if (url.includes("amazonaws.com")) return true;
  if (url.includes("supabase.co")) return true;
  // Localhost never needs SSL
  if (url.includes("localhost") || url.includes("127.0.0.1")) return false;
  // Default to SSL for safety in production
  return env.isProduction;
}

export function getDb() {
  if (!instance) {
    const useSsl = needsSsl(env.databaseUrl);
    console.log("[DB] Connecting to database, SSL:", useSsl);
    const client = postgres(env.databaseUrl, {
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 30,
      onnotice: () => {}, // Suppress notices
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
