import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { skills } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { sendSkillRegistrationEmail } from "./lib/email";

export const skillsRouter = createRouter({
  // Submit new skill/freelancer registration
  submit: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        fullNameAr: z.string().optional(),
        serviceType: z.string().min(1),
        serviceTypeAr: z.string().optional(),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        yearsOfExperience: z.number().optional(),
        phone: z.string().min(1),
        email: z.string().email(),
        whatsapp: z.string().optional(),
        country: z.string().min(1),
        city: z.string().min(1),
        address: z.string().optional(),
        businessRegistrationPhoto: z.string().optional(),
        experienceCertificate: z.string().optional(),
        portfolioPhotos: z.array(z.string()).optional(),
        profilePhoto: z.string().optional(),
        hourlyRate: z.number().optional(),
        fixedPrice: z.number().optional(),
        currency: z.string().default("EUR"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(skills).values({
        ...input,
        status: "pending",
        subscriptionStatus: "trial",
        subscriptionPlan: "basic",
        subscriptionPrice: "5.00",
      }).returning();

      const skill = result[0];

      // Send email notification to admin
      try {
        await sendSkillRegistrationEmail({
          id: skill.id,
          fullName: input.fullName,
          fullNameAr: input.fullNameAr,
          serviceType: input.serviceType,
          serviceTypeAr: input.serviceTypeAr,
          category: input.category,
          city: input.city,
          country: input.country,
          phone: input.phone,
          email: input.email,
          yearsOfExperience: input.yearsOfExperience,
          description: input.description,
          descriptionAr: input.descriptionAr,
          businessRegistrationPhoto: input.businessRegistrationPhoto,
          experienceCertificate: input.experienceCertificate,
        });
      } catch (e: any) {
        console.error("[skills.submit] Email failed:", e.message);
      }

      return { success: true, id: skill.id };
    }),

  // List skills (for admin)
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();

      let query = db.select().from(skills);

      if (input?.status) {
        return query.where(eq(skills.status, input.status))
          .orderBy(desc(skills.createdAt))
          .limit(input.limit);
      }

      return query.orderBy(desc(skills.createdAt)).limit(input?.limit || 50);
    }),

  // Get single skill
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(skills)
        .where(eq(skills.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // Update status (approve/reject)
  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "active", "suspended", "rejected"]),
        adminNotes: z.string().optional(),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(skills)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          rejectionReason: input.rejectionReason,
        })
        .where(eq(skills.id, input.id));
      return { success: true };
    }),

  // Featured skills by city
  featuredByCity: publicQuery
    .input(z.object({ city: z.string() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.city) {
        return db.select().from(skills)
          .where(eq(skills.city, input.city))
          .where(eq(skills.status, "active"))
          .where(eq(skills.isFeatured, true))
          .orderBy(desc(skills.createdAt))
          .limit(20);
      }
      return db.select().from(skills)
        .where(eq(skills.status, "active"))
        .orderBy(desc(skills.createdAt))
        .limit(20);
    }),
});
