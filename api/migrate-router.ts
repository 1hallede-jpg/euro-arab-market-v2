import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import postgres from "postgres";

export const migrateRouter = createRouter({
  fixUserId: publicQuery.mutation(async () => {
    // Use raw postgres client to execute ALTER TABLE
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    try {
      await client`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client`ALTER TABLE claims ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client.end();
      return { success: true, message: "userId columns added successfully" };
    } catch (error: any) {
      await client.end();
      return { success: false, message: error?.message || "Unknown error" };
    }
  }),
});
