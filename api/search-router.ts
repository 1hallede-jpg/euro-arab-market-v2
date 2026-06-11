import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { merchants, jobs, emergencyContacts } from "../db/schema";
import { like, or, and, eq, sql, desc } from "drizzle-orm";

export const searchRouter = createRouter({
  // Universal search across merchants and jobs
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        type: z.enum(["all", "merchants", "jobs"]).default("all"),
        country: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const searchTerm = `%${input.query}%`;
      const results: any = { merchants: [], jobs: [], total: 0 };

      if (input.type === "all" || input.type === "merchants") {
        const merchantConditions = [
          or(
            like(merchants.businessName, searchTerm),
            like(merchants.businessNameAr, searchTerm),
            like(merchants.description, searchTerm),
            like(merchants.descriptionAr, searchTerm),
            like(merchants.tags, searchTerm),
            like(merchants.city, searchTerm),
            like(merchants.country, searchTerm)
          ),
          eq(merchants.status, "active"),
        ];

        if (input.country) {
          merchantConditions.push(eq(merchants.country, input.country));
        }
        if (input.city) {
          merchantConditions.push(eq(merchants.city, input.city));
        }
        if (input.category) {
          merchantConditions.push(eq(merchants.category, input.category as any));
        }

        results.merchants = await db
          .select()
          .from(merchants)
          .where(and(...merchantConditions))
          .limit(input.limit)
          .orderBy(desc(merchants.rating));
      }

      if (input.type === "all" || input.type === "jobs") {
        const jobConditions = [
          or(
            like(jobs.title, searchTerm),
            like(jobs.titleAr, searchTerm),
            like(jobs.description, searchTerm),
            like(jobs.descriptionAr, searchTerm),
            like(jobs.tags, searchTerm),
            like(jobs.city, searchTerm),
            like(jobs.country, searchTerm)
          ),
          eq(jobs.status, "open"),
        ];

        if (input.country) {
          jobConditions.push(eq(jobs.country, input.country));
        }
        if (input.city) {
          jobConditions.push(eq(jobs.city, input.city));
        }
        if (input.category) {
          jobConditions.push(eq(jobs.category, input.category as any));
        }

        results.jobs = await db
          .select()
          .from(jobs)
          .where(and(...jobConditions))
          .limit(input.limit)
          .orderBy(desc(jobs.createdAt));
      }

      // Search emergency contacts
      const emergencyConditions = [
        or(
          like(emergencyContacts.name, searchTerm),
          like(emergencyContacts.nameAr, searchTerm),
          like(emergencyContacts.description, searchTerm),
          like(emergencyContacts.descriptionAr, searchTerm),
          like(emergencyContacts.phone, searchTerm),
          like(emergencyContacts.city, searchTerm),
          like(emergencyContacts.country, searchTerm),
          like(emergencyContacts.address, searchTerm)
        ),
        eq(emergencyContacts.isActive, true),
      ];

      if (input.country) {
        emergencyConditions.push(eq(emergencyContacts.country, input.country));
      }
      if (input.city) {
        emergencyConditions.push(eq(emergencyContacts.city, input.city));
      }

      results.emergency = await db
        .select()
        .from(emergencyContacts)
        .where(and(...emergencyConditions))
        .limit(input.limit)
        .orderBy(emergencyContacts.type, emergencyContacts.city);

      results.total = results.merchants.length + results.jobs.length + (results.emergency?.length || 0);

      return results;
    }),

  // Get popular searches
  popularSearches: publicQuery.query(async () => {
    // Return popular search suggestions for Arab/European market
    return [
      { id: 1, query: "مطاعم عربية في باريس", type: "merchant", count: 1250 },
      { id: 2, query: "سوبرماركت حلال في برلين", type: "merchant", count: 980 },
      { id: 3, query: "صالون حلاقة في لندن", type: "merchant", count: 850 },
      { id: 4, query: "جزار حلال في أمستردام", type: "merchant", count: 720 },
      { id: 5, query: "مهندس في ميونخ", type: "job", count: 650 },
      { id: 6, query: "سائق في فيينا", type: "job", count: 540 },
      { id: 7, query: "معلم في بروكسل", type: "job", count: 480 },
      { id: 8, query: "حلواني في ستوكهولم", type: "job", count: 390 },
      { id: 9, query: "محاسب في مدريد", type: "job", count: 350 },
      { id: 10, query: "طبيب في روما", type: "job", count: 320 },
    ];
  }),

  // Get suggestions based on query
  suggestions: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const searchTerm = `%${input.query}%`;

      const [merchantResults, jobResults] = await Promise.all([
        db
          .select({
            id: merchants.id,
            name: merchants.businessName,
            type: sql<string>`'merchant'`,
            category: merchants.category,
            city: merchants.city,
          })
          .from(merchants)
          .where(
            and(
              or(
                like(merchants.businessName, searchTerm),
                like(merchants.businessNameAr, searchTerm)
              ),
              eq(merchants.status, "active")
            )
          )
          .limit(5),
        db
          .select({
            id: jobs.id,
            name: jobs.title,
            type: sql<string>`'job'`,
            category: jobs.category,
            city: jobs.city,
          })
          .from(jobs)
          .where(
            and(
              or(
                like(jobs.title, searchTerm),
                like(jobs.titleAr, searchTerm)
              ),
              eq(jobs.status, "open")
            )
          )
          .limit(5),
      ]);

      return [...merchantResults, ...jobResults];
    }),
});
