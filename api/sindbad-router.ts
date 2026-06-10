import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

// Helper to create a session ID
function createSessionId(userId?: number): string {
  return `${userId || "anon"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Maximum wishes per day
const MAX_WISHES = 3;

// Kimi API integration
async function callKimiAPI(message: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: `أنت سندباد، مساعد ذكي في موقع "يورو عرب ماركت" - دليل المتاجر والمهن العربية في أوروبا.`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || "عذراً، لم أفهم. جرب مرة أخرى!";
  } catch (error) {
    console.error("Kimi API error:", error);
    throw error;
  }
}

// Fallback responses when Kimi API is not available
function getFallbackResponse(message: string, wishesRemaining: number): string {
  const msg = message.toLowerCase();

  // Restaurant queries
  if (msg.includes("مطعم") || msg.includes("مطاعم") || msg.includes("أكل") || msg.includes("طعام")) {
    return `أهلاً يا صديقي! 🍽️

يوجد العديد من المطاعم العربية الممتازة في أوروبا. إليك بعض الاقتراحات:

**باريس 🇫🇷**
- مطعم الشام - مطاعم سورية
- مطعم لبنان الحلو - مطاعم لبنانية

**برلين 🇩🇪**
- مطعم دمشق - مطاعم سورية
- مطعم بيروت - مطاعم لبنانية

يمكنك البحث في موقعنا للحصول على عناوين وأرقام هواتف هذه المطاعم! 🔍`;
  }
  // Supermarket queries
  if (msg.includes("سوبرماركت") || msg.includes("حلال") || msg.includes("بقالة")) {
    return `طبعاً يا صديقي! 🛒

هذه بعض أشهر السوبرماركت الحلال في أوروبا:

**باريس 🇫🇷**
- سوبرماركت الأندلس - منتجات حلال وعربية
- سوبرماركت المدينة المنورة - لحوم حلال

**برلين 🇩🇪**
- سوبرماركت السلام - منتجات حلال
- ماركت الأنصار - خضار وفواكه عربية

جميع هذه المتاجر معتمدة من الهيئات الإسلامية في أوروبا! ✅`;
  }
  // Barber queries
  if (msg.includes("حلاق") || msg.includes("صالون") || msg.includes("حلاقة")) {
    return `عندي لك خيارات ممتازة يا صديقي! 💈

**صالونات الحلاقة العربية:**

**باريس 🇫🇷**
- صالون السلطان - حلاقة رجالية عربية
- صالون الشام - حلاقة وتجميل

**لندن 🇬🇧**
- صالون الملك - حلاقة عربية فاخرة
- صالون دمشق - حلاقة وتصفيف شعر

معظمها يتحدث العربية ويعرف الاستايلات العربية! ✂️`;
  }
  // Job queries
  if (msg.includes("وظيفة") || msg.includes("شغل") || msg.includes("عمل")) {
    return `بالتأكيد! يوجد العديد من الفرص الوظيفية للعرب في أوروبا 💼

**أكثر المهن المطلوبة:**

1. **البناء والإنشاءات** 🏗️ - €1,800 - €3,500
2. **القيادة والتوصيل** 🚗 - €2,000 - €3,000
3. **المطاعم والفنادق** 🍽️ - €1,500 - €2,800
4. **تكنولوجيا المعلومات** 💻 - €3,000 - €6,000
5. **الترجمة والتعليم** 📚 - €2,500 - €4,500

تفضل بزيارة قسم المهن في موقعنا لمزيد من التفاصيل! 📋`;
  }
  // General greeting
  if (msg.includes("مرحبا") || msg.includes("هلا") || msg.includes("السلام") || msg.includes("أهلا")) {
    return `السلام عليكم ورحمة الله وبركاته يا صديقي! 🌙

أنا سندباد، مساعدك الذكي في يورو عرب ماركت. عندك ${wishesRemaining} أمنية يومياً!

اكتب لي أي استفسار عن:
• 🍽️ مطاعم عربية
• 🛒 متاجر حلال
• 💈 صالونات حلاقة
• 🔧 خدمات ومهن
• 📍 أماكن وعناوين

كيف أقدر أساعدك اليوم؟ ✨`;
  }
  // Location queries
  if (msg.includes("عنوان") || msg.includes("موقع") || msg.includes("مكان")) {
    return `أكيد يا صديقي! 📍

قل لي:
1. في أي مدينة أنت؟
2. شو تدور بالضبط؟

وراح أعطيك العناوين الدقيقة! 🗺️`;
  }
  // Default
  return `شكراً لسؤالك يا صديقي! 🌟

أنا سندباد هنا لأساعدك في:
1. **البحث عن متاجر عربية**
2. **العثور على وظائف**
3. **العناوين والمواقع**
4. **معلومات عامة**

عندك ${wishesRemaining} أمنية متبقية اليوم! 🧞‍♂️

كيف أقدر أساعدك؟`;
}

export const sindbadRouter = createRouter({
  // Send message to Sindbad
  chat: publicQuery
    .input(
      z.object({
        message: z.string().min(1),
        sessionId: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const sessionId = input.sessionId || createSessionId(input.userId);

      // Save user message
      await db.insert(chatMessages).values({
        userId: input.userId,
        sessionId,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      // Check wishes used today
      const wishesUsedToday = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.userId, input.userId || 0),
            eq(chatMessages.role, "user"),
            sql`DATE(${chatMessages.createdAt}) = DATE(NOW())`
          )
        );

      const wishesUsed = wishesUsedToday[0]?.count || 0;
      const wishesRemaining = Math.max(0, MAX_WISHES - wishesUsed);

      // Generate Sindbad response
      let response: string;
      let responseType = "general";

      // Check for wish limit
      if (wishesUsed >= MAX_WISHES && !input.userId) {
        response = `عذراً يا صديقي! لقد استنفذت ${MAX_WISHES} أمنياتك لهذا اليوم. سجل دخول للحصول على أمنيات غير محدودة! 🧞‍♂️`;
      } else {
        // Try Kimi API first if API key is available
        const kimiApiKey = process.env.KIMI_API_KEY;
        if (kimiApiKey) {
          try {
            response = await callKimiAPI(input.message, kimiApiKey);
            responseType = "ai";
          } catch {
            response = getFallbackResponse(input.message, wishesRemaining);
          }
        } else {
          response = getFallbackResponse(input.message, wishesRemaining);
        }
      }

      // Save assistant response
      await db.insert(chatMessages).values({
        userId: input.userId,
        sessionId,
        role: "assistant",
        content: response,
        wishesUsed: wishesUsed + 1,
        createdAt: new Date(),
      });

      return {
        response,
        responseType,
        sessionId,
        wishesUsed: wishesUsed + 1,
        wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed - 1),
        maxWishes: MAX_WISHES,
      };
    }),

  // Get chat history for a session
  history: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);
    }),

  // Get user's daily wishes status
  wishesStatus: publicQuery
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      if (!input?.userId) {
        return {
          wishesUsed: 0,
          wishesRemaining: MAX_WISHES,
          maxWishes: MAX_WISHES,
          isUnlimited: false,
        };
      }

      const wishesUsedToday = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.userId, input.userId),
            eq(chatMessages.role, "user"),
            sql`DATE(${chatMessages.createdAt}) = DATE(NOW())`
          )
        );

      const wishesUsed = wishesUsedToday[0]?.count || 0;

      return {
        wishesUsed,
        wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed),
        maxWishes: MAX_WISHES,
        isUnlimited: wishesUsed >= MAX_WISHES ? false : true,
      };
    }),
});
