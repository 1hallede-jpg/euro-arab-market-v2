import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const isProduction = env.isProduction;
    const client = postgres(env.databaseUrl, {
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 30,
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
