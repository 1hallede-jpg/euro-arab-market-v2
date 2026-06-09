import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

// Helper to create a session ID
function createSessionId(userId?: number): string {
  return `${userId || "anon"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Maximum wishes per day
const MAX_WISHES = 3;

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

      const msg = input.message.toLowerCase();

      // Check for wish limit
      if (wishesUsed >= MAX_WISHES && !input.userId) {
        response = `عذراً يا صديقي! لقد استنفذت ${MAX_WISHES} أمنياتك لهذا اليوم. سجل دخول للحصول على أمنيات غير محدودة! 🧞‍♂️`;
      } else {
        // Restaurant queries
        if (msg.includes("مطعم") || msg.includes("مطاعم") || msg.includes("أكل") || msg.includes("طعام") || msg.includes("عشاء") || msg.includes("غداء")) {
          responseType = "restaurant";
          response = `أهلاً يا صديقي! 🍽️

يوجد العديد من المطاعم العربية الممتازة في أوروبا. إليك بعض الاقتراحات:

**باريس 🇫🇷**
- مطعم الشام - مطاعم سورية
- مطعم لبنان الحلو - مطاعم لبنانية
- مطعم الصago - مطاعم مغربية

**برلين 🇩🇪**
- مطعم دمشق - مطاعم سورية
- مطعم بيروت - مطاعم لبنانية
- مطعم الف ليلة وليلة - مطاعم عراقية

**لندن 🇬🇧**
- مطعم مراكش - مطاعم مغربية
- مطعم القاهرة - مطاعم مصرية
- مطعم صنعاء - مطاعم يمنية

يمكنك البحث في موقعنا للحصول على عناوين وأرقام هواتف هذه المطاعم! 🔍`;
        }
        // Supermarket queries
        else if (msg.includes("سوبرماركت") || msg.includes("حلال") || msg.includes("لحم") || msg.includes("بقالة") || msg.includes("تسوق")) {
          responseType = "supermarket";
          response = `طبعاً يا صديقي! 🛒

هذه بعض أشهر السوبرماركت الحلال في أوروبا:

**باريس 🇫🇷**
- سوبرماركت الأندلس - منتجات حلال وعربية
- سوبرماركت المدينة المنورة - لحوم حلال
- ماركت الشرق الأوسط - منتجات متنوعة

**برلين 🇩🇪**
- سوبرماركت السلام - منتجات حلال
- ماركت الأنصار - خضار وفواكه عربية
- سوبرماركت الفردوس - لحوم حلال طازجة

**أمستردام 🇳🇱**
- سوبرماركت الإيمان - منتجات حلال
- ماركت الأقصى - بهارات ومنتجات عربية

جميع هذه المتاجر معتمدة من الهيئات الإسلامية في أوروبا! ✅`;
        }
        // Barber queries
        else if (msg.includes("حلاق") || msg.includes("صالون") || msg.includes("حلاقة") || msg.includes("شعر")) {
          responseType = "barber";
          response = `عندي لك خيارات ممتازة يا صديقي! 💈

**صالونات الحلاقة العربية:**

**باريس 🇫🇷**
- صالون السلطان - حلاقة رجالية عربية
- صالون الشام - حلاقة وتجميل
- صالون الأصيل - حلاقة تقليدية

**لندن 🇬🇧**
- صالون الملك - حلاقة عربية فاخرة
- صالون دمشق - حلاقة وتصفيف شعر
- صالون الأنيق - حلاقة حديثة

**ميونخ 🇩🇪**
- صالون بيروت - حلاقة لبنانية
- صالون القدس - حلاقة فلسطينية
- صالون الرجال - حلاقة عصرية

معظمها يتحدث العربية ويعرف الاستايلات العربية! ✂️`;
        }
        // Job queries
        else if (msg.includes("وظيفة") || msg.includes("شغل") || msg.includes("عمل") || msg.includes("مهنة") || msg.includes("توظيف")) {
          responseType = "job";
          response = `بالتأكيد! يوجد العديد من الفرص الوظيفية للعرب في أوروبا 💼

**أكثر المهن المطلوبة:**

1. **البناء والإنشاءات** 🏗️
   - خبرة في الدهان والجبس
   - راتب: €1,800 - €3,500

2. **القيادة والتوصيل** 🚗
   - رخصة قيادة أوروبية
   - راتب: €2,000 - €3,000

3. **المطاعم والفنادق** 🍽️
   - طباخين ومساعدين
   - راتب: €1,500 - €2,800

4. **تكنولوجيا المعلومات** 💻
   - مبرمجين ومصممين
   - راتب: €3,000 - €6,000

5. **الترجمة والتعليم** 📚
   - مترجمين ومدرسين
   - راتب: €2,500 - €4,500

تفضل بزيارة قسم المهن في موقعنا لمزيد من التفاصيل! 📋`;
        }
        // General greeting
        else if (msg.includes("مرحبا") || msg.includes("هلا") || msg.includes("السلام") || msg.includes("أهلا") || msg.includes("هاي")) {
          response = `السلام عليكم ورحمة الله وبركاته يا صديقي! 🌙

أنا سندباد، مساعدك الذكي في يورو عرب ماركت. عندك ${wishesRemaining} أمنية يومياً، وإن شاء الله راح أساعدك في كل شي تحتاجه في أوروبا! 🧞‍♂️

اكتب لي أي استفسار عن:
• 🍽️ مطاعم عربية
• 🛒 متاجر حلال
• 💈 صالونات حلاقة
• 🔧 خدمات ومهن
• 📍 أماكن وعناوين

كيف أقدر أساعدك اليوم؟ ✨`;
        }
        // Location/address queries
        else if (msg.includes("عنوان") || msg.includes("موقع") || msg.includes("مكان") || msg.includes("فين") || msg.includes("وين")) {
          responseType = "location";
          response = `أكيد يا صديقي! 📍

أحتاج أعرف شو بالضبط تدور عليه وفي أي مدينة. مثلاً:

**إذا كنت في:**
- **باريس** 🇫🇷 - فيه حي العرب في الدائرة 18 (شارع باربيس)
- **برلين** 🇩🇪 - منطقة نويكولن فيها محلات عربية كثيرة
- **لندن** 🇬🇧 - منطقة إدجور رود فيها محلات عربية
- **أمستردام** 🇳🇱 - منطقة بول هاين

قل لي:
1. في أي مدينة أنت؟
2. شو تدور بالضبط؟

وراح أعطيك العناوين الدقيقة! 🗺️`;
        }
        // Help
        else {
          response = `شكراً لسؤالك يا صديقي! 🌟

أنا سندباد هنا لأساعدك في:

1. **البحث عن متاجر عربية** - مطاعم، سوبرماركت، صالونات، وأكثر
2. **العثور على وظائف** - شواغر في مختلف المجالات
3. **العناوين والمواقع** - أدلك على أقرب مكان
4. **معلومات عامة** - عن الحياة في أوروبا

**نصائح للبحث:**
- اكتب اسم المدينة + نوع المحل
- مثال: "مطاعم عربية في باريس"
- مثال: "سوبرماركت حلال في برلين"

عندك ${wishesRemaining} أمنية متبقية اليوم! 🧞‍♂️

كيف أقدر أساعدك؟`;
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
