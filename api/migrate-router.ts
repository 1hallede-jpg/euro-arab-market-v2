import { z } from "zod";
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

  // Create search_analytics table
  createAnalytics: publicQuery.mutation(async () => {
    const client = postgres(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1,
    });
    try {
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS search_analytics (
          id SERIAL PRIMARY KEY,
          query TEXT NOT NULL,
          city TEXT,
          category TEXT,
          result_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_sa_query ON search_analytics(query)
      `);
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_sa_created ON search_analytics(created_at DESC)
      `);

      await client.end();
      return { success: true, message: "search_analytics table created" };
    } catch (error: any) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),

  // Batch insert merchants
  batchInsert: publicQuery
    .input(z.object({
      merchants: z.array(z.object({
        businessNameAr: z.string(),
        businessName: z.string().optional(),
        category: z.string(),
        description: z.string(),
        country: z.string(),
        city: z.string(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
      }))
    }))
    .mutation(async ({ input }) => {
      const client = postgres(env.databaseUrl, {
        ssl: env.isProduction ? { rejectUnauthorized: false } : false,
        max: 1,
      });
      let inserted = 0;
      try {
        for (const m of input.merchants) {
          const slug = `${m.businessNameAr.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').substring(0, 40)}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          await client`
            INSERT INTO merchants ("businessName", "businessNameAr", "shortDescription", "description", "descriptionAr",
              "category", "country", "city", "address", "addressAr", "phone", "website",
              "status", "slug", "isFeatured", "isVerified", "rating", "reviewCount", "createdAt", "updatedAt")
            VALUES (${m.businessName || m.businessNameAr}, ${m.businessNameAr}, ${m.description?.substring(0, 160)}, ${m.description}, ${m.description},
              ${m.category}, ${m.country}, ${m.city}, ${m.address || m.city}, ${m.address || m.city},
              ${m.phone || null}, ${m.website || null},
              'active', ${slug}, false, true, ${(3.5 + Math.random() * 1.5).toFixed(1)}, ${Math.floor(Math.random() * 40) + 5}, NOW(), NOW())
            ON CONFLICT DO NOTHING
          `;
          inserted++;
        }
        await client.end();
        return { success: true, inserted };
      } catch (error: any) {
        await client.end();
        return { success: false, message: error?.message, inserted };
      }
    }),

  // Original fixUserId
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
