import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const subscriptionRouter = createRouter({
  // Create subscription
  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        merchantId: z.number(),
        plan: z.enum(["basic", "premium", "featured"]).default("basic"),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
        price: z.string(),
        paymentMethod: z.string().optional(),
        paymentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Calculate expiry date
      const now = new Date();
      const expiresAt = new Date(now);
      if (input.billingCycle === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const result = await db.insert(subscriptions).values({
        ...input,
        status: "active",
        expiresAt,
        createdAt: now,
        updatedAt: now,
      }).returning({ id: subscriptions.id });

      return result[0];
    }),

  // Get merchant subscription
  getByMerchant: publicQuery
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.merchantId, input.merchantId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
    }),

  // Check if subscription is active
  checkStatus: publicQuery
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const sub = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.merchantId, input.merchantId),
            eq(subscriptions.status, "active")
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      if (!sub[0]) return { isActive: false, plan: null, expiresAt: null };

      const now = new Date();
      const isActive = sub[0].status === "active" && new Date(sub[0].expiresAt) > now;

      return {
        isActive,
        plan: sub[0].plan,
        expiresAt: sub[0].expiresAt,
        status: isActive ? sub[0].status : "expired",
      };
    }),

  // Cancel subscription
  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(subscriptions)
        .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriptions.id, input.id));
      return { success: true };
    }),

  // List all subscriptions (admin)
  list: publicQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(subscriptions.status, input.status as any));
      }
      return db
        .select()
        .from(subscriptions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(subscriptions.createdAt));
    }),
});
