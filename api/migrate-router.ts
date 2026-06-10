import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import postgres from "postgres";

export const migrateRouter = createRouter({
  // Show table columns
  schema: publicQuery.query(async () => {
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    try {
      const columns = await client`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        ORDER BY ordinal_position
      `;
      await client.end();
      return { columns: columns.map((c: any) => ({ name: c.column_name, type: c.data_type })) };
    } catch (error: any) {
      await client.end();
      return { error: error?.message };
    }
  }),

  // Fix all missing columns
  fixAll: publicQuery.mutation(async () => {
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    const results: string[] = [];
    
    const addColumn = async (table: string, column: string, type: string) => {
      try {
        await client.unsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
        results.push(`${table}.${column}: OK`);
      } catch (e: any) {
        results.push(`${table}.${column}: ${e?.message || "failed"}`);
      }
    };

    try {
      // Core columns for merchants
      await addColumn("merchants", "userId", "bigint");
      await addColumn("merchants", "businessName", "varchar(255)");
      await addColumn("merchants", "businessNameAr", "varchar(255)");
      await addColumn("merchants", "shortDescription", "varchar(500)");
      await addColumn("merchants", "description", "text");
      await addColumn("merchants", "descriptionAr", "text");
      await addColumn("merchants", "category", "varchar(100)");
      await addColumn("merchants", "subcategory", "varchar(100)");
      await addColumn("merchants", "tags", "text");
      await addColumn("merchants", "logo", "text");
      await addColumn("merchants", "coverImage", "text");
      await addColumn("merchants", "galleryImages", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "phone", "varchar(50)");
      await addColumn("merchants", "whatsapp", "varchar(50)");
      await addColumn("merchants", "email", "varchar(320)");
      await addColumn("merchants", "website", "varchar(255)");
      await addColumn("merchants", "facebookUrl", "text");
      await addColumn("merchants", "instagramUrl", "text");
      await addColumn("merchants", "tiktokUrl", "text");
      await addColumn("merchants", "youtubeUrl", "text");
      await addColumn("merchants", "country", "varchar(100)");
      await addColumn("merchants", "city", "varchar(100)");
      await addColumn("merchants", "address", "text");
      await addColumn("merchants", "addressAr", "text");
      await addColumn("merchants", "postalCode", "varchar(20)");
      await addColumn("merchants", "neighborhood", "varchar(100)");
      await addColumn("merchants", "latitude", "decimal(10,8)");
      await addColumn("merchants", "longitude", "decimal(11,8)");
      await addColumn("merchants", "googleMapsUrl", "text");
      await addColumn("merchants", "openingHours", "jsonb DEFAULT '{}'");
      await addColumn("merchants", "isOpen24Hours", "boolean DEFAULT false");
      await addColumn("merchants", "amenities", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "features", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "paymentMethods", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "acceptsCash", "boolean DEFAULT true");
      await addColumn("merchants", "acceptsCard", "boolean DEFAULT false");
      await addColumn("merchants", "priceRange", "varchar(10) DEFAULT '$$'");
      await addColumn("merchants", "status", "varchar(50) DEFAULT 'pending'");
      await addColumn("merchants", "isVerified", "boolean DEFAULT false");
      await addColumn("merchants", "isFeatured", "boolean DEFAULT false");
      await addColumn("merchants", "rating", "decimal(2,1) DEFAULT 0.0");
      await addColumn("merchants", "reviewCount", "integer DEFAULT 0");
      await addColumn("merchants", "metaTitle", "varchar(255)");
      await addColumn("merchants", "metaDescription", "text");
      await addColumn("merchants", "keywords", "text");
      await addColumn("merchants", "slug", "varchar(255)");
      await addColumn("merchants", "claimedBy", "bigint");
      await addColumn("merchants", "claimedAt", "timestamp");
      await addColumn("merchants", "createdAt", "timestamp DEFAULT NOW()");
      await addColumn("merchants", "updatedAt", "timestamp DEFAULT NOW()");

      await client.end();
      return { success: true, results };
    } catch (error: any) {
      await client.end();
      return { success: false, error: error?.message, results };
    }
  }),

  // Original fixUserId (keep for compatibility)
  fixUserId: publicQuery.mutation(async () => {
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    try {
      await client`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client.end();
      return { success: true };
    } catch (error: any) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
});
