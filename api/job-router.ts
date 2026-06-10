import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { jobs } from "../db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";

export const jobRouter = createRouter({
  // Get all jobs with optional filters
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        type: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        experienceLevel: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.category) {
        conditions.push(eq(jobs.category, input.category as any));
      }
      if (input?.type) {
        conditions.push(eq(jobs.type, input.type as any));
      }
      if (input?.country) {
        conditions.push(eq(jobs.country, input.country));
      }
      if (input?.city) {
        conditions.push(eq(jobs.city, input.city));
      }
      if (input?.experienceLevel) {
        conditions.push(eq(jobs.experienceLevel, input.experienceLevel as any));
      }
      if (input?.status) {
        conditions.push(eq(jobs.status, input.status as any));
      } else {
        conditions.push(eq(jobs.status, "open"));
      }
      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            like(jobs.title, searchTerm),
            like(jobs.titleAr, searchTerm),
            like(jobs.description, searchTerm),
            like(jobs.descriptionAr, searchTerm),
            like(jobs.tags, searchTerm)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(jobs)
          .where(where)
          .limit(input?.limit || 20)
          .offset(input?.offset || 0)
          .orderBy(desc(jobs.createdAt)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count || 0,
      };
    }),

  // Get single job by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const job = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, input.id))
        .limit(1);

      if (!job[0]) {
        throw new Error("Job not found");
      }

      return job[0];
    }),

  // Create job
  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        titleAr: z.string().optional(),
        description: z.string().min(1),
        descriptionAr: z.string().optional(),
        category: z.enum([
          "construction", "driving", "photography", "painting", "plumbing",
          "electrician", "carpentry", "cleaning", "cooking", "it",
          "translation", "accounting", "medical", "education", "other",
        ]),
        type: z.enum(["full_time", "part_time", "contract", "freelance", "temporary"]),
        requirements: z.string().optional(),
        requirementsAr: z.string().optional(),
        skills: z.string().optional(),
        experienceLevel: z.enum(["entry", "mid", "senior", "expert"]).optional(),
        salaryMin: z.string().optional(),
        salaryMax: z.string().optional(),
        salaryCurrency: z.string().optional(),
        country: z.string().min(1),
        city: z.string().min(1),
        isRemote: z.boolean().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        tags: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-" + Date.now();

      const result = await db.insert(jobs).values({
        ...input,
        slug,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: jobs.id });

      return { id: result[0].id, slug };
    }),

  // Get job categories
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "بناء", nameEn: "construction", icon: "HardHat", color: "#f59e0b", count: 0 },
      { id: 2, name: "قيادة", nameEn: "driving", icon: "Car", color: "#3b82f6", count: 0 },
      { id: 3, name: "تصوير", nameEn: "photography", icon: "Camera", color: "#8b5cf6", count: 0 },
      { id: 4, name: "دهان", nameEn: "painting", icon: "Paintbrush", color: "#ec4899", count: 0 },
      { id: 5, name: "سباكة", nameEn: "plumbing", icon: "Wrench", color: "#06b6d4", count: 0 },
      { id: 6, name: "كهرباء", nameEn: "electrician", icon: "Zap", color: "#f59e0b", count: 0 },
      { id: 7, name: "نجارة", nameEn: "carpentry", icon: "Hammer", color: "#8b4513", count: 0 },
      { id: 8, name: "تنظيف", nameEn: "cleaning", icon: "Sparkles", color: "#10b981", count: 0 },
      { id: 9, name: "طبخ", nameEn: "cooking", icon: "ChefHat", color: "#ef4444", count: 0 },
      { id: 10, name: "تكنولوجيا", nameEn: "it", icon: "Laptop", color: "#6366f1", count: 0 },
      { id: 11, name: "ترجمة", nameEn: "translation", icon: "Languages", color: "#14b8a6", count: 0 },
      { id: 12, name: "محاسبة", nameEn: "accounting", icon: "Calculator", color: "#f97316", count: 0 },
      { id: 13, name: "طب", nameEn: "medical", icon: "Stethoscope", color: "#ef4444", count: 0 },
      { id: 14, name: "تعليم", nameEn: "education", icon: "GraduationCap", color: "#3b82f6", count: 0 },
      { id: 15, name: "أخرى", nameEn: "other", icon: "Briefcase", color: "#6b7280", count: 0 },
    ];

    // Get actual counts
    for (const cat of categories) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobs)
        .where(and(eq(jobs.category, cat.nameEn as any), eq(jobs.status, "open")));
      cat.count = result[0]?.count || 0;
    }

    return categories;
  }),

  // Get recent jobs
  recent: publicQuery
    .input(z.object({ limit: z.number().default(6) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(jobs)
        .where(eq(jobs.status, "open"))
        .orderBy(desc(jobs.createdAt))
        .limit(input?.limit || 6);
    }),
});