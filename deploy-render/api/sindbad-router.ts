import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

// Maximum wishes per day
const MAX_WISHES = 5;

// ==================== AI PROVIDERS ====================

// 1. OpenRouter - Free tier available (primary)
async function callOpenRouter(message: string): Promise<string | null> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-or-v1-demo", // Free tier works without key for demo
        "HTTP-Referer": "https://euroarabmarket.com",
        "X-Title": "Euro Arab Market",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `أنت سندباد، مساعد ذكي وودود في موقع "يورو عرب ماركت" (Euro Arab Market). الموقع هو دليل المتاجر والمهن العربية في أوروبا.

معلومات عن الموقع:
- يضم أكثر من 50 متجر عربي في 25 مدينة أوروبية
- الفئات: مطاعم، سوبرماركت، حلويات، حلاقة، جزار، مقاهي، مساجد، وغيرها
- المدن: باريس، لندن، برلين، أمستردام، بروكسل، فيينا، مدريد، روما، ستوكهولم، وغيرها
- يقدم أيضاً وظائف للعرب في أوروبا
- يمكن للتجار المطالبة بمتاجرهم وإدارتها

أجب بالعربية الفصحى أو باللهجة التي يكتب بها المستخدم. كن ودوداً ومفيداً.`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.log("OpenRouter error:", response.status);
      return null;
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter error:", error);
    return null;
  }
}

// 2. Ollama local (if available)
async function callOllama(message: string): Promise<string | null> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: `أنت سندباد، مساعد ذكي في موقع يورو عرب ماركت.\n\nالمستخدم: ${message}\n\nالرد:`,
        stream: false,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json() as any;
    return data.response || null;
  } catch {
    return null;
  }
}

// 3. Groq - Free tier with $5 credit
async function callGroq(message: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "أنت سندباد، مساعد ذكي في موقع يورو عرب ماركت - دليل المتاجر العربية في أوروبا.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// Main AI caller - tries all providers
async function getAIResponse(message: string): Promise<string | null> {
  // Try Groq first (fastest and cheapest)
  const groq = await callGroq(message);
  if (groq) return groq;

  // Try OpenRouter (free models available)
  const openrouter = await callOpenRouter(message);
  if (openrouter) return openrouter;

  // Try Ollama (local)
  const ollama = await callOllama(message);
  if (ollama) return ollama;

  return null;
}

// ==================== FALLBACK RESPONSES ====================

const KNOWLEDGE_BASE = {
  restaurants: {
    paris: [
      { name: "مطعم الأعجمي", cuisine: "سوري", rating: "4.7" },
      { name: "مقهى جامع باريس", cuisine: "مغربي", rating: "4.7" },
      { name: "مطعم الشام", cuisine: "شامي", rating: "4.5" },
    ],
    berlin: [
      { name: "مطعم دمشق", cuisine: "دمشقي", rating: "4.6" },
      { name: "بيروت إكسبرس", cuisine: "لبناني", rating: "4.5" },
      { name: "مطعم الأندلس", cuisine: "مغربي", rating: "4.4" },
    ],
    london: [
      { name: "مطعم بلاد الشام", cuisine: "شامي فاخر", rating: "4.6" },
      { name: "ليالي العربية", cuisine: "عربي فاخر", rating: "4.8" },
    ],
    amsterdam: [
      { name: "سوق أمستردام", cuisine: "عربي", rating: "4.5" },
    ],
    brussels: [
      { name: "مطعم الصحراء", cuisine: "مغربي جزائري", rating: "4.4" },
    ],
    vienna: [
      { name: "الشرقي - فيينا", cuisine: "عراقي", rating: "4.5" },
    ],
    madrid: [
      { name: "الواحة الحلال", cuisine: "حلال إسباني", rating: "4.4" },
    ],
    rome: [
      { name: "مطعم السلطان", cuisine: "تركي عربي", rating: "4.3" },
    ],
    barcelona: [
      { name: "لاونج برشلونة العربي", cuisine: "عربي", rating: "4.3" },
    ],
    milan: [
      { name: "مطعم النيل", cuisine: "مصري", rating: "4.3" },
    ],
    lisbon: [
      { name: "مطعم مكة", cuisine: "عربي حلال", rating: "4.4" },
      { name: "مطعم الأندلس", cuisine: "مغربي أندلسي", rating: "4.6" },
    ],
    athens: [
      { name: "مطعم أثينا الحلال", cuisine: "حلال عربي", rating: "4.2" },
    ],
  },
  supermarkets: {
    paris: ["سوق العالم العربي"],
    berlin: ["سوبرماركت بابل"],
    amsterdam: ["سوق الإيمان الحلال"],
    madrid: ["سوق المسجد المركزي"],
    prague: ["سوبرماركت الرشيد"],
    stockholm: ["سوبرماركت ستوكهولم العربي"],
  },
  barbers: {
    paris: ["صالون السلطان"],
    london: ["صالون الملك"],
    munich: ["صالون الحلاقة الحلال"],
    oslo: ["صالون أوسلو العربي"],
  },
  sweets: {
    paris: ["بكداش - آيس كريم حلبي"],
    berlin: ["حلويات الأندلس"],
    brussels: ["قصر البقلاوة"],
    budapest: ["مخبز القدس"],
    zurich: ["مقهى الصحراء"],
  },
  cities: ["باريس", "لندن", "برلين", "أمستردام", "بروكسل", "فيينا", "مدريد", "برشلونة", "روما", "ميلانو", "ستوكهولم", "كوبنهاغن", "أثينا", "لشبونة", "أوسلو", "هلسنكي", "دبلن", "بوخارست", "بودابست", "وارسو", "براغ"],
};

function getFallbackResponse(message: string, wishesRemaining: number): string {
  const msg = message.toLowerCase();

  // Restaurant queries
  if (msg.includes("مطعم") || msg.includes("مطاعم") || msg.includes("أكل") || msg.includes("طعام") || msg.includes("أكلة")) {
    let cityMatch = "";
    for (const city of KNOWLEDGE_BASE.cities) {
      if (msg.includes(city)) { cityMatch = city; break; }
    }

    let response = `🍽️ **المطاعم العربية في أوروبا**\n\n`;
    if (cityMatch) {
      const cityData = KNOWLEDGE_BASE.restaurants[cityMatch as keyof typeof KNOWLEDGE_BASE.restaurants];
      if (cityData) {
        response += `**في ${cityMatch}:**\n`;
        cityData.forEach((r, i) => {
          response += `${i + 1}. ${r.name} (${r.cuisine}) ⭐${r.rating}\n`;
        });
      }
    } else {
      response += `أشهر المطاعم العربية:\n\n`;
      response += `🇫🇷 **باريس**: الأعجمي (سوري) ⭐4.7، مقهى جامع باريس (مغربي) ⭐4.7\n`;
      response += `🇩🇪 **برلين**: دمشق (دمشقي) ⭐4.6، بيروت إكسبرس (لبناني) ⭐4.5\n`;
      response += `🇬🇧 **لندن**: بلاد الشام (شامي فاخر) ⭐4.6\n`;
      response += `🇳🇱 **أمستردام**: سوق أمستردام (عربي) ⭐4.5\n`;
      response += `🇦🇹 **فيينا**: الشرقي (عراقي) ⭐4.5\n`;
      response += `🇪🇸 **مدريد**: الواحة الحلال (حلال) ⭐4.4\n`;
      response += `🇵🇹 **لشبونة**: الأندلس (مغربي) ⭐4.6\n`;
    }
    response += `\nاكتب اسم المدينة للحصول على قائمة أدق! 🎯`;
    return response;
  }

  // Supermarket queries
  if (msg.includes("سوبرماركت") || msg.includes("حلال") || msg.includes("بقالة") || msg.includes("سوق")) {
    return `🛒 **أسواق الحلال في أوروبا**\n\n` +
      `🇫🇷 **باريس**: سوق العالم العربي\n` +
      `🇩🇪 **برلين**: سوبرماركت بابل\n` +
      `🇳🇱 **أمستردام**: سوق الإيمان الحلال\n` +
      `🇪🇸 **مدريد**: سوق المسجد المركزي\n` +
      `🇨🇿 **براغ**: سوبرماركت الرشيد\n` +
      `🇸🇪 **ستوكهولم**: سوبرماركت ستوكهولم العربي\n\n` +
      `جميعها معتمدة حلال ✅`;
  }

  // Barber queries
  if (msg.includes("حلاق") || msg.includes("صالون") || msg.includes("حلاقة")) {
    return `💈 **صالونات الحلاقة العربية**\n\n` +
      `🇫🇷 **باريس**: صالون السلطان (رجالي فاخر)\n` +
      `🇬🇧 **لندن**: صالون الملك (عربي فاخر)\n` +
      `🇩🇪 **ميونخ**: صالون الحلاقة الحلال\n` +
      `🇳🇴 **أوسلو**: صالون أوسلو العربي\n\n` +
      `كلها تتكلم عربي وتعرف القصات العربية! ✂️`;
  }

  // Sweets
  if (msg.includes("حلو") || msg.includes("حلويات") || msg.includes("بقلاوة") || msg.includes("كنافة")) {
    return `🧁 **أشهر محلات الحلويات**\n\n` +
      `🇫🇷 **باريس**: بكداش - آيس كريم حلبي (فستق حلبي) ⭐4.8\n` +
      `🇩🇪 **برلين**: حلويات الأندلس (بقلاوة وكنافة) ⭐4.8\n` +
      `🇧🇪 **بروكسل**: قصر البقلاوة (تركي فاخر) ⭐4.7\n` +
      `🇭🇺 **بودابست**: مخبز القدس (فلسطيني) ⭐4.5\n` +
      `🇨🇭 **زيورخ**: مقهى الصحراء ⭐4.4\n\n` +
      `بالعافية! 😋`;
  }

  // Job queries
  if (msg.includes("وظيفة") || msg.includes("شغل") || msg.includes("عمل") || msg.includes("وظائف") || msg.includes("مهنة")) {
    return `💼 **الوظائف للعرب في أوروبا**\n\n` +
      `🏗️ **البناء**: €1,800 - €3,500\n` +
      `🚗 **القيادة**: €2,000 - €3,000\n` +
      `🍽️ **المطاعم**: €1,500 - €2,800\n` +
      `💻 **IT وتطوير**: €3,000 - €6,000\n` +
      `📚 **الترجمة والتعليم**: €2,500 - €4,500\n` +
      `📸 **التصوير والجرافيك**: €2,000 - €4,000\n\n` +
      `زر قسم "المهن" في الموقع للتفاصيل! 📋`;
  }

  // City queries
  if (msg.includes("مدينة") || msg.includes("مدن")) {
    return `🌍 **المدن المغطاة (25 مدينة)**\n\n` +
      `🇫🇷 باريس، ليون، مرسيليا، نيس\n` +
      `🇩🇪 برلين، هامبورغ، ميونخ، فرانكفورت\n` +
      `🇬🇧 لندن، مانشستر، برمنغهام\n` +
      `🇳🇱 أمستردام، روتردام\n` +
      `🇧🇪 بروكسل | 🇦🇹 فيينا | 🇪🇸 مدريد، برشلونة\n` +
      `🇮🇹 روما، ميلانو | 🇨🇭 جنيف، زيورخ\n` +
      `🇸🇪 ستوكهولم | 🇩🇰 كوبنهاغن | 🇳🇴 أوسلو\n` +
      `🇫🇮 هلسنكي | 🇮🇪 دبلن | 🇬🇷 أثينا\n` +
      `🇵🇹 لشبونة | 🇷🇴 بوخارست | 🇭🇺 بودابست\n` +
      `🇵🇱 وارسو | 🇨🇿 براغ\n\n` +
      `50+ متجر عربي منتشرة في هذه المدن! 🏪`;
  }

  // Claim business
  if (msg.includes("مطالبة") || msg.includes("ملك") || msg.includes("متجري") || msg.includes("تجاري")) {
    return `📋 **المطالبة بالمتجر**\n\n` +
      `للمطالبة بمتجرك في يورو عرب ماركت:\n\n` +
      `1. سجل دخول في الموقع\n` +
      `2. اذهب لصفحة المتجر\n` +
      `3. اضغط "هذا متجري"\n` +
      `4. املأ النموذج برقم الهاتف والوثائق\n` +
      `5. انتظر موافقة الإدارة خلال 24 ساعة\n\n` +
      `بعد الموافقة تستطيع إدارة صفحتك! ✅`;
  }

  // Greeting
  if (msg.includes("مرحبا") || msg.includes("هلا") || msg.includes("السلام") || msg.includes("أهلا") || msg.includes("صباح") || msg.includes("مساء") || msg.includes("تحية")) {
    return `🌙 **السلام عليكم ورحمة الله وبركاته!**\n\n` +
      `أنا **سندباد** 🧞‍♂️، مساعدك الذكي في **يورو عرب ماركت**!\n\n` +
      `🏪 50+ متجر عربي في 25 مدينة أوروبية\n` +
      `💼 وظائف للعرب في أوروبا\n\n` +
      `اكتب لي عن:\n` +
      `🍽️ مطاعم عربية | 🛒 أسواق حلال\n` +
      `💈 صالونات | 💼 وظائف\n` +
      `📍 عناوين ومواقع | ❓ أي سؤال\n\n` +
      `كيف أقدر أساعدك اليوم؟ ✨`;
  }

  // Help
  if (msg.includes("مساعدة") || msg.includes("help") || msg.includes("ماذا") || msg.includes("شو") || msg.includes("كيف")) {
    return `🎯 **أنا سندباد، يمكنني مساعدتك في:**\n\n` +
      `🔍 البحث عن متاجر عربية في أوروبا\n` +
      `📍 إيجاد عناوين وهواتف المتاجر\n` +
      `💼 معلومات عن الوظائف المتاحة\n` +
      `📋 شرح كيفية المطالبة بمتجرك\n` +
      `🏙️ معلومات عن المدن الأوروبية\n` +
      `ℹ️ أي استفسار عام\n\n` +
      `اكتب سؤالك وسأجيبك! 💬`;
  }

  // Default
  return `شكراً لسؤالك! 🌟\n\n` +
    `أنا سندباد، مساعدك في يورو عرب ماركت.\n\n` +
    `اكتب لي عن:\n` +
    `🍽️ مطاعم عربية\n` +
    `🛒 أسواق حلال\n` +
    `💈 صالونات حلاقة\n` +
    `💼 وظائف\n` +
    `📍 عناوين ومواقع\n` +
    `❓ أي سؤال\n\n` +
    `متبقي ${wishesRemaining} أمنيات اليوم! 🧞‍♂️`;
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
      const sessionId = input.sessionId || `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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

      // Generate response
      let response: string;
      let responseType = "fallback";

      // Check wish limit for anonymous users
      if (wishesUsed >= MAX_WISHES && !input.userId) {
        response = `عذراً يا صديقي! 🚫\n\n` +
          `لقد استنفذت **${MAX_WISHES} أمنياتك** لهذا اليوم.\n\n` +
          `💡 **للحصول على أمنيات غير محدودة:**\n` +
          `سجل دخول بحسابك (مجاني!)\n\n` +
          `أو تعال غداً لأمنيات جديدة! 🌙`;
      } else {
        // Try AI first
        const aiResponse = await getAIResponse(input.message);
        if (aiResponse) {
          response = aiResponse;
          responseType = "ai";
        } else {
          // Fallback to knowledge base
          response = getFallbackResponse(input.message, wishesRemaining);
        }
      }

      // Save assistant response
      await db.insert(chatMessages).values({
        userId: input.userId,
        sessionId,
        role: "assistant",
        content: response,
        createdAt: new Date(),
      });

      return {
        response,
        responseType,
        sessionId,
        wishesUsed: wishesUsed,
        wishesRemaining,
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
        isUnlimited: false,
      };
    }),
});
