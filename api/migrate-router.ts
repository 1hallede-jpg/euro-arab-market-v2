import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import postgres from "postgres";

export const migrateRouter = createRouter({
  fixUserId: publicQuery.mutation(async () => {
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    const results: string[] = [];
    try {
      // Add userId to merchants (this table must exist since seed works)
      try {
        await client`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS "userId" bigint`;
        results.push("merchants: userId added");
      } catch (e: any) { results.push(`merchants: ${e?.message || "failed"}`); }

      // Add userId to other tables if they exist
      try {
        await client`ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS "userId" bigint`;
        results.push("jobs: userId added (or table doesn't exist)");
      } catch (e: any) { results.push(`jobs: ${e?.message || "failed"}`); }

      try {
        await client`ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS "userId" bigint`;
        results.push("reviews: userId added (or table doesn't exist)");
      } catch (e: any) { results.push(`reviews: ${e?.message || "failed"}`); }

      try {
        await client`ALTER TABLE IF EXISTS claims ADD COLUMN IF NOT EXISTS "userId" bigint`;
        results.push("claims: userId added (or table doesn't exist)");
      } catch (e: any) { results.push(`claims: ${e?.message || "failed"}`); }

      await client.end();
      return { success: true, message: results.join(" | ") };
    } catch (error: any) {
      await client.end();
      return { success: false, message: error?.message || "Unknown error", details: results };
    }
  }),
});
