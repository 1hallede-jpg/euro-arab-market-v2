import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { merchants, jobs, users, reviews, searchLogs } from "@db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [
      usersCount,
      merchantsCount,
      jobsCount,
      reviewsCount,
      pendingMerchants,
      openJobs,
      todaySearches,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(merchants),
      db.select({ count: sql<number>`count(*)` }).from(jobs),
      db.select({ count: sql<number>`count(*)` }).from(reviews),
      db
        .select({ count: sql<number>`count(*)` })
        .from(merchants)
        .where(eq(merchants.status, "pending")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(jobs)
        .where(eq(jobs.status, "open")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(searchLogs)
        .where(sql`DATE(${searchLogs.createdAt}) = DATE(NOW())`),
    ]);

    return {
      users: usersCount[0]?.count || 0,
      merchants: merchantsCount[0]?.count || 0,
      jobs: jobsCount[0]?.count || 0,
      reviews: reviewsCount[0]?.count || 0,
      pendingMerchants: pendingMerchants[0]?.count || 0,
      openJobs: openJobs[0]?.count || 0,
      todaySearches: todaySearches[0]?.count || 0,
    };
  }),

  // List all merchants (admin view with pending)
  merchants: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(merchants.status, input.status as any));
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            like(merchants.businessName, term),
            like(merchants.businessNameAr, term),
            like(merchants.email, term)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(merchants)
          .where(where)
          .limit(input?.limit || 50)
          .offset(input?.offset || 0)
          .orderBy(desc(merchants.createdAt)),
        db.select({ count: sql<number>`count(*)` }).from(merchants).where(where),
      ]);

      return { items, total: totalResult[0]?.count || 0 };
    }),

  // Update merchant status
  updateMerchantStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "active", "suspended", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(merchants)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(merchants.id, input.id));
      return { success: true };
    }),

  // Delete merchant
  deleteMerchant: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(merchants).where(eq(merchants.id, input.id));
      return { success: true };
    }),

  // List all jobs (admin view)
  jobs: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(jobs.status, input.status as any));
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            like(jobs.title, term),
            like(jobs.titleAr, term),
            like(jobs.description, term)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(jobs)
          .where(where)
          .limit(input?.limit || 50)
          .offset(input?.offset || 0)
          .orderBy(desc(jobs.createdAt)),
        db.select({ count: sql<number>`count(*)` }).from(jobs).where(where),
      ]);

      return { items, total: totalResult[0]?.count || 0 };
    }),

  // Update job status
  updateJobStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "closed", "filled", "paused"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(jobs)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(jobs.id, input.id));
      return { success: true };
    }),

  // Delete job
  deleteJob: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(jobs).where(eq(jobs.id, input.id));
      return { success: true };
    }),

  // Get all users
  users: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.role) {
        conditions.push(eq(users.role, input.role as any));
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(like(users.name, term), like(users.email, term))
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(users)
          .where(where)
          .limit(input?.limit || 50)
          .offset(input?.offset || 0)
          .orderBy(desc(users.createdAt)),
        db.select({ count: sql<number>`count(*)` }).from(users).where(where),
      ]);

      return { items, total: totalResult[0]?.count || 0 };
    }),

  // Update user role
  updateUserRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, input.id));
      return { success: true };
    }),

  // Get recent activity
  recentActivity: adminQuery.query(async () => {
    const db = getDb();

    const [recentMerchants, recentJobs, recentUsers, recentReviews] =
      await Promise.all([
        db
          .select()
          .from(merchants)
          .orderBy(desc(merchants.createdAt))
          .limit(5),
        db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(5),
        db.select().from(users).orderBy(desc(users.createdAt)).limit(5),
        db
          .select()
          .from(reviews)
          .orderBy(desc(reviews.createdAt))
          .limit(5),
      ]);

    return {
      merchants: recentMerchants,
      jobs: recentJobs,
      users: recentUsers,
      reviews: recentReviews,
    };
  }),

  // Get search analytics
  searchAnalytics: adminQuery.query(async () => {
    const db = getDb();

    const popularSearches = await db
      .select({
        query: searchLogs.query,
        count: sql<number>`count(*)`,
      })
      .from(searchLogs)
      .groupBy(searchLogs.query)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const searchesByDay = await db
      .select({
        date: sql<string>`DATE(${searchLogs.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(searchLogs)
      .where(sql`${searchLogs.createdAt} > DATE_SUB(NOW(), INTERVAL 30 DAY)`)
      .groupBy(sql`DATE(${searchLogs.createdAt})`)
      .orderBy(sql`DATE(${searchLogs.createdAt})`);

    return { popularSearches, searchesByDay };
  }),
});
