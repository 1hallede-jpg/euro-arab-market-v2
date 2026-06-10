import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { merchants, reviews } from "../db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";

export const merchantRouter = createRouter({
  // Get all merchants with optional filters
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        status: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const db = getDb();
        let query = db.select().from(merchants);

        // Build where conditions using sql
        const conditions: any[] = [];

        // Status filter (default to active)
        const targetStatus = input?.status || "active";
        conditions.push(sql`${merchants.status} = ${targetStatus}`);

        if (input?.category) {
          conditions.push(sql`${merchants.category} = ${input.category}`);
        }
        if (input?.country) {
          conditions.push(sql`${merchants.country} = ${input.country}`);
        }
        if (input?.city) {
          conditions.push(sql`${merchants.city} = ${input.city}`);
        }
        if (input?.featured) {
          conditions.push(sql`${merchants.isFeatured} = true`);
        }
        if (input?.search) {
          const term = `%${input.search}%`;
          conditions.push(sql`(
            ${merchants.businessName} ILIKE ${term} OR
            ${merchants.businessNameAr} ILIKE ${term} OR
            ${merchants.description} ILIKE ${term} OR
            ${merchants.descriptionAr} ILIKE ${term} OR
            ${merchants.tags} ILIKE ${term}
          )`);
        }

        const where = conditions.length > 1
          ? and(...conditions)
          : conditions[0];

        const items = await query
          .where(where)
          .limit(input?.limit || 20)
          .offset(input?.offset || 0)
          .orderBy(desc(merchants.id));

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(merchants)
          .where(where);

        return {
          items,
          total: countResult[0]?.count || 0,
        };
      } catch (error: any) {
        console.error("[merchant.list] Error:", error?.message || error);
        return { items: [], total: 0, error: error?.message };
      }
    }),

  // Get single merchant by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const merchant = await db
        .select()
        .from(merchants)
        .where(eq(merchants.id, input.id))
        .limit(1);

      if (!merchant[0]) {
        throw new Error("Merchant not found");
      }

      // Get reviews
      const merchantReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.merchantId, input.id))
        .orderBy(desc(reviews.createdAt));

      return {
        ...merchant[0],
        reviews: merchantReviews,
      };
    }),

  // Get merchant by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const merchant = await db
        .select()
        .from(merchants)
        .where(eq(merchants.slug, input.slug))
        .limit(1);

      if (!merchant[0]) {
        throw new Error("Merchant not found");
      }

      return merchant[0];
    }),

  // Create merchant
  create: publicQuery
    .input(
      z.object({
        businessName: z.string().min(1),
        businessNameAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.enum([
          "restaurant", "supermarket", "sweets", "barber", "butcher",
          "bakery", "cafe", "clothing", "electronics", "pharmacy", "other",
        ]),
        subcategory: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        country: z.string().min(1),
        city: z.string().min(1),
        address: z.string().optional(),
        postalCode: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        openingHours: z.any().optional(),
        tags: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const slug = input.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-" + Date.now();

      const result = await db.insert(merchants).values({
        ...input,
        slug,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: merchants.id });

      return { id: result[0].id, slug };
    }),

  // Get featured merchants
  featured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(merchants)
      .where(and(eq(merchants.status, "active"), eq(merchants.isVerified, true)))
      .orderBy(desc(merchants.rating))
      .limit(6);
  }),

  // Get categories with counts
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "مطاعم عربية", nameEn: "restaurant", icon: "Utensils", color: "#ef4444", count: 0 },
      { id: 2, name: "سوبرماركت حلال", nameEn: "supermarket", icon: "ShoppingCart", color: "#22c55e", count: 0 },
      { id: 3, name: "حلويات شرقية", nameEn: "sweets", icon: "Cake", color: "#f59e0b", count: 0 },
      { id: 4, name: "صالونات حلاقة", nameEn: "barber", icon: "Scissors", color: "#3b82f6", count: 0 },
      { id: 5, name: "جزار حلال", nameEn: "butcher", icon: "Beef", color: "#ef4444", count: 0 },
      { id: 6, name: "مخابز", nameEn: "bakery", icon: "Bread", color: "#f59e0b", count: 0 },
      { id: 7, name: "مقاهي", nameEn: "cafe", icon: "Coffee", color: "#8b5cf6", count: 0 },
      { id: 8, name: "ملابس", nameEn: "clothing", icon: "Shirt", color: "#ec4899", count: 0 },
      { id: 9, name: "إلكترونيات", nameEn: "electronics", icon: "Smartphone", color: "#06b6d4", count: 0 },
      { id: 10, name: "صيدليات", nameEn: "pharmacy", icon: "Pill", color: "#10b981", count: 0 },
    ];

    // Get actual counts
    for (const cat of categories) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(merchants)
        .where(and(eq(merchants.category, cat.nameEn as any), eq(merchants.status, "active")));
      cat.count = result[0]?.count || 0;
    }

    return categories;
  }),

  // Get cities list
  cities: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        city: merchants.city,
        country: merchants.country,
        count: sql<number>`count(*)`,
      })
      .from(merchants)
      .where(eq(merchants.status, "active"))
      .groupBy(merchants.city, merchants.country)
      .orderBy(desc(sql`count(*)`));

    return result;
  }),
});
