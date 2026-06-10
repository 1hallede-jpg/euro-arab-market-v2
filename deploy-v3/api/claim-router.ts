import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { claims, merchants } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const claimRouter = createRouter({
  // Submit claim request
  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        merchantId: z.number(),
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        proofDocument: z.string().optional(),
        businessRegistration: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if merchant already claimed
      const existing = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.merchantId, input.merchantId),
            eq(claims.status, "pending")
          )
        )
        .limit(1);

      if (existing[0]) {
        throw new Error("There is already a pending claim for this business");
      }

      const result = await db.insert(claims).values({
        ...input,
        status: "pending",
        createdAt: new Date(),
      }).returning({ id: claims.id });

      return result[0];
    }),

  // Get claims by merchant
  getByMerchant: publicQuery
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(claims)
        .where(eq(claims.merchantId, input.merchantId))
        .orderBy(desc(claims.createdAt));
    }),

  // Approve claim (admin)
  approve: publicQuery
    .input(
      z.object({
        id: z.number(),
        reviewedBy: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Update claim status
      await db
        .update(claims)
        .set({
          status: "approved",
          reviewedBy: input.reviewedBy,
          reviewedAt: new Date(),
        })
        .where(eq(claims.id, input.id));

      // Get claim details
      const claim = await db
        .select()
        .from(claims)
        .where(eq(claims.id, input.id))
        .limit(1);

      if (claim[0]) {
        // Update merchant to claimed
        await db
          .update(merchants)
          .set({
            status: "claimed",
            claimedBy: claim[0].userId,
            claimedAt: new Date(),
          })
          .where(eq(merchants.id, claim[0].merchantId));
      }

      return { success: true };
    }),

  // Reject claim (admin)
  reject: publicQuery
    .input(
      z.object({
        id: z.number(),
        reviewedBy: z.number(),
        rejectionReason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(claims)
        .set({
          status: "rejected",
          reviewedBy: input.reviewedBy,
          reviewedAt: new Date(),
          rejectionReason: input.rejectionReason,
        })
        .where(eq(claims.id, input.id));
      return { success: true };
    }),

  // List all claims (admin)
  list: publicQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(claims.status, input.status as any));
      }
      return db
        .select()
        .from(claims)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(claims.createdAt));
    }),
});
