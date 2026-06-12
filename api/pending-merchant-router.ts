import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pendingMerchants } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { sendMerchantRegistrationEmail, getEmailLogs } from "./lib/email";

export const pendingMerchantRouter = createRouter({
  // Submit new merchant registration
  submit: publicQuery
    .input(
      z.object({
        businessName: z.string().min(1),
        businessNameAr: z.string().min(1),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        phone: z.string().min(1),
        email: z.string().email(),
        website: z.string().optional(),
        country: z.string().min(1),
        city: z.string().min(1),
        address: z.string().optional(),
        businessRegistrationPhoto: z.string().optional(),
        ownerIdPhoto: z.string().optional(),
        halalCertificate: z.string().optional(),
        logo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // 1. Save merchant to database
      const result = await db.insert(pendingMerchants).values({
        ...input,
        status: "pending",
      }).returning();

      const merchant = result[0];
      const merchantId = merchant.id;

      // 2. Send email notification to admin
      try {
        const emailResult = await sendMerchantRegistrationEmail({
          id: merchantId,
          businessName: input.businessName,
          businessNameAr: input.businessNameAr,
          category: input.category,
          city: input.city,
          country: input.country,
          address: input.address,
          phone: input.phone,
          email: input.email,
          website: input.website,
          description: input.description,
          descriptionAr: input.descriptionAr,
          businessRegistrationPhoto: input.businessRegistrationPhoto,
          ownerIdPhoto: input.ownerIdPhoto,
          halalCertificate: input.halalCertificate,
          logo: input.logo,
        });
        console.log(`[submit] Email result: ${emailResult.message}`);
      } catch (e: any) {
        console.error(`[submit] Email failed: ${e.message}`);
      }

      return { success: true, id: merchantId };
    }),

  // List all pending merchants (for admin)
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();

      if (input?.status) {
        return db.select().from(pendingMerchants)
          .where(eq(pendingMerchants.status, input.status))
          .orderBy(desc(pendingMerchants.createdAt))
          .limit(input.limit);
      }

      return db.select().from(pendingMerchants)
        .orderBy(desc(pendingMerchants.createdAt))
        .limit(input?.limit || 50);
    }),

  // Get single pending merchant
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(pendingMerchants)
        .where(eq(pendingMerchants.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // Update status (approve/reject)
  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "more_info"]),
        adminNotes: z.string().optional(),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(pendingMerchants)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          rejectionReason: input.rejectionReason,
        })
        .where(eq(pendingMerchants.id, input.id));
      return { success: true };
    }),

  // Get email logs (for admin to review sent emails)
  emailLogs: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      return getEmailLogs(input?.limit || 50);
    }),
});
