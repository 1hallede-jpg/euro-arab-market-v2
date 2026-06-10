import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, merchants } from "../db/schema";
import { eq, desc, sql, avg, count } from "drizzle-orm";

export const reviewsRouter = createRouter({
  // Get reviews for a merchant
  list: publicQuery
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(reviews)
        .where(eq(reviews.merchantId, input.merchantId))
        .orderBy(desc(reviews.createdAt));

      const stats = await db
        .select({
          avgRating: avg(reviews.rating),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.merchantId, input.merchantId));

      return {
        items,
        avgRating: stats[0]?.avgRating ? parseFloat(stats[0].avgRating).toFixed(1) : "0",
        totalReviews: stats[0]?.totalReviews || 0,
      };
    }),

  // Create a review (requires auth)
  create: authedQuery
    .input(
      z.object({
        merchantId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if user already reviewed this merchant
      const existing = await db
        .select()
        .from(reviews)
        .where(
          sql`${reviews.userId} = ${userId} AND ${reviews.merchantId} = ${input.merchantId}`
        );

      if (existing.length > 0) {
        // Update existing review
        await db
          .update(reviews)
          .set({
            rating: input.rating,
            comment: input.comment,
            createdAt: new Date(),
          })
          .where(eq(reviews.id, existing[0].id));

        return { success: true, message: "تم تحديث التقييم" };
      }

      // Create new review
      await db.insert(reviews).values({
        userId,
        merchantId: input.merchantId,
        rating: input.rating,
        comment: input.comment,
        createdAt: new Date(),
      });

      return { success: true, message: "تم إضافة التقييم" };
    }),

  // Delete own review
  delete: authedQuery
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .delete(reviews)
        .where(
          sql`${reviews.id} = ${input.reviewId} AND ${reviews.userId} = ${ctx.user.id}`
        );
      return { success: true };
    }),

  // Admin: verify a review
  verify: authedQuery
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(reviews)
        .set({ isVerified: true })
        .where(eq(reviews.id, input.reviewId));
      return { success: true };
    }),

  // Admin: get all reviews
  adminList: authedQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(100);
    return items;
  }),
});
