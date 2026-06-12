import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { emailLogs } from "./lib/email";

export const emailLogRouter = createRouter({
  // Get recent email logs (for admin to check notifications)
  list: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        type: z.string().optional(), // "merchant" | "skill"
      }).optional()
    )
    .query(({ input }) => {
      let logs = [...emailLogs].reverse();
      if (input?.type) {
        logs = logs.filter((l: any) => {
          if (input.type === "merchant") return l.merchantId !== undefined;
          if (input.type === "skill") return l.skillId !== undefined;
          return true;
        });
      }
      return logs.slice(0, input?.limit || 20).map((l: any) => ({
        id: l.id || Math.random().toString(36).slice(2),
        subject: l.subject,
        to: l.to,
        sentAt: l.sentAt,
        merchantId: l.merchantId,
        skillId: l.skillId,
        preview: l.arabicBody ? (l.arabicBody as string).slice(0, 200) + "..." : "",
      }));
    }),

  // Get full email details
  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const log = emailLogs.find((l: any) => l.id === input.id);
      if (!log) return null;
      return {
        subject: log.subject,
        to: log.to,
        from: log.from,
        sentAt: log.sentAt,
        arabicBody: log.arabicBody,
        englishBody: log.englishBody,
        htmlBody: log.htmlBody,
        merchantId: log.merchantId,
        skillId: log.skillId,
      };
    }),

  // Get counts
  stats: publicQuery.query(() => {
    const total = emailLogs.length;
    const merchantEmails = emailLogs.filter((l: any) => l.merchantId !== undefined).length;
    const skillEmails = emailLogs.filter((l: any) => l.skillId !== undefined).length;
    return { total, merchantEmails, skillEmails };
  }),
});
