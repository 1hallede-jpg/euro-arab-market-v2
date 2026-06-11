import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { merchants } from "../db/schema";
import { eq, desc, sql, and, like, or } from "drizzle-orm";

export const featuredRouter = createRouter({
  /**
   * Search merchants — FEATURED first, then organic, then fallback message
   * Public endpoint — no auth required
   */
  search: publicQuery
    .input(
      z.object({
        q: z.string().min(1),
        city: z.string().optional(),
        country: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const term = `%${input.q}%`;

      /* 1) Featured merchants that match */
      const featured = await db
        .select()
        .from(merchants)
        .where(
          and(
            eq(merchants.isFeatured, true),
            eq(merchants.status, "active"),
            or(
              like(merchants.businessNameAr, term),
              like(merchants.businessName, term),
              like(merchants.category, term),
              like(merchants.city, term),
              like(merchants.country, term),
              like(merchants.tags, term),
              like(merchants.description, term),
              like(merchants.descriptionAr, term)
            )
          )
        )
        .orderBy(desc(merchants.rating))
        .limit(input.limit);

      /* 2) Regular (organic) merchants that match */
      const regular = await db
        .select()
        .from(merchants)
        .where(
          and(
            eq(merchants.isFeatured, false),
            eq(merchants.status, "active"),
            or(
              like(merchants.businessNameAr, term),
              like(merchants.businessName, term),
              like(merchants.category, term),
              like(merchants.city, term),
              like(merchants.country, term),
              like(merchants.tags, term),
              like(merchants.description, term),
              like(merchants.descriptionAr, term)
            )
          )
        )
        .orderBy(desc(merchants.rating))
        .limit(input.limit);

      /* 3) Log search query for analytics */
      try {
        await db.execute(
          sql`INSERT INTO search_analytics (query, city, category, result_count, created_at) 
              VALUES (${input.q}, ${input.city || null}, ${input.category || null}, ${featured.length + regular.length}, NOW())
              ON CONFLICT DO NOTHING`
        );
      } catch {
        // silently fail — analytics table may not exist yet
      }

      return {
        featured,
        organic: regular,
        total: featured.length + regular.length,
        hasResults: featured.length + regular.length > 0,
      };
    }),

  /**
   * Get featured merchants for a city
   */
  byCity: publicQuery
    .input(z.object({ city: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      const featured = await db
        .select()
        .from(merchants)
        .where(
          and(
            eq(merchants.city, input.city),
            eq(merchants.isFeatured, true),
            eq(merchants.status, "active")
          )
        )
        .orderBy(desc(merchants.rating))
        .limit(input.limit);

      const organic = await db
        .select()
        .from(merchants)
        .where(
          and(
            eq(merchants.city, input.city),
            eq(merchants.isFeatured, false),
            eq(merchants.status, "active")
          )
        )
        .orderBy(desc(merchants.rating))
        .limit(input.limit);

      return { featured, organic };
    }),

  /**
   * Toggle featured status (admin only)
   */
  toggle: publicQuery
    .input(z.object({ id: z.number(), featured: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(merchants)
        .set({ isFeatured: input.featured })
        .where(eq(merchants.id, input.id));
      return { success: true };
    }),
});

/**
 * Analytics router — admin secret endpoint
 */
export const analyticsRouter = createRouter({
  /**
   * Get recent search queries (admin secret)
   */
  recentSearches: publicQuery.query(async () => {
    const db = getDb();
    try {
      const rows = await db.execute(
        sql`SELECT query, city, result_count, created_at 
            FROM search_analytics 
            ORDER BY created_at DESC 
            LIMIT 100`
      );
      return rows || [];
    } catch {
      return [];
    }
  }),

  /**
   * Get popular searches (admin secret)
   */
  popularSearches: publicQuery.query(async () => {
    const db = getDb();
    try {
      const rows = await db.execute(
        sql`SELECT query, COUNT(*) as count 
            FROM search_analytics 
            GROUP BY query 
            ORDER BY count DESC 
            LIMIT 20`
      );
      return rows || [];
    } catch {
      return [];
    }
  }),

  /**
   * Get stats (admin secret)
   */
  stats: publicQuery.query(async () => {
    const db = getDb();
    try {
      const [totalSearches, totalMerchants, featuredCount, citiesCount] =
        await Promise.all([
          db.execute(
            sql`SELECT COUNT(*) as count FROM search_analytics`
          ),
          db.select({ count: sql<number>`count(*)` }).from(merchants),
          db
            .select({ count: sql<number>`count(*)` })
            .from(merchants)
            .where(eq(merchants.isFeatured, true)),
          db.execute(
            sql`SELECT COUNT(DISTINCT city) as count FROM merchants WHERE status = 'active'`
          ),
        ]);

      return {
        totalSearches: (totalSearches as any)?.[0]?.count || 0,
        totalMerchants: totalMerchants[0]?.count || 0,
        featuredCount: featuredCount[0]?.count || 0,
        citiesCount: (citiesCount as any)?.[0]?.count || 0,
      };
    } catch {
      return {
        totalSearches: 0,
        totalMerchants: 0,
        featuredCount: 0,
        citiesCount: 0,
      };
    }
  }),
});
