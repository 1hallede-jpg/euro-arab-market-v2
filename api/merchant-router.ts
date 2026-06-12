import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import { merchants, reviews } from "../db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import postgres from "postgres";

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
            ${merchants.tags} ILIKE ${term} OR
            ${merchants.city} ILIKE ${term} OR
            ${merchants.country} ILIKE ${term} OR
            ${merchants.address} ILIKE ${term}
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

  // Get merchant by slug or id
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        
        // Try by slug first
        let result = await db
          .select()
          .from(merchants)
          .where(eq(merchants.slug, input.slug))
          .limit(1);

        // If not found and slug is numeric, try by id
        if (!result[0] && /^\d+$/.test(input.slug)) {
          result = await db
            .select()
            .from(merchants)
            .where(eq(merchants.id, parseInt(input.slug)))
            .limit(1);
        }

        // If still not found, try partial slug match
        if (!result[0]) {
          result = await db
            .select()
            .from(merchants)
            .where(sql`${merchants.slug} ILIKE ${'%' + input.slug + '%'}`)
            .limit(1);
        }

        if (!result[0]) {
          return null;
        }

        return result[0];
      } catch (error: any) {
        console.error("[getBySlug] Error:", error?.message);
        return null;
      }
    }),

  // Create merchant
  create: publicQuery
    .input(
      z.object({
        businessName: z.string().min(1),
        businessNameAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        shortDescription: z.string().optional(),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        website: z.string().optional(),
        country: z.string().min(1),
        city: z.string().min(1),
        address: z.string().optional(),
        addressAr: z.string().optional(),
        postalCode: z.string().optional(),
        latitude: z.string().optional().or(z.number().transform(String)).nullable(),
        longitude: z.string().optional().or(z.number().transform(String)).nullable(),
        openingHours: z.any().optional(),
        tags: z.string().optional(),
        rating: z.number().optional(),
        priceRange: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const client = postgres(env.databaseUrl, {
        ssl: env.isProduction ? { rejectUnauthorized: false } : false,
        max: 1,
      });

      try {
        const slug = (input.businessName || "store")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") + "-" + Date.now();

        const nameEn = input.businessName;
        const nameAr = input.businessNameAr || nameEn;
        const descAr = input.descriptionAr || input.description || "";
        const shortDesc = input.shortDescription || `${nameAr} في ${input.city}`.substring(0, 160);
        const addr = input.address || input.city;
        const addrAr = input.addressAr || addr;
        const subcat = input.subcategory || input.category;
        const tagsVal = (input.tags || `${subcat} ${input.city} ${nameAr} ${nameEn}`).substring(0, 200);
        const ratingVal = input.rating || 0;
        const reviews = ratingVal > 0 ? Math.floor(Math.random() * 30 + 5) : 0;
        const lat = input.latitude || null;
        const lng = input.longitude || null;
        const price = input.priceRange || "$$";
        const phoneVal = input.phone || "";
        const webVal = input.website || null;

        // Insert into BOTH snake_case and camelCase columns
        const result = await client`
          INSERT INTO merchants (
            business_name, business_name_ar, short_description,
            description, description_ar, category, subcategory,
            tags, country, city, address, address_ar,
            phone, website, status, slug,
            is_featured, is_verified, rating, review_count,
            latitude, longitude, price_range,
            created_at, updated_at,
            "businessName", "businessNameAr", "shortDescription",
            "description", "descriptionAr", "addressAr",
            "isFeatured", "isVerified", "reviewCount",
            "priceRange", "createdAt", "updatedAt"
          ) VALUES (
            ${nameEn}, ${nameAr}, ${shortDesc},
            ${descAr}, ${descAr}, ${input.category}, ${subcat},
            ${tagsVal}, ${input.country}, ${input.city}, ${addr}, ${addrAr},
            ${phoneVal}, ${webVal}, 'active', ${slug},
            ${false}, ${true}, ${ratingVal}, ${reviews},
            ${lat}, ${lng}, ${price},
            NOW(), NOW(),
            ${nameEn}, ${nameAr}, ${shortDesc},
            ${descAr}, ${descAr}, ${addrAr},
            ${false}, ${true}, ${reviews},
            ${price}, NOW(), NOW()
          )
          RETURNING id
        `;

        return { id: result[0]?.id || 0, slug, status: "active" };
      } catch (e: any) {
        console.error("[merchant.create] Error:", e?.message);
        return { error: e?.message || "Insert failed" };
      } finally {
        await client.end();
      }
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
      { id: 11, name: "بقالة حلال", nameEn: "halal_grocery", icon: "ShoppingBag", color: "#22c55e", count: 0 },
      { id: 12, name: "مقاهي شيشة", nameEn: "shisha_lounge", icon: "Flame", color: "#8b5cf6", count: 0 },
      { id: 13, name: "وكالات سفر", nameEn: "travel_agency", icon: "Plane", color: "#06b6d4", count: 0 },
      { id: 14, name: "تحويل أموال", nameEn: "money_transfer", icon: "Banknote", color: "#10b981", count: 0 },
      { id: 15, name: "مساجد", nameEn: "mosque", icon: "Landmark", color: "#f59e0b", count: 0 },
      { id: 16, name: "مراكز ثقافية", nameEn: "cultural_center", icon: "BookOpen", color: "#3b82f6", count: 0 },
      { id: 17, name: "سيارات", nameEn: "car_dealer", icon: "Car", color: "#06b6d4", count: 0 },
      { id: 18, name: "ورش إصلاح", nameEn: "repair_shop", icon: "Wrench", color: "#6b7280", count: 0 },
      { id: 19, name: "أخرى", nameEn: "other", icon: "Store", color: "#6b7280", count: 0 },
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

  // Submit store request (no auth required - public)
  submitRequest: publicQuery
    .input(
      z.object({
        businessNameAr: z.string().min(1),
        businessName: z.string().optional(),
        category: z.string().min(1),
        description: z.string().min(1),
        country: z.string().min(1),
        city: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        contactName: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Generate slug
      const baseSlug = (input.businessName || input.businessNameAr)
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.insert(merchants).values({
        businessName: input.businessName || input.businessNameAr,
        businessNameAr: input.businessNameAr,
        shortDescription: input.description.slice(0, 160),
        description: input.description,
        descriptionAr: input.description,
        category: input.category as any,
        country: input.country,
        city: input.city,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        status: "pending" as any, // Needs admin approval
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, message: "تم استلام الطلب وسيتم المراجعة" };
    }),
});
