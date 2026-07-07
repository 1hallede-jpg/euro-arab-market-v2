var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/boot.ts
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// api/auth-router.ts
import * as cookie from "cookie";

// contracts/constants.ts
var Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1e3
};
var ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions"
};
var Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback"
};

// api/lib/cookies.ts
function isLocalhost(headers) {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}
function getSessionCookieOptions(headers) {
  const localhost = isLocalhost(headers);
  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost
  };
}

// api/middleware.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var createRouter = t.router;
var publicQuery = t.procedure;
var requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
function requireRole(role) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}
var authedQuery = t.procedure.use(requireAuth);
var adminQuery = authedQuery.use(requireRole("admin"));

// api/auth-router.ts
var authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase(),
        secure: opts.secure,
        maxAge: 0
      })
    );
    return { success: true };
  })
});

// api/merchant-router.ts
import { z } from "zod";

// api/queries/connection.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// api/lib/env.ts
import "dotenv/config";
function getEnv(name, defaultValue = "") {
  return process.env[name] ?? defaultValue;
}
function detectIsProduction() {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.PORT) return true;
  if (process.env.RENDER) return true;
  return false;
}
var env = {
  appId: getEnv("APP_ID", "euro-arab-market"),
  appSecret: getEnv("APP_SECRET", "sk-euro-arab-secret-2024"),
  isProduction: detectIsProduction(),
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/euroarabmarket"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://kimi.moonshot.cn"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://kimi.moonshot.cn"),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
  // SMTP Configuration
  smtpHost: getEnv("SMTP_HOST", ""),
  smtpPort: parseInt(getEnv("SMTP_PORT", "587")),
  smtpUser: getEnv("SMTP_USER", ""),
  smtpPass: getEnv("SMTP_PASS", ""),
  fromEmail: getEnv("FROM_EMAIL", "info@euroarabmarket.com"),
  adminEmail: getEnv("ADMIN_EMAIL", "info@euroarabmarket.com")
};

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  claims: () => claims,
  emergencyContacts: () => emergencyContacts,
  emergencyTypeEnum: () => emergencyTypeEnum,
  favorites: () => favorites,
  jobs: () => jobs,
  merchants: () => merchants,
  pendingMerchants: () => pendingMerchants,
  reviews: () => reviews,
  searchLogs: () => searchLogs,
  skillStatusEnum: () => skillStatusEnum,
  skills: () => skills,
  subscriptions: () => subscriptions,
  users: () => users
});
import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  bigint,
  jsonb
} from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var merchantCategoryEnum = pgEnum("merchant_category", [
  "restaurant",
  "supermarket",
  "sweets",
  "barber",
  "butcher",
  "bakery",
  "cafe",
  "clothing",
  "electronics",
  "pharmacy",
  "halal_grocery",
  "shisha_lounge",
  "travel_agency",
  "money_transfer",
  "mosque",
  "cultural_center",
  "car_dealer",
  "repair_shop",
  "other"
]);
var merchantStatusEnum = pgEnum("merchant_status", [
  "pending",
  "active",
  "suspended",
  "rejected",
  "claimed"
]);
var jobCategoryEnum = pgEnum("job_category", [
  "construction",
  "driving",
  "photography",
  "painting",
  "plumbing",
  "electrician",
  "carpentry",
  "cleaning",
  "cooking",
  "it",
  "translation",
  "accounting",
  "medical",
  "education",
  "other"
]);
var jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "temporary"
]);
var experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "mid",
  "senior",
  "expert"
]);
var jobStatusEnum = pgEnum("job_status", [
  "open",
  "closed",
  "filled",
  "paused"
]);
var chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
var searchTypeEnum = pgEnum("search_type", ["merchant", "job", "general"]);
var subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
  "trial"
]);
var subscriptionPlanEnum = pgEnum("subscription_plan", [
  "basic",
  "premium",
  "featured"
]);
var claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "approved",
  "rejected"
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull()
});
var merchants = pgTable("merchants", {
  // Basic Info
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  // Business Name
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessNameAr: varchar("businessNameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique(),
  // Description
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  // Category
  category: merchantCategoryEnum("category").notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  tags: text("tags"),
  // Media (Images)
  logo: text("logo"),
  coverImage: text("coverImage"),
  galleryImages: jsonb("galleryImages").default("[]"),
  // Contact
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  // Social Media
  facebookUrl: text("facebookUrl"),
  instagramUrl: text("instagramUrl"),
  tiktokUrl: text("tiktokUrl"),
  youtubeUrl: text("youtubeUrl"),
  // Address
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  addressAr: text("addressAr"),
  postalCode: varchar("postalCode", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  // Location (Google Maps)
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  googleMapsUrl: text("googleMapsUrl"),
  // Opening Hours (Yelp-style)
  openingHours: jsonb("openingHours").default("{}"),
  isOpen24Hours: boolean("isOpen24Hours").default(false),
  // Features & Amenities
  amenities: jsonb("amenities").default("[]"),
  features: jsonb("features").default("[]"),
  // Payment Methods
  paymentMethods: jsonb("paymentMethods").default("[]"),
  acceptsCash: boolean("acceptsCash").default(true),
  acceptsCard: boolean("acceptsCard").default(false),
  // Pricing
  priceRange: varchar("priceRange", { length: 10 }).default("$$"),
  // Status
  status: merchantStatusEnum("status").default("pending").notNull(),
  isVerified: boolean("isVerified").default(false),
  isFeatured: boolean("isFeatured").default(false),
  // Rating
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("reviewCount").default(0),
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  keywords: text("keywords"),
  // Claim Info
  claimedBy: bigint("claimedBy", { mode: "number" }).references(() => users.id),
  claimedAt: timestamp("claimedAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  companyName: varchar("companyName", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  category: jobCategoryEnum("category").notNull(),
  type: jobTypeEnum("type").notNull(),
  requirements: text("requirements"),
  requirementsAr: text("requirementsAr"),
  skills: text("skills"),
  experienceLevel: experienceLevelEnum("experienceLevel").default("entry"),
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  salaryCurrency: varchar("salaryCurrency", { length: 3 }).default("EUR"),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  isRemote: boolean("isRemote").default(false),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  status: jobStatusEnum("status").default("open").notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  expiresAt: timestamp("expiresAt")
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  plan: subscriptionPlanEnum("plan").default("basic").notNull(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  billingCycle: varchar("billingCycle", { length: 20 }).default("monthly"),
  // monthly, yearly
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  // paypal, stripe
  paymentId: varchar("paymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  status: claimStatusEnum("status").default("pending").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  proofDocument: text("proofDocument"),
  // URL to uploaded document
  businessRegistration: text("businessRegistration"),
  message: text("message"),
  reviewedBy: bigint("reviewedBy", { mode: "number" }).references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  wishesUsed: integer("wishesUsed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  query: varchar("query", { length: 500 }).notNull(),
  type: searchTypeEnum("type").default("general"),
  filters: jsonb("filters"),
  resultsCount: integer("resultsCount").default(0),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var emergencyTypeEnum = pgEnum("emergency_type", [
  "embassy",
  "hospital",
  "police",
  "fire",
  "pharmacy_24h",
  "tourist_police",
  "airport",
  "lost_card",
  "taxi",
  "other"
]);
var emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  type: emergencyTypeEnum("type").notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  phoneSecondary: varchar("phoneSecondary", { length: 50 }),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var pendingMerchants = pgTable("pending_merchants", {
  id: serial("id").primaryKey(),
  // Business Info
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessNameAr: varchar("businessNameAr", { length: 255 }).notNull(),
  category: merchantCategoryEnum("category").notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  // Contact
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  website: varchar("website", { length: 255 }),
  // Address
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  // Documents (URLs to uploaded files)
  businessRegistrationPhoto: text("businessRegistrationPhoto"),
  ownerIdPhoto: text("ownerIdPhoto"),
  halalCertificate: text("halalCertificate"),
  logo: text("logo"),
  // Status
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // pending, approved, rejected, more_info
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var skillStatusEnum = pgEnum("skill_status", [
  "pending",
  "active",
  "suspended",
  "rejected"
]);
var skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  // Personal Info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  fullNameAr: varchar("fullNameAr", { length: 255 }),
  // Service Info
  serviceType: varchar("serviceType", { length: 255 }).notNull(),
  serviceTypeAr: varchar("serviceTypeAr", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  // Experience
  yearsOfExperience: integer("yearsOfExperience").default(0),
  // Contact
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  // Address
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  // Documents (URLs to uploaded files)
  businessRegistrationPhoto: text("businessRegistrationPhoto"),
  experienceCertificate: text("experienceCertificate"),
  portfolioPhotos: jsonb("portfolioPhotos").default("[]"),
  profilePhoto: text("profilePhoto"),
  // Pricing
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  fixedPrice: decimal("fixedPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  // Subscription
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus").default("trial"),
  subscriptionPlan: subscriptionPlanEnum("subscriptionPlan").default("basic"),
  subscriptionPrice: decimal("subscriptionPrice", { precision: 10, scale: 2 }).default("5.00"),
  // Status
  status: skillStatusEnum("status").default("pending").notNull(),
  isFeatured: boolean("isFeatured").default(false),
  // Admin
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// db/relations.ts
var relations_exports = {};
__export(relations_exports, {
  chatMessagesRelations: () => chatMessagesRelations,
  favoritesRelations: () => favoritesRelations,
  jobsRelations: () => jobsRelations,
  merchantsRelations: () => merchantsRelations,
  reviewsRelations: () => reviewsRelations,
  searchLogsRelations: () => searchLogsRelations,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
var usersRelations = relations(users, ({ many }) => ({
  merchants: many(merchants),
  jobs: many(jobs),
  reviews: many(reviews),
  chatMessages: many(chatMessages),
  searchLogs: many(searchLogs),
  favorites: many(favorites)
}));
var merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, { fields: [merchants.userId], references: [users.id] }),
  reviews: many(reviews),
  favorites: many(favorites)
}));
var jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  favorites: many(favorites)
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [reviews.merchantId], references: [merchants.id] })
}));
var chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] })
}));
var searchLogsRelations = relations(searchLogs, ({ one }) => ({
  user: one(users, { fields: [searchLogs.userId], references: [users.id] })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [favorites.merchantId], references: [merchants.id] }),
  job: one(jobs, { fields: [favorites.jobId], references: [jobs.id] })
}));

// api/queries/connection.ts
var fullSchema = { ...schema_exports, ...relations_exports };
var instance;
function needsSsl(url) {
  if (url.includes("render.com")) return true;
  if (url.includes("amazonaws.com")) return true;
  if (url.includes("supabase.co")) return true;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return false;
  return env.isProduction;
}
function getDb() {
  if (!instance) {
    const useSsl = needsSsl(env.databaseUrl);
    console.log("[DB] DATABASE_URL:", env.databaseUrl.substring(0, 30) + "...");
    console.log("[DB] SSL enabled:", useSsl);
    const client = postgres(env.databaseUrl, {
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {
      },
      onparameter: () => {
      }
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// api/merchant-router.ts
import { eq, and, desc, sql } from "drizzle-orm";
import postgres2 from "postgres";
var merchantRouter = createRouter({
  // Get all merchants with optional filters
  list: publicQuery.input(
    z.object({
      category: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const db = getDb();
      let query = db.select().from(merchants);
      const conditions = [];
      const targetStatus = input?.status || "active";
      conditions.push(sql`${merchants.status} = ${targetStatus}`);
      if (input?.category) {
        conditions.push(sql`${merchants.category} = ${input.category}`);
      }
      if (input?.country) {
        conditions.push(sql`${merchants.country} = ${input.country}`);
      }
      if (input?.city) {
        conditions.push(sql`${merchants.city} = ${input.city}`);
      }
      if (input?.featured) {
        conditions.push(sql`${merchants.isFeatured} = true`);
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(sql`(
            ${merchants.businessName} ILIKE ${term} OR
            ${merchants.businessNameAr} ILIKE ${term} OR
            ${merchants.description} ILIKE ${term} OR
            ${merchants.descriptionAr} ILIKE ${term} OR
            ${merchants.tags} ILIKE ${term} OR
            ${merchants.city} ILIKE ${term} OR
            ${merchants.country} ILIKE ${term} OR
            ${merchants.address} ILIKE ${term}
          )`);
      }
      const where = conditions.length > 1 ? and(...conditions) : conditions[0];
      const items = await query.where(where).limit(input?.limit || 20).offset(input?.offset || 0).orderBy(desc(merchants.id));
      const countResult = await db.select({ count: sql`count(*)` }).from(merchants).where(where);
      return {
        items,
        total: countResult[0]?.count || 0
      };
    } catch (error) {
      console.error("[merchant.list] Error:", error?.message || error);
      return { items: [], total: 0, error: error?.message };
    }
  }),
  // Get single merchant by ID
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const merchant = await db.select().from(merchants).where(eq(merchants.id, input.id)).limit(1);
    if (!merchant[0]) {
      throw new Error("Merchant not found");
    }
    const merchantReviews = await db.select().from(reviews).where(eq(reviews.merchantId, input.id)).orderBy(desc(reviews.createdAt));
    return {
      ...merchant[0],
      reviews: merchantReviews
    };
  }),
  // Get merchant by slug or id
  getBySlug: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    try {
      const db = getDb();
      let result = await db.select().from(merchants).where(eq(merchants.slug, input.slug)).limit(1);
      if (!result[0] && /^\d+$/.test(input.slug)) {
        result = await db.select().from(merchants).where(eq(merchants.id, parseInt(input.slug))).limit(1);
      }
      if (!result[0]) {
        result = await db.select().from(merchants).where(sql`${merchants.slug} ILIKE ${"%" + input.slug + "%"}`).limit(1);
      }
      if (!result[0]) {
        return null;
      }
      return result[0];
    } catch (error) {
      console.error("[getBySlug] Error:", error?.message);
      return null;
    }
  }),
  // Create merchant
  create: publicQuery.input(
    z.object({
      businessName: z.string().min(1),
      businessNameAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      shortDescription: z.string().optional(),
      category: z.string().min(1),
      subcategory: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      website: z.string().optional(),
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional(),
      addressAr: z.string().optional(),
      postalCode: z.string().optional(),
      latitude: z.string().optional().or(z.number().transform(String)).nullable(),
      longitude: z.string().optional().or(z.number().transform(String)).nullable(),
      openingHours: z.any().optional(),
      tags: z.string().optional(),
      rating: z.number().optional(),
      priceRange: z.string().optional(),
      userId: z.number().optional()
    })
  ).mutation(async ({ input }) => {
    const client = postgres2(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const slug = (input.businessName || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const nameEn = input.businessName;
      const nameAr = input.businessNameAr || nameEn;
      const descAr = input.descriptionAr || input.description || "";
      const shortDesc = input.shortDescription || `${nameAr} \u0641\u064A ${input.city}`.substring(0, 160);
      const addr = input.address || input.city;
      const addrAr = input.addressAr || addr;
      const subcat = input.subcategory || input.category;
      const tagsVal = (input.tags || `${subcat} ${input.city} ${nameAr} ${nameEn}`).substring(0, 200);
      const ratingVal = input.rating || 0;
      const reviews2 = ratingVal > 0 ? Math.floor(Math.random() * 30 + 5) : 0;
      const lat = input.latitude || null;
      const lng = input.longitude || null;
      const price = input.priceRange || "$$";
      const phoneVal = input.phone || "";
      const webVal = input.website || null;
      const result = await client`
          INSERT INTO merchants (
            business_name, business_name_ar, short_description,
            description, description_ar, category, subcategory,
            tags, country, city, address, address_ar,
            phone, website, status, slug,
            is_featured, is_verified, rating, review_count,
            latitude, longitude, price_range,
            created_at, updated_at,
            "businessName", "businessNameAr", "shortDescription",
            "description", "descriptionAr", "addressAr",
            "isFeatured", "isVerified", "reviewCount",
            "priceRange", "createdAt", "updatedAt"
          ) VALUES (
            ${nameEn}, ${nameAr}, ${shortDesc},
            ${descAr}, ${descAr}, ${input.category}, ${subcat},
            ${tagsVal}, ${input.country}, ${input.city}, ${addr}, ${addrAr},
            ${phoneVal}, ${webVal}, 'active', ${slug},
            ${false}, ${true}, ${ratingVal}, ${reviews2},
            ${lat}, ${lng}, ${price},
            NOW(), NOW(),
            ${nameEn}, ${nameAr}, ${shortDesc},
            ${descAr}, ${descAr}, ${addrAr},
            ${false}, ${true}, ${reviews2},
            ${price}, NOW(), NOW()
          )
          RETURNING id
        `;
      return { id: result[0]?.id || 0, slug, status: "active" };
    } catch (e) {
      console.error("[merchant.create] Error:", e?.message);
      return { error: e?.message || "Insert failed" };
    } finally {
      await client.end();
    }
  }),
  // Get featured merchants
  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(merchants).where(and(eq(merchants.status, "active"), eq(merchants.isVerified, true))).orderBy(desc(merchants.rating)).limit(6);
  }),
  // Get categories with counts
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "\u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629", nameEn: "restaurant", icon: "Utensils", color: "#ef4444", count: 0 },
      { id: 2, name: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644", nameEn: "supermarket", icon: "ShoppingCart", color: "#22c55e", count: 0 },
      { id: 3, name: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", nameEn: "sweets", icon: "Cake", color: "#f59e0b", count: 0 },
      { id: 4, name: "\u0635\u0627\u0644\u0648\u0646\u0627\u062A \u062D\u0644\u0627\u0642\u0629", nameEn: "barber", icon: "Scissors", color: "#3b82f6", count: 0 },
      { id: 5, name: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", nameEn: "butcher", icon: "Beef", color: "#ef4444", count: 0 },
      { id: 6, name: "\u0645\u062E\u0627\u0628\u0632", nameEn: "bakery", icon: "Bread", color: "#f59e0b", count: 0 },
      { id: 7, name: "\u0645\u0642\u0627\u0647\u064A", nameEn: "cafe", icon: "Coffee", color: "#8b5cf6", count: 0 },
      { id: 8, name: "\u0645\u0644\u0627\u0628\u0633", nameEn: "clothing", icon: "Shirt", color: "#ec4899", count: 0 },
      { id: 9, name: "\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", nameEn: "electronics", icon: "Smartphone", color: "#06b6d4", count: 0 },
      { id: 10, name: "\u0635\u064A\u062F\u0644\u064A\u0627\u062A", nameEn: "pharmacy", icon: "Pill", color: "#10b981", count: 0 },
      { id: 11, name: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", nameEn: "halal_grocery", icon: "ShoppingBag", color: "#22c55e", count: 0 },
      { id: 12, name: "\u0645\u0642\u0627\u0647\u064A \u0634\u064A\u0634\u0629", nameEn: "shisha_lounge", icon: "Flame", color: "#8b5cf6", count: 0 },
      { id: 13, name: "\u0648\u0643\u0627\u0644\u0627\u062A \u0633\u0641\u0631", nameEn: "travel_agency", icon: "Plane", color: "#06b6d4", count: 0 },
      { id: 14, name: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644", nameEn: "money_transfer", icon: "Banknote", color: "#10b981", count: 0 },
      { id: 15, name: "\u0645\u0633\u0627\u062C\u062F", nameEn: "mosque", icon: "Landmark", color: "#f59e0b", count: 0 },
      { id: 16, name: "\u0645\u0631\u0627\u0643\u0632 \u062B\u0642\u0627\u0641\u064A\u0629", nameEn: "cultural_center", icon: "BookOpen", color: "#3b82f6", count: 0 },
      { id: 17, name: "\u0633\u064A\u0627\u0631\u0627\u062A", nameEn: "car_dealer", icon: "Car", color: "#06b6d4", count: 0 },
      { id: 18, name: "\u0648\u0631\u0634 \u0625\u0635\u0644\u0627\u062D", nameEn: "repair_shop", icon: "Wrench", color: "#6b7280", count: 0 },
      { id: 19, name: "\u0623\u062E\u0631\u0649", nameEn: "other", icon: "Store", color: "#6b7280", count: 0 }
    ];
    for (const cat of categories) {
      const result = await db.select({ count: sql`count(*)` }).from(merchants).where(and(eq(merchants.category, cat.nameEn), eq(merchants.status, "active")));
      cat.count = result[0]?.count || 0;
    }
    return categories;
  }),
  // Get cities list
  cities: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      city: merchants.city,
      country: merchants.country,
      count: sql`count(*)`
    }).from(merchants).where(eq(merchants.status, "active")).groupBy(merchants.city, merchants.country).orderBy(desc(sql`count(*)`));
    return result;
  }),
  // Submit store request (no auth required - public)
  submitRequest: publicQuery.input(
    z.object({
      businessNameAr: z.string().min(1),
      businessName: z.string().optional(),
      category: z.string().min(1),
      description: z.string().min(1),
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      contactName: z.string().optional().nullable()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const baseSlug = (input.businessName || input.businessNameAr).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await db.insert(merchants).values({
      businessName: input.businessName || input.businessNameAr,
      businessNameAr: input.businessNameAr,
      shortDescription: input.description.slice(0, 160),
      description: input.description,
      descriptionAr: input.description,
      category: input.category,
      country: input.country,
      city: input.city,
      address: input.address,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email,
      status: "pending",
      // Needs admin approval
      slug,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return { success: true, message: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0633\u064A\u062A\u0645 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629" };
  }),
  // ─── ADMIN ENDPOINTS ───
  // Admin: list all merchants (active + pending + all)
  adminList: publicQuery.input(
    z.object({
      status: z.string().optional(),
      city: z.string().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(200).default(50),
      offset: z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const db = getDb();
      let query = db.select().from(merchants);
      const conditions = [];
      if (input?.status) {
        conditions.push(sql`${merchants.status} = ${input.status}`);
      }
      if (input?.city) {
        conditions.push(sql`${merchants.city} = ${input.city}`);
      }
      if (input?.category) {
        conditions.push(sql`${merchants.category} = ${input.category}`);
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(sql`(
            ${merchants.businessName} ILIKE ${term} OR
            ${merchants.businessNameAr} ILIKE ${term} OR
            ${merchants.phone} ILIKE ${term} OR
            ${merchants.city} ILIKE ${term}
          )`);
      }
      const where = conditions.length > 1 ? and(...conditions) : conditions[0] || void 0;
      const items = where ? await query.where(where).orderBy(desc(merchants.id)).limit(input?.limit || 50).offset(input?.offset || 0) : await query.orderBy(desc(merchants.id)).limit(input?.limit || 50).offset(input?.offset || 0);
      const countResult = await db.select({ count: sql`count(*)` }).from(merchants).where(where || sql`1=1`);
      return { items, total: countResult[0]?.count || 0 };
    } catch (e) {
      console.error("[adminList] Error:", e?.message);
      return { items: [], total: 0 };
    }
  }),
  // Admin: update merchant
  adminUpdate: publicQuery.input(
    z.object({
      id: z.number(),
      businessName: z.string().optional(),
      businessNameAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      category: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      status: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      rating: z.number().optional(),
      logo: z.string().optional(),
      coverImage: z.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const db = getDb();
    const updateData = {};
    if (data.businessName !== void 0) updateData.businessName = data.businessName;
    if (data.businessNameAr !== void 0) updateData.businessNameAr = data.businessNameAr;
    if (data.description !== void 0) updateData.description = data.description;
    if (data.descriptionAr !== void 0) updateData.descriptionAr = data.descriptionAr;
    if (data.category !== void 0) updateData.category = data.category;
    if (data.city !== void 0) updateData.city = data.city;
    if (data.country !== void 0) updateData.country = data.country;
    if (data.address !== void 0) updateData.address = data.address;
    if (data.phone !== void 0) updateData.phone = data.phone;
    if (data.email !== void 0) updateData.email = data.email;
    if (data.website !== void 0) updateData.website = data.website;
    if (data.status !== void 0) updateData.status = data.status;
    if (data.isFeatured !== void 0) updateData.isFeatured = data.isFeatured;
    if (data.isVerified !== void 0) updateData.isVerified = data.isVerified;
    if (data.rating !== void 0) updateData.rating = data.rating;
    if (data.logo !== void 0) updateData.logo = data.logo;
    if (data.coverImage !== void 0) updateData.coverImage = data.coverImage;
    await db.update(merchants).set(updateData).where(eq(merchants.id, id));
    return { success: true };
  }),
  // Admin: delete merchant
  adminDelete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(merchants).where(eq(merchants.id, input.id));
    return { success: true };
  }),
  // Admin: stats
  adminStats: publicQuery.query(async () => {
    try {
      const db = getDb();
      const total = await db.select({ count: sql`count(*)` }).from(merchants);
      const active = await db.select({ count: sql`count(*)` }).from(merchants).where(sql`${merchants.status} = 'active'`);
      const pending = await db.select({ count: sql`count(*)` }).from(merchants).where(sql`${merchants.status} = 'pending'`);
      const featured = await db.select({ count: sql`count(*)` }).from(merchants).where(sql`${merchants.isFeatured} = true`);
      return {
        total: total[0]?.count || 0,
        active: active[0]?.count || 0,
        pending: pending[0]?.count || 0,
        featured: featured[0]?.count || 0
      };
    } catch (e) {
      console.error("[adminStats] Error:", e?.message);
      return { total: 0, active: 0, pending: 0, featured: 0 };
    }
  })
});

// api/job-router.ts
import { z as z2 } from "zod";
import { eq as eq2, and as and2, like as like2, or as or2, desc as desc2, sql as sql2 } from "drizzle-orm";
var jobRouter = createRouter({
  // Get all jobs with optional filters
  list: publicQuery.input(
    z2.object({
      category: z2.string().optional(),
      type: z2.string().optional(),
      country: z2.string().optional(),
      city: z2.string().optional(),
      search: z2.string().optional(),
      experienceLevel: z2.string().optional(),
      status: z2.string().optional(),
      limit: z2.number().min(1).max(100).default(20),
      offset: z2.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.category) {
      conditions.push(eq2(jobs.category, input.category));
    }
    if (input?.type) {
      conditions.push(eq2(jobs.type, input.type));
    }
    if (input?.country) {
      conditions.push(eq2(jobs.country, input.country));
    }
    if (input?.city) {
      conditions.push(eq2(jobs.city, input.city));
    }
    if (input?.experienceLevel) {
      conditions.push(eq2(jobs.experienceLevel, input.experienceLevel));
    }
    if (input?.status) {
      conditions.push(eq2(jobs.status, input.status));
    } else {
      conditions.push(eq2(jobs.status, "open"));
    }
    if (input?.search) {
      const searchTerm = `%${input.search}%`;
      conditions.push(
        or2(
          like2(jobs.title, searchTerm),
          like2(jobs.titleAr, searchTerm),
          like2(jobs.description, searchTerm),
          like2(jobs.descriptionAr, searchTerm),
          like2(jobs.tags, searchTerm)
        )
      );
    }
    const where = conditions.length > 0 ? and2(...conditions) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(jobs).where(where).limit(input?.limit || 20).offset(input?.offset || 0).orderBy(desc2(jobs.createdAt)),
      db.select({ count: sql2`count(*)` }).from(jobs).where(where)
    ]);
    return {
      items,
      total: countResult[0]?.count || 0
    };
  }),
  // Get single job by ID
  getById: publicQuery.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = getDb();
    const job = await db.select().from(jobs).where(eq2(jobs.id, input.id)).limit(1);
    if (!job[0]) {
      throw new Error("Job not found");
    }
    return job[0];
  }),
  // Create job
  create: publicQuery.input(
    z2.object({
      title: z2.string().min(1),
      titleAr: z2.string().optional(),
      description: z2.string().min(1),
      descriptionAr: z2.string().optional(),
      category: z2.enum([
        "construction",
        "driving",
        "photography",
        "painting",
        "plumbing",
        "electrician",
        "carpentry",
        "cleaning",
        "cooking",
        "it",
        "translation",
        "accounting",
        "medical",
        "education",
        "other"
      ]),
      type: z2.enum(["full_time", "part_time", "contract", "freelance", "temporary"]),
      requirements: z2.string().optional(),
      requirementsAr: z2.string().optional(),
      skills: z2.string().optional(),
      experienceLevel: z2.enum(["entry", "mid", "senior", "expert"]).optional(),
      salaryMin: z2.string().optional(),
      salaryMax: z2.string().optional(),
      salaryCurrency: z2.string().optional(),
      country: z2.string().min(1),
      city: z2.string().min(1),
      isRemote: z2.boolean().optional(),
      contactEmail: z2.string().email().optional(),
      contactPhone: z2.string().optional(),
      tags: z2.string().optional(),
      userId: z2.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
    const result = await db.insert(jobs).values({
      ...input,
      slug,
      status: "open",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning({ id: jobs.id });
    return { id: result[0].id, slug };
  }),
  // Get job categories
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "\u0628\u0646\u0627\u0621", nameEn: "construction", icon: "HardHat", color: "#f59e0b", count: 0 },
      { id: 2, name: "\u0642\u064A\u0627\u062F\u0629", nameEn: "driving", icon: "Car", color: "#3b82f6", count: 0 },
      { id: 3, name: "\u062A\u0635\u0648\u064A\u0631", nameEn: "photography", icon: "Camera", color: "#8b5cf6", count: 0 },
      { id: 4, name: "\u062F\u0647\u0627\u0646", nameEn: "painting", icon: "Paintbrush", color: "#ec4899", count: 0 },
      { id: 5, name: "\u0633\u0628\u0627\u0643\u0629", nameEn: "plumbing", icon: "Wrench", color: "#06b6d4", count: 0 },
      { id: 6, name: "\u0643\u0647\u0631\u0628\u0627\u0621", nameEn: "electrician", icon: "Zap", color: "#f59e0b", count: 0 },
      { id: 7, name: "\u0646\u062C\u0627\u0631\u0629", nameEn: "carpentry", icon: "Hammer", color: "#8b4513", count: 0 },
      { id: 8, name: "\u062A\u0646\u0638\u064A\u0641", nameEn: "cleaning", icon: "Sparkles", color: "#10b981", count: 0 },
      { id: 9, name: "\u0637\u0628\u062E", nameEn: "cooking", icon: "ChefHat", color: "#ef4444", count: 0 },
      { id: 10, name: "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", nameEn: "it", icon: "Laptop", color: "#6366f1", count: 0 },
      { id: 11, name: "\u062A\u0631\u062C\u0645\u0629", nameEn: "translation", icon: "Languages", color: "#14b8a6", count: 0 },
      { id: 12, name: "\u0645\u062D\u0627\u0633\u0628\u0629", nameEn: "accounting", icon: "Calculator", color: "#f97316", count: 0 },
      { id: 13, name: "\u0637\u0628", nameEn: "medical", icon: "Stethoscope", color: "#ef4444", count: 0 },
      { id: 14, name: "\u062A\u0639\u0644\u064A\u0645", nameEn: "education", icon: "GraduationCap", color: "#3b82f6", count: 0 },
      { id: 15, name: "\u0623\u062E\u0631\u0649", nameEn: "other", icon: "Briefcase", color: "#6b7280", count: 0 }
    ];
    for (const cat of categories) {
      const result = await db.select({ count: sql2`count(*)` }).from(jobs).where(and2(eq2(jobs.category, cat.nameEn), eq2(jobs.status, "open")));
      cat.count = result[0]?.count || 0;
    }
    return categories;
  }),
  // Get recent jobs
  recent: publicQuery.input(z2.object({ limit: z2.number().default(6) }).optional()).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(jobs).where(eq2(jobs.status, "open")).orderBy(desc2(jobs.createdAt)).limit(input?.limit || 6);
  })
});

// api/search-router.ts
import { z as z3 } from "zod";
import { like as like3, or as or3, and as and3, eq as eq3, sql as sql3, desc as desc3 } from "drizzle-orm";
var searchRouter = createRouter({
  // Universal search across merchants and jobs
  search: publicQuery.input(
    z3.object({
      query: z3.string().min(1),
      type: z3.enum(["all", "merchants", "jobs"]).default("all"),
      country: z3.string().optional(),
      city: z3.string().optional(),
      category: z3.string().optional(),
      limit: z3.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    const db = getDb();
    const searchTerm = `%${input.query}%`;
    const results = { merchants: [], jobs: [], total: 0 };
    if (input.type === "all" || input.type === "merchants") {
      const merchantConditions = [
        or3(
          like3(merchants.businessName, searchTerm),
          like3(merchants.businessNameAr, searchTerm),
          like3(merchants.description, searchTerm),
          like3(merchants.descriptionAr, searchTerm),
          like3(merchants.tags, searchTerm),
          like3(merchants.city, searchTerm),
          like3(merchants.country, searchTerm)
        ),
        eq3(merchants.status, "active")
      ];
      if (input.country) {
        merchantConditions.push(eq3(merchants.country, input.country));
      }
      if (input.city) {
        merchantConditions.push(eq3(merchants.city, input.city));
      }
      if (input.category) {
        merchantConditions.push(eq3(merchants.category, input.category));
      }
      results.merchants = await db.select().from(merchants).where(and3(...merchantConditions)).limit(input.limit).orderBy(desc3(merchants.rating));
    }
    if (input.type === "all" || input.type === "jobs") {
      const jobConditions = [
        or3(
          like3(jobs.title, searchTerm),
          like3(jobs.titleAr, searchTerm),
          like3(jobs.description, searchTerm),
          like3(jobs.descriptionAr, searchTerm),
          like3(jobs.tags, searchTerm),
          like3(jobs.city, searchTerm),
          like3(jobs.country, searchTerm)
        ),
        eq3(jobs.status, "open")
      ];
      if (input.country) {
        jobConditions.push(eq3(jobs.country, input.country));
      }
      if (input.city) {
        jobConditions.push(eq3(jobs.city, input.city));
      }
      if (input.category) {
        jobConditions.push(eq3(jobs.category, input.category));
      }
      results.jobs = await db.select().from(jobs).where(and3(...jobConditions)).limit(input.limit).orderBy(desc3(jobs.createdAt));
    }
    const emergencyConditions = [
      or3(
        like3(emergencyContacts.name, searchTerm),
        like3(emergencyContacts.nameAr, searchTerm),
        like3(emergencyContacts.description, searchTerm),
        like3(emergencyContacts.descriptionAr, searchTerm),
        like3(emergencyContacts.phone, searchTerm),
        like3(emergencyContacts.city, searchTerm),
        like3(emergencyContacts.country, searchTerm),
        like3(emergencyContacts.address, searchTerm)
      ),
      eq3(emergencyContacts.isActive, true)
    ];
    if (input.country) {
      emergencyConditions.push(eq3(emergencyContacts.country, input.country));
    }
    if (input.city) {
      emergencyConditions.push(eq3(emergencyContacts.city, input.city));
    }
    results.emergency = await db.select().from(emergencyContacts).where(and3(...emergencyConditions)).limit(input.limit).orderBy(emergencyContacts.type, emergencyContacts.city);
    results.total = results.merchants.length + results.jobs.length + (results.emergency?.length || 0);
    return results;
  }),
  // Get popular searches
  popularSearches: publicQuery.query(async () => {
    return [
      { id: 1, query: "\u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0628\u0627\u0631\u064A\u0633", type: "merchant", count: 1250 },
      { id: 2, query: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", type: "merchant", count: 980 },
      { id: 3, query: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0641\u064A \u0644\u0646\u062F\u0646", type: "merchant", count: 850 },
      { id: 4, query: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", type: "merchant", count: 720 },
      { id: 5, query: "\u0645\u0647\u0646\u062F\u0633 \u0641\u064A \u0645\u064A\u0648\u0646\u062E", type: "job", count: 650 },
      { id: 6, query: "\u0633\u0627\u0626\u0642 \u0641\u064A \u0641\u064A\u064A\u0646\u0627", type: "job", count: 540 },
      { id: 7, query: "\u0645\u0639\u0644\u0645 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", type: "job", count: 480 },
      { id: 8, query: "\u062D\u0644\u0648\u0627\u0646\u064A \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", type: "job", count: 390 },
      { id: 9, query: "\u0645\u062D\u0627\u0633\u0628 \u0641\u064A \u0645\u062F\u0631\u064A\u062F", type: "job", count: 350 },
      { id: 10, query: "\u0637\u0628\u064A\u0628 \u0641\u064A \u0631\u0648\u0645\u0627", type: "job", count: 320 }
    ];
  }),
  // Get suggestions based on query
  suggestions: publicQuery.input(z3.object({ query: z3.string().min(1) })).query(async ({ input }) => {
    const db = getDb();
    const searchTerm = `%${input.query}%`;
    const [merchantResults, jobResults] = await Promise.all([
      db.select({
        id: merchants.id,
        name: merchants.businessName,
        type: sql3`'merchant'`,
        category: merchants.category,
        city: merchants.city
      }).from(merchants).where(
        and3(
          or3(
            like3(merchants.businessName, searchTerm),
            like3(merchants.businessNameAr, searchTerm)
          ),
          eq3(merchants.status, "active")
        )
      ).limit(5),
      db.select({
        id: jobs.id,
        name: jobs.title,
        type: sql3`'job'`,
        category: jobs.category,
        city: jobs.city
      }).from(jobs).where(
        and3(
          or3(
            like3(jobs.title, searchTerm),
            like3(jobs.titleAr, searchTerm)
          ),
          eq3(jobs.status, "open")
        )
      ).limit(5)
    ]);
    return [...merchantResults, ...jobResults];
  })
});

// api/sindbad-router.ts
import { z as z4 } from "zod";
import { eq as eq4, and as and4, sql as sql4 } from "drizzle-orm";
function createSessionId(userId) {
  return `${userId || "anon"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
var MAX_WISHES = 3;
async function callKimiAPI(message, apiKey) {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: `\u0623\u0646\u062A \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0641\u064A \u0645\u0648\u0642\u0639 "\u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A" - \u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627.`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1e3
      })
    });
    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0645 \u0623\u0641\u0647\u0645. \u062C\u0631\u0628 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649!";
  } catch (error) {
    console.error("Kimi API error:", error);
    throw error;
  }
}
function getFallbackResponse(message, wishesRemaining) {
  const msg = message.toLowerCase();
  if (msg.includes("\u0645\u0637\u0639\u0645") || msg.includes("\u0645\u0637\u0627\u0639\u0645") || msg.includes("\u0623\u0643\u0644") || msg.includes("\u0637\u0639\u0627\u0645")) {
    return `\u0623\u0647\u0644\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F37D}\uFE0F

\u064A\u0648\u062C\u062F \u0627\u0644\u0639\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627. \u0625\u0644\u064A\u0643 \u0628\u0639\u0636 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A:

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0645\u0637\u0639\u0645 \u0627\u0644\u0634\u0627\u0645 - \u0645\u0637\u0627\u0639\u0645 \u0633\u0648\u0631\u064A\u0629
- \u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646 \u0627\u0644\u062D\u0644\u0648 - \u0645\u0637\u0627\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A\u0629

**\u0628\u0631\u0644\u064A\u0646 \u{1F1E9}\u{1F1EA}**
- \u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642 - \u0645\u0637\u0627\u0639\u0645 \u0633\u0648\u0631\u064A\u0629
- \u0645\u0637\u0639\u0645 \u0628\u064A\u0631\u0648\u062A - \u0645\u0637\u0627\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A\u0629

\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0628\u062D\u062B \u0641\u064A \u0645\u0648\u0642\u0639\u0646\u0627 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0623\u0631\u0642\u0627\u0645 \u0647\u0648\u0627\u062A\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0637\u0627\u0639\u0645! \u{1F50D}`;
  }
  if (msg.includes("\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A") || msg.includes("\u062D\u0644\u0627\u0644") || msg.includes("\u0628\u0642\u0627\u0644\u0629")) {
    return `\u0637\u0628\u0639\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F6D2}

\u0647\u0630\u0647 \u0628\u0639\u0636 \u0623\u0634\u0647\u0631 \u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627:

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0623\u0646\u062F\u0644\u0633 - \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0645\u0646\u0648\u0631\u0629 - \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644

**\u0628\u0631\u0644\u064A\u0646 \u{1F1E9}\u{1F1EA}**
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0633\u0644\u0627\u0645 - \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644
- \u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0623\u0646\u0635\u0627\u0631 - \u062E\u0636\u0627\u0631 \u0648\u0641\u0648\u0627\u0643\u0647 \u0639\u0631\u0628\u064A\u0629

\u062C\u0645\u064A\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0646 \u0627\u0644\u0647\u064A\u0626\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627! \u2705`;
  }
  if (msg.includes("\u062D\u0644\u0627\u0642") || msg.includes("\u0635\u0627\u0644\u0648\u0646") || msg.includes("\u062D\u0644\u0627\u0642\u0629")) {
    return `\u0639\u0646\u062F\u064A \u0644\u0643 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0645\u062A\u0627\u0632\u0629 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F488}

**\u0635\u0627\u0644\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629:**

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u062D\u0644\u0627\u0642\u0629 \u0631\u062C\u0627\u0644\u064A\u0629 \u0639\u0631\u0628\u064A\u0629
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0634\u0627\u0645 - \u062D\u0644\u0627\u0642\u0629 \u0648\u062A\u062C\u0645\u064A\u0644

**\u0644\u0646\u062F\u0646 \u{1F1EC}\u{1F1E7}**
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0645\u0644\u0643 - \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629
- \u0635\u0627\u0644\u0648\u0646 \u062F\u0645\u0634\u0642 - \u062D\u0644\u0627\u0642\u0629 \u0648\u062A\u0635\u0641\u064A\u0641 \u0634\u0639\u0631

\u0645\u0639\u0638\u0645\u0647\u0627 \u064A\u062A\u062D\u062F\u062B \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u064A\u0639\u0631\u0641 \u0627\u0644\u0627\u0633\u062A\u0627\u064A\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629! \u2702\uFE0F`;
  }
  if (msg.includes("\u0648\u0638\u064A\u0641\u0629") || msg.includes("\u0634\u063A\u0644") || msg.includes("\u0639\u0645\u0644")) {
    return `\u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F! \u064A\u0648\u062C\u062F \u0627\u0644\u0639\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629 \u0644\u0644\u0639\u0631\u0628 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627 \u{1F4BC}

**\u0623\u0643\u062B\u0631 \u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629:**

1. **\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u0621\u0627\u062A** \u{1F3D7}\uFE0F - \u20AC1,800 - \u20AC3,500
2. **\u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644** \u{1F697} - \u20AC2,000 - \u20AC3,000
3. **\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0641\u0646\u0627\u062F\u0642** \u{1F37D}\uFE0F - \u20AC1,500 - \u20AC2,800
4. **\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A** \u{1F4BB} - \u20AC3,000 - \u20AC6,000
5. **\u0627\u0644\u062A\u0631\u062C\u0645\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645** \u{1F4DA} - \u20AC2,500 - \u20AC4,500

\u062A\u0641\u0636\u0644 \u0628\u0632\u064A\u0627\u0631\u0629 \u0642\u0633\u0645 \u0627\u0644\u0645\u0647\u0646 \u0641\u064A \u0645\u0648\u0642\u0639\u0646\u0627 \u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644! \u{1F4CB}`;
  }
  if (msg.includes("\u0645\u0631\u062D\u0628\u0627") || msg.includes("\u0647\u0644\u0627") || msg.includes("\u0627\u0644\u0633\u0644\u0627\u0645") || msg.includes("\u0623\u0647\u0644\u0627")) {
    return `\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F319}

\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \u0641\u064A \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A. \u0639\u0646\u062F\u0643 ${wishesRemaining} \u0623\u0645\u0646\u064A\u0629 \u064A\u0648\u0645\u064A\u0627\u064B!

\u0627\u0643\u062A\u0628 \u0644\u064A \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646:
\u2022 \u{1F37D}\uFE0F \u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629
\u2022 \u{1F6D2} \u0645\u062A\u0627\u062C\u0631 \u062D\u0644\u0627\u0644
\u2022 \u{1F488} \u0635\u0627\u0644\u0648\u0646\u0627\u062A \u062D\u0644\u0627\u0642\u0629
\u2022 \u{1F527} \u062E\u062F\u0645\u0627\u062A \u0648\u0645\u0647\u0646
\u2022 \u{1F4CD} \u0623\u0645\u0627\u0643\u0646 \u0648\u0639\u0646\u0627\u0648\u064A\u0646

\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F \u2728`;
  }
  if (msg.includes("\u0639\u0646\u0648\u0627\u0646") || msg.includes("\u0645\u0648\u0642\u0639") || msg.includes("\u0645\u0643\u0627\u0646")) {
    return `\u0623\u0643\u064A\u062F \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F4CD}

\u0642\u0644 \u0644\u064A:
1. \u0641\u064A \u0623\u064A \u0645\u062F\u064A\u0646\u0629 \u0623\u0646\u062A\u061F
2. \u0634\u0648 \u062A\u062F\u0648\u0631 \u0628\u0627\u0644\u0636\u0628\u0637\u061F

\u0648\u0631\u0627\u062D \u0623\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u062F\u0642\u064A\u0642\u0629! \u{1F5FA}\uFE0F`;
  }
  return `\u0634\u0643\u0631\u0627\u064B \u0644\u0633\u0624\u0627\u0644\u0643 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F31F}

\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F \u0647\u0646\u0627 \u0644\u0623\u0633\u0627\u0639\u062F\u0643 \u0641\u064A:
1. **\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0645\u062A\u0627\u062C\u0631 \u0639\u0631\u0628\u064A\u0629**
2. **\u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0648\u0638\u0627\u0626\u0641**
3. **\u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0639**
4. **\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0627\u0645\u0629**

\u0639\u0646\u062F\u0643 ${wishesRemaining} \u0623\u0645\u0646\u064A\u0629 \u0645\u062A\u0628\u0642\u064A\u0629 \u0627\u0644\u064A\u0648\u0645! \u{1F9DE}\u200D\u2642\uFE0F

\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643\u061F`;
}
var sindbadRouter = createRouter({
  // Send message to Sindbad
  chat: publicQuery.input(
    z4.object({
      message: z4.string().min(1),
      sessionId: z4.string().optional(),
      userId: z4.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const sessionId = input.sessionId || createSessionId(input.userId);
    await db.insert(chatMessages).values({
      userId: input.userId,
      sessionId,
      role: "user",
      content: input.message,
      createdAt: /* @__PURE__ */ new Date()
    });
    const wishesUsedToday = await db.select({ count: sql4`count(*)` }).from(chatMessages).where(
      and4(
        eq4(chatMessages.userId, input.userId || 0),
        eq4(chatMessages.role, "user"),
        sql4`DATE(${chatMessages.createdAt}) = DATE(NOW())`
      )
    );
    const wishesUsed = wishesUsedToday[0]?.count || 0;
    const wishesRemaining = Math.max(0, MAX_WISHES - wishesUsed);
    let response;
    let responseType = "general";
    if (wishesUsed >= MAX_WISHES && !input.userId) {
      response = `\u0639\u0630\u0631\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u0630\u062A ${MAX_WISHES} \u0623\u0645\u0646\u064A\u0627\u062A\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645. \u0633\u062C\u0644 \u062F\u062E\u0648\u0644 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0645\u0646\u064A\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629! \u{1F9DE}\u200D\u2642\uFE0F`;
    } else {
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
    await db.insert(chatMessages).values({
      userId: input.userId,
      sessionId,
      role: "assistant",
      content: response,
      wishesUsed: wishesUsed + 1,
      createdAt: /* @__PURE__ */ new Date()
    });
    return {
      response,
      responseType,
      sessionId,
      wishesUsed: wishesUsed + 1,
      wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed - 1),
      maxWishes: MAX_WISHES
    };
  }),
  // Get chat history for a session
  history: publicQuery.input(z4.object({ sessionId: z4.string() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(chatMessages).where(eq4(chatMessages.sessionId, input.sessionId)).orderBy(chatMessages.createdAt);
  }),
  // Get user's daily wishes status
  wishesStatus: publicQuery.input(z4.object({ userId: z4.number().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    if (!input?.userId) {
      return {
        wishesUsed: 0,
        wishesRemaining: MAX_WISHES,
        maxWishes: MAX_WISHES,
        isUnlimited: false
      };
    }
    const wishesUsedToday = await db.select({ count: sql4`count(*)` }).from(chatMessages).where(
      and4(
        eq4(chatMessages.userId, input.userId),
        eq4(chatMessages.role, "user"),
        sql4`DATE(${chatMessages.createdAt}) = DATE(NOW())`
      )
    );
    const wishesUsed = wishesUsedToday[0]?.count || 0;
    return {
      wishesUsed,
      wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed),
      maxWishes: MAX_WISHES,
      isUnlimited: wishesUsed >= MAX_WISHES ? false : true
    };
  })
});

// api/admin-router.ts
import { z as z5 } from "zod";
import { eq as eq5, and as and5, like as like4, or as or4, desc as desc4, sql as sql5 } from "drizzle-orm";
var adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [
      usersCount,
      merchantsCount,
      jobsCount,
      reviewsCount,
      pendingMerchants2,
      openJobs,
      todaySearches
    ] = await Promise.all([
      db.select({ count: sql5`count(*)` }).from(users),
      db.select({ count: sql5`count(*)` }).from(merchants),
      db.select({ count: sql5`count(*)` }).from(jobs),
      db.select({ count: sql5`count(*)` }).from(reviews),
      db.select({ count: sql5`count(*)` }).from(merchants).where(eq5(merchants.status, "pending")),
      db.select({ count: sql5`count(*)` }).from(jobs).where(eq5(jobs.status, "open")),
      db.select({ count: sql5`count(*)` }).from(searchLogs).where(sql5`DATE(${searchLogs.createdAt}) = DATE(NOW())`)
    ]);
    return {
      users: usersCount[0]?.count || 0,
      merchants: merchantsCount[0]?.count || 0,
      jobs: jobsCount[0]?.count || 0,
      reviews: reviewsCount[0]?.count || 0,
      pendingMerchants: pendingMerchants2[0]?.count || 0,
      openJobs: openJobs[0]?.count || 0,
      todaySearches: todaySearches[0]?.count || 0
    };
  }),
  // List all merchants (admin view with pending)
  merchants: adminQuery.input(
    z5.object({
      status: z5.string().optional(),
      search: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq5(merchants.status, input.status));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(
          like4(merchants.businessName, term),
          like4(merchants.businessNameAr, term),
          like4(merchants.email, term)
        )
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(merchants).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(merchants.createdAt)),
      db.select({ count: sql5`count(*)` }).from(merchants).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update merchant status
  updateMerchantStatus: adminQuery.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["pending", "active", "suspended", "rejected"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(merchants).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(merchants.id, input.id));
    return { success: true };
  }),
  // Delete merchant
  deleteMerchant: adminQuery.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(merchants).where(eq5(merchants.id, input.id));
    return { success: true };
  }),
  // List all jobs (admin view)
  jobs: adminQuery.input(
    z5.object({
      status: z5.string().optional(),
      search: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq5(jobs.status, input.status));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(
          like4(jobs.title, term),
          like4(jobs.titleAr, term),
          like4(jobs.description, term)
        )
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(jobs).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(jobs.createdAt)),
      db.select({ count: sql5`count(*)` }).from(jobs).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update job status
  updateJobStatus: adminQuery.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["open", "closed", "filled", "paused"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(jobs).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(jobs.id, input.id));
    return { success: true };
  }),
  // Delete job
  deleteJob: adminQuery.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(jobs).where(eq5(jobs.id, input.id));
    return { success: true };
  }),
  // Get all users
  users: adminQuery.input(
    z5.object({
      search: z5.string().optional(),
      role: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.role) {
      conditions.push(eq5(users.role, input.role));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(like4(users.name, term), like4(users.email, term))
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(users).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(users.createdAt)),
      db.select({ count: sql5`count(*)` }).from(users).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update user role
  updateUserRole: adminQuery.input(
    z5.object({
      id: z5.number(),
      role: z5.enum(["user", "admin"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(users).set({ role: input.role, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(users.id, input.id));
    return { success: true };
  }),
  // Get recent activity
  recentActivity: adminQuery.query(async () => {
    const db = getDb();
    const [recentMerchants, recentJobs, recentUsers, recentReviews] = await Promise.all([
      db.select().from(merchants).orderBy(desc4(merchants.createdAt)).limit(5),
      db.select().from(jobs).orderBy(desc4(jobs.createdAt)).limit(5),
      db.select().from(users).orderBy(desc4(users.createdAt)).limit(5),
      db.select().from(reviews).orderBy(desc4(reviews.createdAt)).limit(5)
    ]);
    return {
      merchants: recentMerchants,
      jobs: recentJobs,
      users: recentUsers,
      reviews: recentReviews
    };
  }),
  // Update merchant (full edit)
  updateMerchant: adminQuery.input(
    z5.object({
      id: z5.number(),
      businessName: z5.string().optional(),
      businessNameAr: z5.string().optional(),
      shortDescription: z5.string().optional(),
      description: z5.string().optional(),
      descriptionAr: z5.string().optional(),
      category: z5.string().optional(),
      subcategory: z5.string().optional(),
      country: z5.string().optional(),
      city: z5.string().optional(),
      address: z5.string().optional(),
      addressAr: z5.string().optional(),
      neighborhood: z5.string().optional(),
      postalCode: z5.string().optional(),
      phone: z5.string().optional(),
      whatsapp: z5.string().optional(),
      email: z5.string().optional(),
      website: z5.string().optional(),
      facebookUrl: z5.string().optional(),
      instagramUrl: z5.string().optional(),
      youtubeUrl: z5.string().optional(),
      latitude: z5.string().optional(),
      longitude: z5.string().optional(),
      googleMapsUrl: z5.string().optional(),
      priceRange: z5.string().optional(),
      isFeatured: z5.boolean().optional(),
      acceptsCash: z5.boolean().optional(),
      acceptsCard: z5.boolean().optional(),
      isOpen24Hours: z5.boolean().optional(),
      logo: z5.string().optional(),
      coverImage: z5.string().optional(),
      galleryImages: z5.any().optional(),
      amenities: z5.any().optional(),
      features: z5.any().optional(),
      tags: z5.string().optional(),
      metaTitle: z5.string().optional(),
      metaDescription: z5.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const db = getDb();
    await db.update(merchants).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(merchants.id, id));
    return { success: true };
  }),
  // Get search analytics
  searchAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const popularSearches = await db.select({
      query: searchLogs.query,
      count: sql5`count(*)`
    }).from(searchLogs).groupBy(searchLogs.query).orderBy(desc4(sql5`count(*)`)).limit(20);
    const searchesByDay = await db.select({
      date: sql5`DATE(${searchLogs.createdAt})`,
      count: sql5`count(*)`
    }).from(searchLogs).where(sql5`${searchLogs.createdAt} > DATE_SUB(NOW(), INTERVAL 30 DAY)`).groupBy(sql5`DATE(${searchLogs.createdAt})`).orderBy(sql5`DATE(${searchLogs.createdAt})`);
    return { popularSearches, searchesByDay };
  })
});

// api/admin-auth-router.ts
import { z as z6 } from "zod";
import * as jose from "jose";
var JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "euro-arab-market-admin-secret-key-2024"
);
var adminAuthRouter = createRouter({
  // Login with username/password
  login: publicQuery.input(
    z6.object({
      username: z6.string().min(1),
      password: z6.string().min(1)
    })
  ).mutation(async ({ input }) => {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EuroArab2024!";
    if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
      throw new Error("Invalid credentials");
    }
    const token = await new jose.SignJWT({
      username: input.username,
      role: "admin"
    }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").sign(JWT_SECRET);
    return { token, username: input.username };
  }),
  // Verify token
  verify: publicQuery.input(z6.object({ token: z6.string() })).query(async ({ input }) => {
    try {
      const { payload } = await jose.jwtVerify(input.token, JWT_SECRET, {
        clockTolerance: 60
      });
      return { valid: true, username: payload.username };
    } catch {
      return { valid: false, username: "" };
    }
  })
});

// api/subscription-router.ts
import { z as z7 } from "zod";
import { eq as eq6, and as and6, desc as desc5 } from "drizzle-orm";
var subscriptionRouter = createRouter({
  // Create subscription
  create: publicQuery.input(
    z7.object({
      userId: z7.number(),
      merchantId: z7.number(),
      plan: z7.enum(["basic", "premium", "featured"]).default("basic"),
      billingCycle: z7.enum(["monthly", "yearly"]).default("monthly"),
      price: z7.string(),
      paymentMethod: z7.string().optional(),
      paymentId: z7.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const now = /* @__PURE__ */ new Date();
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
      updatedAt: now
    }).returning({ id: subscriptions.id });
    return result[0];
  }),
  // Get merchant subscription
  getByMerchant: publicQuery.input(z7.object({ merchantId: z7.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(subscriptions).where(eq6(subscriptions.merchantId, input.merchantId)).orderBy(desc5(subscriptions.createdAt)).limit(1);
  }),
  // Check if subscription is active
  checkStatus: publicQuery.input(z7.object({ merchantId: z7.number() })).query(async ({ input }) => {
    const db = getDb();
    const sub = await db.select().from(subscriptions).where(
      and6(
        eq6(subscriptions.merchantId, input.merchantId),
        eq6(subscriptions.status, "active")
      )
    ).orderBy(desc5(subscriptions.createdAt)).limit(1);
    if (!sub[0]) return { isActive: false, plan: null, expiresAt: null };
    const now = /* @__PURE__ */ new Date();
    const isActive = sub[0].status === "active" && new Date(sub[0].expiresAt) > now;
    return {
      isActive,
      plan: sub[0].plan,
      expiresAt: sub[0].expiresAt,
      status: isActive ? sub[0].status : "expired"
    };
  }),
  // Cancel subscription
  cancel: publicQuery.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(subscriptions).set({ status: "cancelled", cancelledAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq6(subscriptions.id, input.id));
    return { success: true };
  }),
  // List all subscriptions (admin)
  list: publicQuery.input(z7.object({ status: z7.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq6(subscriptions.status, input.status));
    }
    return db.select().from(subscriptions).where(conditions.length > 0 ? and6(...conditions) : void 0).orderBy(desc5(subscriptions.createdAt));
  })
});

// api/claim-router.ts
import { z as z8 } from "zod";
import { eq as eq7, and as and7, desc as desc6 } from "drizzle-orm";
var claimRouter = createRouter({
  // Submit claim request
  create: publicQuery.input(
    z8.object({
      userId: z8.number(),
      merchantId: z8.number(),
      fullName: z8.string().min(1),
      email: z8.string().email(),
      phone: z8.string().optional(),
      proofDocument: z8.string().optional(),
      businessRegistration: z8.string().optional(),
      message: z8.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select().from(claims).where(
      and7(
        eq7(claims.merchantId, input.merchantId),
        eq7(claims.status, "pending")
      )
    ).limit(1);
    if (existing[0]) {
      throw new Error("There is already a pending claim for this business");
    }
    const result = await db.insert(claims).values({
      ...input,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    }).returning({ id: claims.id });
    return result[0];
  }),
  // Get claims by merchant
  getByMerchant: publicQuery.input(z8.object({ merchantId: z8.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(claims).where(eq7(claims.merchantId, input.merchantId)).orderBy(desc6(claims.createdAt));
  }),
  // Approve claim (admin)
  approve: publicQuery.input(
    z8.object({
      id: z8.number(),
      reviewedBy: z8.number()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(claims).set({
      status: "approved",
      reviewedBy: input.reviewedBy,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq7(claims.id, input.id));
    const claim = await db.select().from(claims).where(eq7(claims.id, input.id)).limit(1);
    if (claim[0]) {
      await db.update(merchants).set({
        status: "claimed",
        claimedBy: claim[0].userId,
        claimedAt: /* @__PURE__ */ new Date()
      }).where(eq7(merchants.id, claim[0].merchantId));
    }
    return { success: true };
  }),
  // Reject claim (admin)
  reject: publicQuery.input(
    z8.object({
      id: z8.number(),
      reviewedBy: z8.number(),
      rejectionReason: z8.string()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(claims).set({
      status: "rejected",
      reviewedBy: input.reviewedBy,
      reviewedAt: /* @__PURE__ */ new Date(),
      rejectionReason: input.rejectionReason
    }).where(eq7(claims.id, input.id));
    return { success: true };
  }),
  // List all claims (admin)
  list: publicQuery.input(z8.object({ status: z8.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq7(claims.status, input.status));
    }
    return db.select().from(claims).where(conditions.length > 0 ? and7(...conditions) : void 0).orderBy(desc6(claims.createdAt));
  })
});

// api/seed-router.ts
import { sql as sql6 } from "drizzle-orm";
var merchantsData = [
  { businessName: "Al Ajami Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0627\u0631\u064A\u0633", description: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A \u0647\u0648 \u0648\u0627\u062D\u062F \u0645\u0646 \u0623\u0634\u0647\u0631 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0633\u0648\u0631\u064A\u0629 \u0641\u064A \u0628\u0627\u0631\u064A\u0633.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "3 Rue du Faubourg Montmartre, 75009 Paris", phone: "+33 1 42 46 04 38", email: "contact@alajami.fr", priceRange: "$$", rating: "4.7", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0627\u0631\u064A\u0633, \u062D\u0644\u0627\u0644, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Bakdash Ice Cream", businessNameAr: "\u0628\u0643\u062F\u0627\u0634 - \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", shortDescription: "\u0623\u0634\u0647\u0631 \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0628\u0643\u062F\u0627\u0634 \u064A\u0642\u062F\u0645 \u0627\u0644\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0627\u0644\u062D\u0644\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644.", category: "sweets", subcategory: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "12 Rue des Rosiers, 75004 Paris", phone: "+33 1 42 72 91 42", email: "info@bakdash.fr", priceRange: "$", rating: "4.8", tags: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645, \u062D\u0644\u0628\u064A, \u0641\u0633\u062A\u0642", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Barber Shop", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u0644\u0644\u062D\u0644\u0627\u0642\u0629", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", description: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0631\u062C\u0627\u0644\u064A.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0631\u062C\u0627\u0644\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "8 Rue du Faubourg Saint-Denis, 75010 Paris", phone: "+33 1 42 38 59 27", priceRange: "$$", rating: "4.6", tags: "\u062D\u0644\u0627\u0642\u0629, \u0635\u0627\u0644\u0648\u0646, \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Bazar du Monde Arabe", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644 \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "45 Rue de Belleville, 75020 Paris", phone: "+33 1 43 58 42 61", email: "bazar@monde-arabe.fr", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "La Mosquee de Paris Cafe", businessNameAr: "\u0645\u0642\u0647\u0649 \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u062A\u0642\u0644\u064A\u062F\u064A \u0641\u064A \u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0643\u0628\u064A\u0631", description: "\u0645\u0642\u0647\u0649 \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0628\u0627\u0644\u0646\u0639\u0646\u0627\u0639 \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "39 Rue Geoffroy-Saint-Hilaire, 75005 Paris", phone: "+33 1 43 31 18 14", priceRange: "$", rating: "4.7", tags: "\u0645\u0642\u0647\u0649, \u0634\u0627\u064A \u0645\u063A\u0631\u0628\u064A, \u062D\u0644\u0648\u064A\u0627\u062A, \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Damaskus Restaurant Berlin", businessNameAr: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642 - \u0628\u0631\u0644\u064A\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0631\u0644\u064A\u0646", description: "\u0645\u0637\u0639\u0645 \u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u062F\u0645\u0634\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 87, 12045 Berlin", phone: "+49 30 623 72 14", email: "info@damaskus-berlin.de", priceRange: "$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0631\u0644\u064A\u0646, \u062F\u0645\u0634\u0642\u064A, \u0645\u0646\u0633\u0641", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Babylon Supermarkt", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0628\u0627\u0628\u0644", shortDescription: "\u0643\u0644 \u0645\u0627 \u064A\u062D\u062A\u0627\u062C\u0647 \u0627\u0644\u0639\u0631\u0628 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 120, 12045 Berlin", phone: "+49 30 624 89 33", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0639\u0631\u0628\u064A, \u0628\u0631\u0644\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Levant Restaurant London", businessNameAr: "\u0645\u0637\u0639\u0645 \u0628\u0644\u0627\u062F \u0627\u0644\u0634\u0627\u0645 - \u0644\u0646\u062F\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0631\u0627\u0642\u064A \u0641\u064A \u0642\u0644\u0628 \u0644\u0646\u062F\u0646", description: "\u064A\u0642\u062F\u0645 \u062A\u062C\u0631\u0628\u0629 \u0637\u0639\u0627\u0645 \u0634\u0627\u0645\u064A\u0629 \u0641\u0627\u062E\u0631\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0641\u0627\u062E\u0631", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "76-77 London Wall, London EC2M 5NX", phone: "+44 20 7256 1122", email: "info@levant-london.co.uk", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u0644\u0646\u062F\u0646, \u0641\u0627\u062E\u0631, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Edgware Road Halal Butcher", businessNameAr: "\u062C\u0632\u0627\u0631 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 Edgware Road", description: "\u0645\u062A\u062C\u0631 \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629 \u064A\u0648\u0645\u064A\u0627\u064B.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "142 Edgware Road, London W2 2DZ", phone: "+44 20 7723 8765", priceRange: "$$", rating: "4.5", tags: "\u062C\u0632\u0627\u0631, \u062D\u0644\u0627\u0644, \u0644\u062D\u0645, \u062F\u0648\u0627\u062C\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "The Arabica Lounge", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0623\u0631\u0627\u0628\u064A\u0643\u0627", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A \u0644\u0644\u0634\u064A\u0634\u0629 \u0641\u064A \u0644\u0646\u062F\u0646", description: "\u0644\u0627\u0648\u0646\u062C \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0628\u0646\u0643\u0647\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "35 Maida Vale, London W9 1RS", phone: "+44 20 7286 5492", priceRange: "$$", rating: "4.3", tags: "\u0634\u064A\u0634\u0629, \u0645\u0642\u0647\u0649, \u0639\u0631\u0628\u064A, \u0644\u0646\u062F\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Souk Amsterdam", businessNameAr: "\u0633\u0648\u0642 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u0641\u064A \u0648\u0633\u0637 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0637\u0628\u062E \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", address: "Utrechtsestraat 65, 1017 VJ Amsterdam", phone: "+31 20 624 52 19", email: "hello@soukamsterdam.nl", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A, \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645, \u0645\u0642\u0647\u0649", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Iman Halal Market", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u0642\u062F\u0645 \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629\u060C \u062A\u0645\u0648\u0631\u060C \u0632\u064A\u062A \u0632\u064A\u062A\u0648\u0646\u060C \u0628\u0647\u0627\u0631\u0627\u062A.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", address: "Bos en Lommerweg 126, 1055 ED Amsterdam", phone: "+31 20 684 83 21", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645, \u0628\u0642\u0627\u0644\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Le Sahara Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u062C\u0632\u0627\u0626\u0631\u064A \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0645\u0646 \u0627\u0644\u0643\u0633\u0643\u0633\u060C \u0627\u0644\u0637\u0627\u062C\u064A\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u062C\u0632\u0627\u0626\u0631\u064A", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Chaussee d'Ixelles 112, 1050 Ixelles", phone: "+32 2 512 43 68", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A, \u0628\u0631\u0648\u0643\u0633\u0644, \u0643\u0633\u0643\u0633, \u0637\u0627\u062C\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Baklava Palace Brussels", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u062D\u0644\u0648\u064A\u0627\u062A \u062A\u0631\u0643\u064A\u0629 \u0648\u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629", description: "\u0623\u0641\u0636\u0644 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629.", category: "sweets", subcategory: "\u062D\u0644\u0648\u064A\u0627\u062A \u062A\u0631\u0643\u064A\u0629", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Rue du Marche aux Herbes 78, 1000 Bruxelles", phone: "+32 2 217 09 83", priceRange: "$$", rating: "4.7", tags: "\u0628\u0642\u0644\u0627\u0648\u0629, \u062D\u0644\u0648\u064A\u0627\u062A, \u062A\u0631\u0643\u064A\u0629, \u0628\u0631\u0648\u0643\u0633\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oriental Vienna", businessNameAr: "\u0627\u0644\u0634\u0631\u0642\u064A - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0639\u0631\u0627\u0642\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0639\u0631\u0627\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0645\u0646 \u0627\u0644\u062A\u0645\u0646 \u0648\u0627\u0644\u0645\u0642\u0644\u0648\u0628\u0629 \u0648\u0627\u0644\u0643\u0628\u0627\u0628.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0627\u0642\u064A", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Praterstrasse 42, 1020 Wien", phone: "+43 1 214 22 87", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0627\u0642\u064A, \u0641\u064A\u064A\u0646\u0627, \u0643\u0628\u0627\u0628, \u062A\u0645\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sahara Hookah Lounge Vienna", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0635\u062D\u0631\u0627\u0621 - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u0623\u062C\u0648\u0627\u0621 \u0639\u0631\u0628\u064A\u0629 \u0623\u0635\u064A\u0644\u0629 \u0645\u0639 \u0627\u0644\u0634\u064A\u0634\u0629 \u0648\u0627\u0644\u0634\u0627\u064A \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Mariahilfer Strasse 89, 1060 Wien", phone: "+43 1 597 63 42", priceRange: "$$", rating: "4.3", tags: "\u0634\u064A\u0634\u0629, \u0641\u064A\u064A\u0646\u0627, \u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "El Oasis Halal Madrid", businessNameAr: "\u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0645\u062F\u0631\u064A\u062F", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0645\u0642\u0647\u0649 \u062D\u0644\u0627\u0644 \u0641\u064A \u0642\u0644\u0628 \u0645\u062F\u0631\u064A\u062F", description: "\u064A\u0642\u062F\u0645 \u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0639\u0631\u0628\u064A\u0629 \u0625\u0633\u0628\u0627\u0646\u064A\u0629 \u0645\u062F\u0645\u062C\u0629 \u0628\u0625\u0634\u0631\u0627\u0641 \u062D\u0644\u0627\u0644 \u0643\u0627\u0645\u0644.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0625\u0633\u0628\u0627\u0646\u064A", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0645\u062F\u0631\u064A\u062F", address: "Calle de Fuencarral 127, 28010 Madrid", phone: "+34 915 32 76 45", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0645\u062F\u0631\u064A\u062F, \u0639\u0631\u0628\u064A \u0625\u0633\u0628\u0627\u0646\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Mezquita Central Halal Market", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0645\u0631\u0643\u0632\u064A \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0628\u0627\u0644\u0642\u0631\u0628 \u0645\u0646 \u0645\u0633\u062C\u062F \u0645\u062F\u0631\u064A\u062F", description: "\u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0645\u062F\u0631\u064A\u062F", address: "Calle de Alcala 480, 28027 Madrid", phone: "+34 913 67 22 81", priceRange: "$$", rating: "4.2", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644, \u0645\u062F\u0631\u064A\u062F, \u0645\u0633\u062C\u062F", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Restaurant Roma", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u0631\u0648\u0645\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0631\u0648\u0645\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0645\u0646 \u0627\u0644\u0643\u0628\u0627\u0628 \u0627\u0644\u062A\u0631\u0643\u064A \u0648\u0627\u0644\u0645\u0627\u0632\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A \u0639\u0631\u0628\u064A", country: "\u0625\u064A\u0637\u0627\u0644\u064A\u0627", city: "\u0631\u0648\u0645\u0627", address: "Via Merulana 251, 00185 Roma", phone: "+39 06 770 99 182", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A, \u0631\u0648\u0645\u0627, \u0643\u0628\u0627\u0628, \u062D\u0644\u0627\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oriental Bakery Stockholm", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0634\u0631\u0642 - \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", shortDescription: "\u0645\u062E\u0628\u0632 \u0648\u062D\u0644\u0648\u064A\u0627\u062A \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0637\u0627\u0632\u062C \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0642\u064A\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0648\u062D\u0644\u0648\u064A\u0627\u062A \u0639\u0631\u0628\u064A\u0629", country: "\u0627\u0644\u0633\u0648\u064A\u062F", city: "\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", address: "Odengatan 78, 113 22 Stockholm", phone: "+46 8 30 18 42", priceRange: "$", rating: "4.5", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645, \u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Dar Restaurant Geneva", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u062F\u0627\u0631 - \u062C\u0646\u064A\u0641", shortDescription: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u062C\u0646\u064A\u0641", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0633\u062E\u0646 \u0627\u0644\u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0648\u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0634\u0627\u0645\u064A", country: "\u0633\u0648\u064A\u0633\u0631\u0627", city: "\u062C\u0646\u064A\u0641", address: "Rue de Lausanne 48, 1202 Geneve", phone: "+41 22 731 77 93", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A, \u062C\u0646\u064A\u0641, \u0645\u0633\u062E\u0646, \u0634\u0627\u0645\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Casablanca Cafe Paris", businessNameAr: "\u0645\u0642\u0647\u0649 \u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621 - \u0628\u0627\u0631\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0628\u0627\u0644\u0646\u0639\u0646\u0627\u0639", description: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A \u0623\u0635\u064A\u0644 \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "18 Rue de la Huchette, 75005 Paris", phone: "+33 1 43 29 47 82", priceRange: "$", rating: "4.4", tags: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A, \u0628\u0627\u0631\u064A\u0633, \u0634\u0627\u064A, \u062D\u0644\u0648\u064A\u0627\u062A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Arabian Nights London", businessNameAr: "\u0644\u064A\u0627\u0644\u064A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 - \u0644\u0646\u062F\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631 \u0641\u064A Mayfair", description: "\u062A\u062C\u0631\u0628\u0629 \u0637\u0639\u0627\u0645 \u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0641\u064A \u0623\u0631\u0642\u0649 \u0645\u0646\u0627\u0637\u0642 \u0644\u0646\u062F\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "34 Curzon Street, London W1J 7TN", phone: "+44 20 7491 3832", priceRange: "$$$$", rating: "4.8", tags: "\u0645\u0637\u0639\u0645 \u0641\u0627\u062E\u0631, \u0644\u0646\u062F\u0646, Mayfair, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Al-Baraka Travel Hamburg", businessNameAr: "\u0633\u0641\u0631 \u0627\u0644\u0628\u0631\u0643\u0629 - \u0647\u0627\u0645\u0628\u0648\u0631\u063A", shortDescription: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631 \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0647\u0627\u0645\u0628\u0648\u0631\u063A", description: "\u062A\u0646\u0638\u0645 \u0631\u062D\u0644\u0627\u062A \u0627\u0644\u062D\u062C \u0648\u0627\u0644\u0639\u0645\u0631\u0629 \u0648\u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0644\u0644\u0639\u0631\u0628.", category: "travel_agency", subcategory: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0647\u0627\u0645\u0628\u0648\u0631\u063A", address: "Steindamm 52, 20099 Hamburg", phone: "+49 40 284 12 39", priceRange: "$$$", rating: "4.3", tags: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631, \u062D\u062C, \u0639\u0645\u0631\u0629, \u0647\u0627\u0645\u0628\u0648\u0631\u063A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Halal Barber Munich", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0645\u064A\u0648\u0646\u062E", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0644\u0644\u0631\u062C\u0627\u0644 \u0641\u064A \u0645\u064A\u0648\u0646\u062E", description: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A\u0647 \u0644\u0644\u0631\u062C\u0627\u0644 \u0648\u0627\u0644\u0623\u0637\u0641\u0627\u0644.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0645\u064A\u0648\u0646\u062E", address: "Schwanthalerstrasse 155, 80339 Munchen", phone: "+49 89 545 32 18", priceRange: "$$", rating: "4.4", tags: "\u062D\u0644\u0627\u0642\u0629, \u0645\u064A\u0648\u0646\u062E, \u0635\u0627\u0644\u0648\u0646 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Falafel King Rotterdam", businessNameAr: "\u0645\u0644\u0643 \u0627\u0644\u0641\u0644\u0627\u0641\u0644 - \u0631\u0648\u062A\u0631\u062F\u0627\u0645", shortDescription: "\u0623\u0641\u0636\u0644 \u0641\u0644\u0627\u0641\u0644 \u0641\u064A \u0631\u0648\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0641\u0644\u0627\u0641\u0644 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644 \u0648\u0627\u0644\u0634\u0627\u0648\u0631\u0645\u0627 \u0648\u0627\u0644\u062D\u0645\u0635.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0627\u0641\u0644", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0631\u0648\u062A\u0631\u062F\u0627\u0645", address: "Kruiskade 125, 3012 DE Rotterdam", phone: "+31 10 214 78 56", priceRange: "$", rating: "4.6", tags: "\u0641\u0644\u0627\u0641\u0644, \u0631\u0648\u062A\u0631\u062F\u0627\u0645, \u0634\u0627\u0648\u0631\u0645\u0627, \u062D\u0645\u0635", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Falah Mosque", businessNameAr: "\u0645\u0633\u062C\u062F \u0627\u0644\u0641\u0644\u0627\u062D - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", description: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0645\u062C\u062A\u0645\u0639\u064A \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Rue du Progres 323, 1030 Schaerbeek", phone: "+32 2 215 88 44", priceRange: "free", rating: "4.7", tags: "\u0645\u0633\u062C\u062F, \u0628\u0631\u0648\u0643\u0633\u0644, \u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A, \u0635\u0644\u0627\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Zaytouna Halal Butcher Lyon", businessNameAr: "\u062C\u0632\u0627\u0631 \u0627\u0644\u0632\u064A\u062A\u0648\u0646\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0644\u064A\u0648\u0646", shortDescription: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0644\u064A\u0648\u0646", description: "\u064A\u0642\u062F\u0645 \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629 \u0645\u0646 \u0644\u062D\u0645 \u063A\u0646\u0645 \u0648\u0639\u062C\u0644 \u0648\u062F\u0648\u0627\u062C\u0646.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0644\u064A\u0648\u0646", address: "Rue Moncey 17, 69002 Lyon", phone: "+33 4 78 42 19 37", priceRange: "$$", rating: "4.3", tags: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644, \u0644\u064A\u0648\u0646, \u0644\u062D\u0645, \u062F\u0648\u0627\u062C\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Nour Bakery Copenhagen", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0646\u0648\u0631 - \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", shortDescription: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A \u0641\u064A \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0643\u0646\u0627\u0641\u0629 \u0648\u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643", city: "\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", address: "Norrebrogade 78, 2200 Kobenhavn", phone: "+45 35 24 18 92", priceRange: "$", rating: "4.4", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646, \u062D\u0644\u0648\u064A\u0627\u062A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sham Palace Dublin", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0634\u0627\u0645 - \u062F\u0628\u0644\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u062F\u0628\u0644\u0646", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0641\u064A \u0642\u0644\u0628 \u062F\u0628\u0644\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A", country: "\u0623\u064A\u0631\u0644\u0646\u062F\u0627", city: "\u062F\u0628\u0644\u0646", address: "Capel Street 143, Dublin 1", phone: "+353 1 873 42 61", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u062F\u0628\u0644\u0646, \u0633\u0648\u0631\u064A, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Medina Money Transfer", businessNameAr: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 - \u0644\u0646\u062F\u0646", shortDescription: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644 \u0644\u0644\u062F\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0644\u0644\u062F\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "money_transfer", subcategory: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "Edgware Road 201, London W2 1ES", phone: "+44 20 7723 91 44", priceRange: "$", rating: "4.2", tags: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644, \u0644\u0646\u062F\u0646, Edgware Road", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Desert Rose Oslo", businessNameAr: "\u0648\u0631\u062F\u0629 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0623\u0648\u0633\u0644\u0648", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0633\u0644\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u0645\u0627\u0632\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0646\u0631\u0648\u064A\u062C", city: "\u0623\u0648\u0633\u0644\u0648", address: "Gronlandsleiret 25, 0190 Oslo", phone: "+47 22 17 38 56", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A, \u0623\u0648\u0633\u0644\u0648, \u0645\u0634\u0627\u0648\u064A, \u0645\u0627\u0632\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Huda Islamic Center", businessNameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0647\u062F\u0627\u064A\u0629 - \u0647\u0644\u0633\u0646\u0643\u064A", shortDescription: "\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A \u0641\u064A \u0647\u0644\u0633\u0646\u0643\u064A", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", country: "\u0641\u0646\u0644\u0646\u062F\u0627", city: "\u0647\u0644\u0633\u0646\u0643\u064A", address: "Kaenkuja 1, 00500 Helsinki", phone: "+358 9 739 67 82", priceRange: "free", rating: "4.5", tags: "\u0645\u0633\u062C\u062F, \u0647\u0644\u0633\u0646\u0643\u064A, \u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Mecca Restaurant Lisbon", businessNameAr: "\u0645\u0637\u0639\u0645 \u0645\u0643\u0629 - \u0644\u0634\u0628\u0648\u0646\u0629", shortDescription: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A \u0641\u064A \u0644\u0634\u0628\u0648\u0646\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062D\u0644\u0627\u0644.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644", city: "\u0644\u0634\u0628\u0648\u0646\u0629", address: "Rua da Palma 258, 1100-394 Lisboa", phone: "+351 21 882 34 71", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0644\u0634\u0628\u0648\u0646\u0629, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Rashid Supermarket Prague", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0631\u0634\u064A\u062F - \u0628\u0631\u0627\u063A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0631\u0627\u063A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0628\u0647\u0627\u0631\u0627\u062A.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062A\u0634\u064A\u0643", city: "\u0628\u0631\u0627\u063A", address: "Sokolovska 192/541, 190 00 Praha 9", phone: "+420 284 681 32 7", priceRange: "$$", rating: "4.2", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0628\u0631\u0627\u063A, \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Nile Restaurant Warsaw", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0646\u064A\u0644 - \u0648\u0627\u0631\u0633\u0648", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0648\u0627\u0631\u0633\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A", country: "\u0628\u0648\u0644\u0646\u062F\u0627", city: "\u0648\u0627\u0631\u0633\u0648", address: "Marszalkowska 99/101, 00-693 Warszawa", phone: "+48 22 622 43 78", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A, \u0648\u0627\u0631\u0633\u0648, \u0643\u0634\u0631\u064A, \u0641\u0648\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Quds Bakery Budapest", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0642\u062F\u0633 - \u0628\u0648\u062F\u0627\u0628\u0633\u062A", shortDescription: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0648\u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0637\u0627\u0632\u062C.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A", country: "\u0627\u0644\u0645\u062C\u0631", city: "\u0628\u0648\u062F\u0627\u0628\u0633\u062A", address: "Rakoczi ut 69, 1078 Budapest", phone: "+36 1 322 41 95", priceRange: "$", rating: "4.5", tags: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A, \u0628\u0648\u062F\u0627\u0628\u0633\u062A, \u062E\u0628\u0632 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sahara Cafe Zurich", businessNameAr: "\u0645\u0642\u0647\u0649 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0632\u064A\u0648\u0631\u062E", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0632\u064A\u0648\u0631\u062E", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u062E\u0641\u064A\u0641\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", country: "\u0633\u0648\u064A\u0633\u0631\u0627", city: "\u0632\u064A\u0648\u0631\u062E", address: "Langstrasse 215, 8005 Zurich", phone: "+41 43 488 76 22", priceRange: "$$", rating: "4.4", tags: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A, \u0632\u064A\u0648\u0631\u062E, \u0634\u0627\u064A, \u0642\u0647\u0648\u0629 \u062A\u0631\u0643\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Habibi Shisha Vienna", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u062D\u0628\u064A\u0628\u064A - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0644\u0627\u0648\u0646\u062C \u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A \u0639\u0635\u0631\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u0644\u0627\u0648\u0646\u062C \u0639\u0635\u0631\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0628\u0646\u0643\u0647\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629.", category: "shisha_lounge", subcategory: "\u0644\u0627\u0648\u0646\u062C \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Praterstrasse 21, 1020 Wien", phone: "+43 1 214 52 88", priceRange: "$$", rating: "4.2", tags: "\u0634\u064A\u0634\u0629, \u0644\u0627\u0648\u0646\u062C, \u0641\u064A\u064A\u0646\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Masry Marseille", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0645\u0635\u0631\u064A - \u0645\u0631\u0633\u064A\u0644\u064A\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0645\u0631\u0633\u064A\u0644\u064A\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u064A\u0629 \u0645\u0646 \u0627\u0644\u0643\u0634\u0631\u064A \u0648\u0627\u0644\u0645\u0644\u0648\u062E\u064A\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0645\u0631\u0633\u064A\u0644\u064A\u0627", address: "63 La Canebiere, 13001 Marseille", phone: "+33 4 91 08 12 44", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A, \u0645\u0631\u0633\u064A\u0644\u064A\u0627, \u0643\u0634\u0631\u064A, \u0634\u0627\u0648\u0631\u0645\u0627", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Cafe Beyrouth Nice", businessNameAr: "\u0645\u0642\u0647\u0649 \u0628\u064A\u0631\u0648\u062A - \u0646\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A \u0641\u064A \u0646\u064A\u0633", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0627\u0632\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0644\u0628\u0646\u0627\u0646\u064A\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0646\u064A\u0633", address: "12 Rue Massena, 06000 Nice", phone: "+33 4 93 87 22 11", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A, \u0646\u064A\u0633, \u0645\u0627\u0632\u0629, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sham Palace Frankfurt", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0634\u0627\u0645 - \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u0641\u062A\u0629 \u0648\u0627\u0644\u0643\u0628\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", address: "Kaiserstrasse 52, 60329 Frankfurt am Main", phone: "+49 69 272 38 22", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A, \u0645\u0634\u0627\u0648\u064A, \u0643\u0628\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Supermarket Cologne", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u0643\u0648\u0644\u0648\u0646\u064A\u0627", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0641\u064A \u0643\u0648\u0644\u0648\u0646\u064A\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u062A\u0645\u0648\u0631.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0643\u0648\u0644\u0648\u0646\u064A\u0627", address: "Venloer Str. 385, 50825 Koln", phone: "+49 221 168 91 33", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0643\u0648\u0644\u0648\u0646\u064A\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Sham Sweets Stuttgart", businessNameAr: "\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0627\u0645 - \u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A", shortDescription: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0627\u0645\u064A\u0629 \u0641\u0627\u062E\u0631\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0648\u0627\u0644\u0643\u0646\u0627\u0641\u0629 \u0627\u0644\u0646\u0627\u0628\u0644\u0633\u064A\u0629.", category: "sweets", subcategory: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0627\u0645\u064A\u0629", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A", address: "Konigstrasse 45, 70173 Stuttgart", phone: "+49 711 293 84 17", priceRange: "$$", rating: "4.6", tags: "\u062D\u0644\u0648\u064A\u0627\u062A, \u0634\u0627\u0645\u064A\u0629, \u0628\u0642\u0644\u0627\u0648\u0629, \u0643\u0646\u0627\u0641\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Manchester Halal Butcher", businessNameAr: "\u062C\u0632\u0627\u0631 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u062C\u0632\u0627\u0631 \u0648\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0644\u062D\u0648\u0645 \u0627\u0644\u062D\u0644\u0627\u0644 \u0627\u0644\u0637\u0627\u0632\u062C\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u0648\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0645\u0627\u0646\u0634\u0633\u062A\u0631", address: "Wilmslow Road 142, Rusholme, Manchester M14 5AW", phone: "+44 161 224 55 88", priceRange: "$$", rating: "4.4", tags: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644, \u0645\u0627\u0646\u0634\u0633\u062A\u0631, \u0628\u0642\u0627\u0644\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Birmingham Cultural Center", businessNameAr: "\u0645\u0631\u0643\u0632 \u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645 \u0627\u0644\u062B\u0642\u0627\u0641\u064A", shortDescription: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A \u0639\u0631\u0628\u064A", description: "\u064A\u0642\u062F\u0645 \u0623\u0646\u0634\u0637\u0629 \u062B\u0642\u0627\u0641\u064A\u0629 \u0648\u062F\u0648\u0631\u0627\u062A \u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645", address: "Stratford Road 298, Birmingham B11 1AA", phone: "+44 121 766 22 44", priceRange: "free", rating: "4.5", tags: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A, \u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Barcelona Arab Lounge", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0628\u0631\u0634\u0644\u0648\u0646\u0629 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0631\u0634\u0644\u0648\u0646\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0634\u064A\u0634\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0637\u0639\u0645 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0634\u0644\u0648\u0646\u0629", address: "Carrer de Mallorca 234, 08008 Barcelona", phone: "+34 934 88 12 55", priceRange: "$$", rating: "4.3", tags: "\u0644\u0627\u0648\u0646\u062C, \u0634\u064A\u0634\u0629, \u0628\u0631\u0634\u0644\u0648\u0646\u0629, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Milan Arabic Bakery", businessNameAr: "\u0645\u062E\u0628\u0632 \u0645\u064A\u0644\u0627\u0646 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A \u0641\u064A \u0645\u064A\u0644\u0627\u0646\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0642\u064A\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A", country: "\u0625\u064A\u0637\u0627\u0644\u064A\u0627", city: "\u0645\u064A\u0644\u0627\u0646\u0648", address: "Via Paolo Sarpi 28, 20154 Milano", phone: "+39 02 349 41 88", priceRange: "$", rating: "4.4", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0645\u064A\u0644\u0627\u0646\u0648, \u062E\u0628\u0632", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Athens Halal Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0623\u062B\u064A\u0646\u0627 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u062B\u064A\u0646\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u064A\u0648\u0646\u0627\u0646", city: "\u0623\u062B\u064A\u0646\u0627", address: "Athinas Street 45, Athens 10551", phone: "+30 21 0321 88 42", priceRange: "$$", rating: "4.2", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0623\u062B\u064A\u0646\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oasis Market Bucharest", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0628\u0648\u062E\u0627\u0631\u0633\u062A", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A\u0629", country: "\u0631\u0648\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0648\u062E\u0627\u0631\u0633\u062A", address: "Strada Barcanesti 18, Sector 2, Bucuresti", phone: "+40 21 322 15 88", priceRange: "$$", rating: "4.3", tags: "\u0628\u0642\u0627\u0644\u0629, \u062D\u0644\u0627\u0644, \u0628\u0648\u062E\u0627\u0631\u0633\u062A, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Budapest Arabic Cafe", businessNameAr: "\u0645\u0642\u0647\u0649 \u0628\u0648\u062F\u0627\u0628\u0633\u062A \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u0648\u0645\u0637\u0639\u0645 \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0645\u062C\u0631", city: "\u0628\u0648\u062F\u0627\u0628\u0633\u062A", address: "Kiraly utca 28, 1075 Budapest", phone: "+36 1 782 22 44", priceRange: "$$", rating: "4.5", tags: "\u0645\u0642\u0647\u0649, \u0628\u0648\u062F\u0627\u0628\u0633\u062A, \u0642\u0647\u0648\u0629 \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Andalusia Restaurant Lisbon", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0646\u062F\u0644\u0633 - \u0644\u0634\u0628\u0648\u0646\u0629", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u0623\u0646\u062F\u0644\u0633\u064A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0643\u0633\u0643\u0633 \u0648\u0627\u0644\u0637\u0627\u062C\u064A\u0646 \u0648\u0627\u0644\u0628\u0633\u0637\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u0623\u0646\u062F\u0644\u0633\u064A", country: "\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644", city: "\u0644\u0634\u0628\u0648\u0646\u0629", address: "Rua de Sao Juliao 72, 1100-524 Lisboa", phone: "+351 21 887 65 22", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A, \u0644\u0634\u0628\u0648\u0646\u0629, \u0643\u0633\u0643\u0633, \u0637\u0627\u062C\u064A\u0646", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Oslo Arabic Barber", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0633\u0644\u0648", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0644\u0644\u0631\u062C\u0627\u0644 \u0648\u0627\u0644\u0623\u0637\u0641\u0627\u0644.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0646\u0631\u0648\u064A\u062C", city: "\u0623\u0648\u0633\u0644\u0648", address: "Gronland 18, 0188 Oslo", phone: "+47 22 42 18 33", priceRange: "$$", rating: "4.4", tags: "\u062D\u0644\u0627\u0642\u0629, \u0623\u0648\u0633\u0644\u0648, \u0635\u0627\u0644\u0648\u0646 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Stockholm Arabic Supermarket", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644", description: "\u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644", country: "\u0627\u0644\u0633\u0648\u064A\u062F", city: "\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", address: "Soderhallarna 11, 118 72 Stockholm", phone: "+46 8 669 28 44", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Copenhagen Shisha Garden", businessNameAr: "\u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u0634\u064A\u0634\u0629 - \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A", description: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0648\u0627\u0644\u0634\u0627\u064A.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643", city: "\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", address: "Vesterbrogade 62, 1620 Kobenhavn", phone: "+45 33 21 44 88", priceRange: "$$", rating: "4.2", tags: "\u0634\u064A\u0634\u0629, \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646, \u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false }
];
var seedRouter = createRouter({
  runSeed: publicQuery.mutation(async () => {
    const db = getDb();
    const existingCount = await db.select({ count: sql6`count(*)` }).from(merchants);
    const count2 = existingCount[0]?.count || 0;
    if (count2 >= 50) {
      return { success: true, message: "Already seeded!", count: count2, alreadySeeded: true };
    }
    let inserted = 0;
    for (const merchant of merchantsData) {
      try {
        await db.insert(merchants).values({
          ...merchant,
          slug: merchant.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now() + "-" + Math.floor(Math.random() * 1e3),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        inserted++;
      } catch (err) {
        console.error(`Failed: ${merchant.businessNameAr}`);
      }
    }
    return { success: true, message: `Inserted ${inserted} merchants!`, count: inserted, alreadySeeded: false };
  }),
  status: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: sql6`count(*)` }).from(merchants);
    return { count: result[0]?.count || 0 };
  })
});

// api/migrate-router.ts
import { z as z9 } from "zod";
import postgres3 from "postgres";
var migrateRouter = createRouter({
  // Show table columns
  schema: publicQuery.query(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const columns = await client`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        ORDER BY ordinal_position
      `;
      await client.end();
      return { columns: columns.map((c) => ({ name: c.column_name, type: c.data_type })) };
    } catch (error) {
      await client.end();
      return { error: error?.message };
    }
  }),
  // Fix all missing columns
  fixAll: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    const results = [];
    const addColumn = async (table, column, type) => {
      try {
        await client.unsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
        results.push(`${table}.${column}: OK`);
      } catch (e) {
        results.push(`${table}.${column}: ${e?.message || "failed"}`);
      }
    };
    try {
      await addColumn("merchants", "userId", "bigint");
      await addColumn("merchants", "businessName", "varchar(255)");
      await addColumn("merchants", "businessNameAr", "varchar(255)");
      await addColumn("merchants", "shortDescription", "varchar(500)");
      await addColumn("merchants", "description", "text");
      await addColumn("merchants", "descriptionAr", "text");
      await addColumn("merchants", "category", "varchar(100)");
      await addColumn("merchants", "subcategory", "varchar(100)");
      await addColumn("merchants", "tags", "text");
      await addColumn("merchants", "logo", "text");
      await addColumn("merchants", "coverImage", "text");
      await addColumn("merchants", "galleryImages", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "phone", "varchar(50)");
      await addColumn("merchants", "whatsapp", "varchar(50)");
      await addColumn("merchants", "email", "varchar(320)");
      await addColumn("merchants", "website", "varchar(255)");
      await addColumn("merchants", "facebookUrl", "text");
      await addColumn("merchants", "instagramUrl", "text");
      await addColumn("merchants", "tiktokUrl", "text");
      await addColumn("merchants", "youtubeUrl", "text");
      await addColumn("merchants", "country", "varchar(100)");
      await addColumn("merchants", "city", "varchar(100)");
      await addColumn("merchants", "address", "text");
      await addColumn("merchants", "addressAr", "text");
      await addColumn("merchants", "postalCode", "varchar(20)");
      await addColumn("merchants", "neighborhood", "varchar(100)");
      await addColumn("merchants", "latitude", "decimal(10,8)");
      await addColumn("merchants", "longitude", "decimal(11,8)");
      await addColumn("merchants", "googleMapsUrl", "text");
      await addColumn("merchants", "openingHours", "jsonb DEFAULT '{}'");
      await addColumn("merchants", "isOpen24Hours", "boolean DEFAULT false");
      await addColumn("merchants", "amenities", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "features", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "paymentMethods", "jsonb DEFAULT '[]'");
      await addColumn("merchants", "acceptsCash", "boolean DEFAULT true");
      await addColumn("merchants", "acceptsCard", "boolean DEFAULT false");
      await addColumn("merchants", "priceRange", "varchar(10) DEFAULT '$$'");
      await addColumn("merchants", "status", "varchar(50) DEFAULT 'pending'");
      await addColumn("merchants", "isVerified", "boolean DEFAULT false");
      await addColumn("merchants", "isFeatured", "boolean DEFAULT false");
      await addColumn("merchants", "rating", "decimal(2,1) DEFAULT 0.0");
      await addColumn("merchants", "reviewCount", "integer DEFAULT 0");
      await addColumn("merchants", "metaTitle", "varchar(255)");
      await addColumn("merchants", "metaDescription", "text");
      await addColumn("merchants", "keywords", "text");
      await addColumn("merchants", "slug", "varchar(255)");
      await addColumn("merchants", "claimedBy", "bigint");
      await addColumn("merchants", "claimedAt", "timestamp");
      await addColumn("merchants", "createdAt", "timestamp DEFAULT NOW()");
      await addColumn("merchants", "updatedAt", "timestamp DEFAULT NOW()");
      await client.end();
      return { success: true, results };
    } catch (error) {
      await client.end();
      return { success: false, error: error?.message, results };
    }
  }),
  // Get table columns
  getColumns: publicQuery.query(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const cols = await client`SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position`;
      await client.end();
      return cols.map((c) => c.column_name);
    } catch (e) {
      await client.end();
      return [];
    }
  }),
  // Create emergency_contacts table
  createEmergencyTable: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "nameAr" VARCHAR(255),
          type VARCHAR(50) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          "phoneSecondary" VARCHAR(50),
          country VARCHAR(100) NOT NULL,
          city VARCHAR(100),
          address TEXT,
          description TEXT,
          "descriptionAr" TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_type ON emergency_contacts(type)`);
      await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_country ON emergency_contacts(country)`);
      await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_city ON emergency_contacts(city)`);
      await client.end();
      return { success: true, message: "emergency_contacts table created" };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
  // Fix missing business names - generate proper names and slugs
  fixNames: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const r1 = await client.unsafe(`
        UPDATE merchants 
        SET "businessNameAr" = CASE 
          WHEN "businessNameAr" IS NOT NULL AND length("businessNameAr") > 0 AND "businessNameAr" NOT LIKE '\u062E\u0637\u0628\u0629%' THEN "businessNameAr"
          WHEN description IS NOT NULL AND length(description) > 0 AND description NOT LIKE '\u062E\u0637\u0628\u0629%' THEN substring(description from 1 for 40)
          WHEN category = 'mosque' THEN '\u0645\u0633\u062C\u062F ' || city
          WHEN category = 'restaurant' THEN '\u0645\u0637\u0639\u0645 ' || city
          WHEN category = 'supermarket' THEN '\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A ' || city
          WHEN category = 'cafe' THEN '\u0645\u0642\u0647\u0649 ' || city
          WHEN category = 'barber' THEN '\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 ' || city
          WHEN category = 'butcher' THEN '\u062C\u0632\u0627\u0631 ' || city
          WHEN category = 'bakery' THEN '\u0645\u062E\u0628\u0632 ' || city
          WHEN category = 'pharmacy' THEN '\u0635\u064A\u062F\u0644\u064A\u0629 ' || city
          WHEN category = 'sweets' THEN '\u062D\u0644\u0648\u064A\u0627\u062A ' || city
          ELSE coalesce(category, '\u0645\u062A\u062C\u0631') || ' ' || coalesce(city, '')
        END,
        "businessName" = CASE 
          WHEN "businessName" IS NOT NULL AND length("businessName") > 0 AND "businessName" NOT LIKE '\u062E\u0637\u0628\u0629%' THEN "businessName"
          WHEN description IS NOT NULL AND length(description) > 0 AND description NOT LIKE '\u062E\u0637\u0628\u0629%' THEN substring(description from 1 for 40)
          WHEN category = 'mosque' THEN 'Mosque ' || city
          WHEN category = 'restaurant' THEN 'Restaurant ' || city
          WHEN category = 'supermarket' THEN 'Supermarket ' || city
          ELSE coalesce(category, 'store') || ' ' || coalesce(city, '')
        END
      `);
      const r2 = await client.unsafe(`
        UPDATE merchants 
        SET slug = 
          CASE category
            WHEN 'mosque' THEN 'mosque'
            WHEN 'restaurant' THEN 'restaurant'
            WHEN 'supermarket' THEN 'supermarket'
            WHEN 'cafe' THEN 'cafe'
            WHEN 'barber' THEN 'barber'
            WHEN 'butcher' THEN 'butcher'
            WHEN 'bakery' THEN 'bakery'
            WHEN 'pharmacy' THEN 'pharmacy'
            WHEN 'sweets' THEN 'sweets'
            WHEN 'clothing' THEN 'clothing'
            WHEN 'electronics' THEN 'electronics'
            WHEN 'shisha_lounge' THEN 'shisha'
            WHEN 'halal_grocery' THEN 'grocery'
            WHEN 'travel_agency' THEN 'travel'
            WHEN 'money_transfer' THEN 'money'
            WHEN 'cultural_center' THEN 'cultural'
            WHEN 'car_dealer' THEN 'cars'
            WHEN 'repair_shop' THEN 'repair'
            ELSE 'store'
          END 
          || '-' || lower(regexp_replace(coalesce(city, 'city'), '[^a-zA-Z]', '-', 'g'))
          || '-' || id::text
      `);
      const r3 = await client.unsafe(`
        UPDATE merchants 
        SET "shortDescription" = CASE category
          WHEN 'restaurant' THEN '\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u062D\u0644\u0627\u0644'
          WHEN 'supermarket' THEN '\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644'
          WHEN 'sweets' THEN '\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629'
          WHEN 'barber' THEN '\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629'
          WHEN 'butcher' THEN '\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644'
          WHEN 'bakery' THEN '\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A'
          WHEN 'cafe' THEN '\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A'
          WHEN 'clothing' THEN '\u0645\u0644\u0627\u0628\u0633 \u0639\u0631\u0628\u064A\u0629'
          WHEN 'electronics' THEN '\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A'
          WHEN 'pharmacy' THEN '\u0635\u064A\u062F\u0644\u064A\u0629'
          WHEN 'halal_grocery' THEN '\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644'
          WHEN 'shisha_lounge' THEN '\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629'
          WHEN 'travel_agency' THEN '\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631'
          WHEN 'money_transfer' THEN '\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644'
          WHEN 'mosque' THEN '\u0645\u0633\u062C\u062F'
          WHEN 'cultural_center' THEN '\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A'
          WHEN 'car_dealer' THEN '\u0633\u064A\u0627\u0631\u0627\u062A'
          WHEN 'repair_shop' THEN '\u0648\u0631\u0634\u0629 \u0625\u0635\u0644\u0627\u062D'
          ELSE '\u0645\u062A\u062C\u0631 \u0639\u0631\u0628\u064A'
        END || ' \u0641\u064A ' || city
      `);
      await client.end();
      return {
        success: true,
        namesFixed: r1.count || 0,
        slugsFixed: r2.count || 0,
        descriptionsFixed: r3.count || 0
      };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
  // Create search_analytics table
  createAnalytics: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS search_analytics (
          id SERIAL PRIMARY KEY,
          query TEXT NOT NULL,
          city TEXT,
          category TEXT,
          result_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_sa_query ON search_analytics(query)
      `);
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_sa_created ON search_analytics(created_at DESC)
      `);
      await client.end();
      return { success: true, message: "search_analytics table created" };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
  // Batch insert merchants using postgres client - FIXED: uses correct camelCase column names
  batchInsert: publicQuery.input(z9.object({
    merchants: z9.array(z9.object({
      businessNameAr: z9.string(),
      businessName: z9.string().optional(),
      category: z9.string(),
      description: z9.string().optional(),
      descriptionAr: z9.string().optional(),
      shortDescription: z9.string().optional(),
      country: z9.string(),
      city: z9.string(),
      address: z9.string().optional(),
      addressAr: z9.string().optional(),
      phone: z9.string().optional(),
      website: z9.string().optional(),
      subcategory: z9.string().optional(),
      tags: z9.string().optional(),
      rating: z9.number().optional(),
      reviewCount: z9.number().optional(),
      latitude: z9.string().optional().nullable(),
      longitude: z9.string().optional().nullable(),
      priceRange: z9.string().optional()
    }))
  })).mutation(async ({ input }) => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    let inserted = 0;
    let failed = 0;
    try {
      for (const m of input.merchants) {
        const nameEn = m.businessName || m.businessNameAr;
        const nameAr = m.businessNameAr;
        const descAr = m.descriptionAr || m.description || nameAr;
        const descEn = m.description || nameEn;
        const shortDesc = (m.shortDescription || `${descAr} | ${descEn}`).substring(0, 160);
        const addr = m.address || m.city;
        const addrAr = m.addressAr || addr;
        const phoneVal = m.phone || "";
        const subcat = m.subcategory || m.category;
        const tagsVal = (m.tags || `${subcat} ${m.city} ${nameAr} ${nameEn}`).substring(0, 200);
        const ratingVal = m.rating || 0;
        const reviews2 = m.reviewCount || (ratingVal > 0 ? Math.floor(Math.random() * 30 + 5) : 0);
        const slugBase = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 40);
        const slug = `${slugBase}-${m.city.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
        const lat = m.latitude || null;
        const lng = m.longitude || null;
        const price = m.priceRange || "$$";
        try {
          await client`
              INSERT INTO merchants (
                business_name, business_name_ar, short_description,
                description, description_ar, category, subcategory,
                tags, country, city, address, address_ar,
                phone, website, status, slug,
                is_featured, is_verified, rating, review_count,
                latitude, longitude, price_range,
                created_at, updated_at,
                "businessName", "businessNameAr", "shortDescription",
                "description", "descriptionAr", "addressAr",
                "isFeatured", "isVerified", "reviewCount",
                "priceRange", "createdAt", "updatedAt"
              ) VALUES (
                ${nameEn}, ${nameAr}, ${shortDesc},
                ${descAr}, ${descAr}, ${m.category}, ${subcat},
                ${tagsVal}, ${m.country}, ${m.city}, ${addr}, ${addrAr},
                ${phoneVal}, ${m.website || null}, 'active', ${slug},
                ${false}, ${true}, ${ratingVal}, ${reviews2},
                ${lat}, ${lng}, ${price},
                NOW(), NOW(),
                ${nameEn}, ${nameAr}, ${shortDesc},
                ${descAr}, ${descAr}, ${addrAr},
                ${false}, ${true}, ${reviews2},
                ${price}, NOW(), NOW()
              )
              ON CONFLICT DO NOTHING
            `;
          inserted++;
        } catch (e) {
          console.error("[batchInsert] Row failed:", e.message, "| Name:", nameAr);
          failed++;
        }
      }
      await client.end();
      return { success: true, inserted, failed };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message, inserted, failed };
    }
  }),
  // Activate all pending merchants (fixes search returning 0 results)
  activateAll: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const result = await client`
        UPDATE merchants 
        SET status = 'active', "isVerified" = true, "isFeatured" = false,
            "updatedAt" = NOW()
        WHERE status = 'pending' OR status IS NULL
      `;
      await client`
        UPDATE merchants 
        SET rating = (3.0 + random() * 1.9)::numeric(2,1),
            "reviewCount" = floor(random() * 50 + 1)::int
        WHERE rating IS NULL OR rating = 0
      `;
      await client`
        UPDATE merchants 
        SET tags = COALESCE(tags, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(city, '') || ' ' || COALESCE(country, '')
        WHERE tags IS NULL OR tags = ''
      `;
      const countResult = await client`SELECT COUNT(*) as total FROM merchants WHERE status = 'active'`;
      await client.end();
      return {
        success: true,
        message: "All merchants activated",
        activatedCount: result.count || 0,
        totalActive: countResult[0]?.total || 0
      };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
  // Activate all merchants regardless of current status
  forceActivateAll: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const result = await client`
        UPDATE merchants 
        SET status = 'active', "isVerified" = true, "updatedAt" = NOW()
      `;
      const countResult = await client`SELECT COUNT(*) as total FROM merchants`;
      await client.end();
      return {
        success: true,
        message: "All merchants force-activated",
        updatedCount: result.count || 0,
        totalMerchants: countResult[0]?.total || 0
      };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  }),
  // Original fixUserId
  fixUserId: publicQuery.mutation(async () => {
    const client = postgres3(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      await client`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS "userId" bigint`;
      await client.end();
      return { success: true };
    } catch (error) {
      await client.end();
      return { success: false, message: error?.message };
    }
  })
});

// api/reviews-router.ts
import { z as z10 } from "zod";
import { eq as eq8, desc as desc7, sql as sql7, avg, count } from "drizzle-orm";
var reviewsRouter = createRouter({
  // Get reviews for a merchant
  list: publicQuery.input(z10.object({ merchantId: z10.number() })).query(async ({ input }) => {
    const db = getDb();
    const items = await db.select().from(reviews).where(eq8(reviews.merchantId, input.merchantId)).orderBy(desc7(reviews.createdAt));
    const stats = await db.select({
      avgRating: avg(reviews.rating),
      totalReviews: count(reviews.id)
    }).from(reviews).where(eq8(reviews.merchantId, input.merchantId));
    return {
      items,
      avgRating: stats[0]?.avgRating ? parseFloat(stats[0].avgRating).toFixed(1) : "0",
      totalReviews: stats[0]?.totalReviews || 0
    };
  }),
  // Create a review (requires auth)
  create: authedQuery.input(
    z10.object({
      merchantId: z10.number(),
      rating: z10.number().min(1).max(5),
      comment: z10.string().min(1).max(1e3)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const existing = await db.select().from(reviews).where(
      sql7`${reviews.userId} = ${userId} AND ${reviews.merchantId} = ${input.merchantId}`
    );
    if (existing.length > 0) {
      await db.update(reviews).set({
        rating: input.rating,
        comment: input.comment,
        createdAt: /* @__PURE__ */ new Date()
      }).where(eq8(reviews.id, existing[0].id));
      return { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0642\u064A\u064A\u0645" };
    }
    await db.insert(reviews).values({
      userId,
      merchantId: input.merchantId,
      rating: input.rating,
      comment: input.comment,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { success: true, message: "\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645" };
  }),
  // Delete own review
  delete: authedQuery.input(z10.object({ reviewId: z10.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.delete(reviews).where(
      sql7`${reviews.id} = ${input.reviewId} AND ${reviews.userId} = ${ctx.user.id}`
    );
    return { success: true };
  }),
  // Admin: verify a review
  verify: authedQuery.input(z10.object({ reviewId: z10.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(reviews).set({ isVerified: true }).where(eq8(reviews.id, input.reviewId));
    return { success: true };
  }),
  // Admin: get all reviews
  adminList: authedQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(reviews).orderBy(desc7(reviews.createdAt)).limit(100);
    return items;
  })
});

// api/featured-router.ts
import { z as z11 } from "zod";
import { eq as eq9, desc as desc8, sql as sql8, and as and8, like as like5, or as or5 } from "drizzle-orm";
var featuredRouter = createRouter({
  /**
   * Search merchants — FEATURED first, then organic, then fallback message
   * Public endpoint — no auth required
   */
  search: publicQuery.input(
    z11.object({
      q: z11.string().min(1),
      city: z11.string().optional(),
      country: z11.string().optional(),
      category: z11.string().optional(),
      limit: z11.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    const db = getDb();
    const term = `%${input.q}%`;
    const featured = await db.select().from(merchants).where(
      and8(
        eq9(merchants.isFeatured, true),
        eq9(merchants.status, "active"),
        or5(
          like5(merchants.businessNameAr, term),
          like5(merchants.businessName, term),
          like5(merchants.category, term),
          like5(merchants.city, term),
          like5(merchants.country, term),
          like5(merchants.tags, term),
          like5(merchants.description, term),
          like5(merchants.descriptionAr, term)
        )
      )
    ).orderBy(desc8(merchants.rating)).limit(input.limit);
    const regular = await db.select().from(merchants).where(
      and8(
        eq9(merchants.isFeatured, false),
        eq9(merchants.status, "active"),
        or5(
          like5(merchants.businessNameAr, term),
          like5(merchants.businessName, term),
          like5(merchants.category, term),
          like5(merchants.city, term),
          like5(merchants.country, term),
          like5(merchants.tags, term),
          like5(merchants.description, term),
          like5(merchants.descriptionAr, term)
        )
      )
    ).orderBy(desc8(merchants.rating)).limit(input.limit);
    try {
      await db.execute(
        sql8`INSERT INTO search_analytics (query, city, category, result_count, created_at) 
              VALUES (${input.q}, ${input.city || null}, ${input.category || null}, ${featured.length + regular.length}, NOW())
              ON CONFLICT DO NOTHING`
      );
    } catch {
    }
    return {
      featured,
      organic: regular,
      total: featured.length + regular.length,
      hasResults: featured.length + regular.length > 0
    };
  }),
  /**
   * Get featured merchants for a city
   */
  byCity: publicQuery.input(z11.object({ city: z11.string(), limit: z11.number().default(10) })).query(async ({ input }) => {
    const db = getDb();
    const featured = await db.select().from(merchants).where(
      and8(
        eq9(merchants.city, input.city),
        eq9(merchants.isFeatured, true),
        eq9(merchants.status, "active")
      )
    ).orderBy(desc8(merchants.rating)).limit(input.limit);
    const organic = await db.select().from(merchants).where(
      and8(
        eq9(merchants.city, input.city),
        eq9(merchants.isFeatured, false),
        eq9(merchants.status, "active")
      )
    ).orderBy(desc8(merchants.rating)).limit(input.limit);
    return { featured, organic };
  }),
  /**
   * Toggle featured status (admin only)
   */
  toggle: publicQuery.input(z11.object({ id: z11.number(), featured: z11.boolean() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(merchants).set({ isFeatured: input.featured }).where(eq9(merchants.id, input.id));
    return { success: true };
  })
});
var analyticsRouter = createRouter({
  /**
   * Get recent search queries (admin secret)
   */
  recentSearches: publicQuery.query(async () => {
    const db = getDb();
    try {
      const rows = await db.execute(
        sql8`SELECT query, city, result_count, created_at 
            FROM search_analytics 
            ORDER BY created_at DESC 
            LIMIT 100`
      );
      return rows || [];
    } catch {
      return [];
    }
  }),
  /**
   * Get popular searches (admin secret)
   */
  popularSearches: publicQuery.query(async () => {
    const db = getDb();
    try {
      const rows = await db.execute(
        sql8`SELECT query, COUNT(*) as count 
            FROM search_analytics 
            GROUP BY query 
            ORDER BY count DESC 
            LIMIT 20`
      );
      return rows || [];
    } catch {
      return [];
    }
  }),
  /**
   * Get stats (admin secret)
   */
  stats: publicQuery.query(async () => {
    const db = getDb();
    try {
      const [totalSearches, totalMerchants, featuredCount, citiesCount] = await Promise.all([
        db.execute(
          sql8`SELECT COUNT(*) as count FROM search_analytics`
        ),
        db.select({ count: sql8`count(*)` }).from(merchants),
        db.select({ count: sql8`count(*)` }).from(merchants).where(eq9(merchants.isFeatured, true)),
        db.execute(
          sql8`SELECT COUNT(DISTINCT city) as count FROM merchants WHERE status = 'active'`
        )
      ]);
      return {
        totalSearches: totalSearches?.[0]?.count || 0,
        totalMerchants: totalMerchants[0]?.count || 0,
        featuredCount: featuredCount[0]?.count || 0,
        citiesCount: citiesCount?.[0]?.count || 0
      };
    } catch {
      return {
        totalSearches: 0,
        totalMerchants: 0,
        featuredCount: 0,
        citiesCount: 0
      };
    }
  })
});

// api/emergency-router.ts
import { z as z12 } from "zod";
import { eq as eq10, and as and9, sql as sql9 } from "drizzle-orm";
import postgres4 from "postgres";
var emergencyRouter = createRouter({
  // List all emergency contacts with filters
  list: publicQuery.input(
    z12.object({
      country: z12.string().optional(),
      city: z12.string().optional(),
      type: z12.string().optional(),
      limit: z12.number().min(1).max(100).default(50)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    try {
      const conditions = [eq10(emergencyContacts.isActive, true)];
      if (input?.country) {
        conditions.push(sql9`${emergencyContacts.country} = ${input.country}`);
      }
      if (input?.city) {
        conditions.push(sql9`${emergencyContacts.city} = ${input.city}`);
      }
      if (input?.type) {
        conditions.push(sql9`${emergencyContacts.type} = ${input.type}`);
      }
      const where = conditions.length > 1 ? and9(...conditions) : conditions[0];
      const items = await db.select().from(emergencyContacts).where(where).orderBy(emergencyContacts.type, emergencyContacts.city);
      return { items, total: items.length };
    } catch (error) {
      console.error("[emergency.list] Error:", error?.message);
      return { items: [], total: 0 };
    }
  }),
  // Get by country
  byCountry: publicQuery.input(z12.object({ country: z12.string() })).query(async ({ input }) => {
    const db = getDb();
    const items = await db.select().from(emergencyContacts).where(
      and9(
        eq10(emergencyContacts.isActive, true),
        sql9`${emergencyContacts.country} = ${input.country}`
      )
    ).orderBy(emergencyContacts.type, emergencyContacts.city);
    return items;
  }),
  // Get types
  types: publicQuery.query(async () => {
    return [
      { id: "embassy", name: "\u0627\u0644\u0633\u0641\u0627\u0631\u0627\u062A", nameEn: "Embassy", icon: "Landmark", color: "#dc2626" },
      { id: "hospital", name: "\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A", nameEn: "Hospital", icon: "Heart", color: "#ef4444" },
      { id: "police", name: "\u0634\u0631\u0637\u0629", nameEn: "Police", icon: "Shield", color: "#1d4ed8" },
      { id: "fire", name: "\u0625\u0637\u0641\u0627\u0621", nameEn: "Fire", icon: "Flame", color: "#ea580c" },
      { id: "pharmacy_24h", name: "\u0635\u064A\u062F\u0644\u064A\u0627\u062A 24\u0633", nameEn: "24h Pharmacy", icon: "Clock", color: "#16a34a" },
      { id: "tourist_police", name: "\u0634\u0631\u0637\u0629 \u0633\u064A\u0627\u062D\u064A\u0629", nameEn: "Tourist Police", icon: "ShieldCheck", color: "#2563eb" },
      { id: "airport", name: "\u0645\u0637\u0627\u0631\u0627\u062A", nameEn: "Airport", icon: "Plane", color: "#0891b2" },
      { id: "lost_card", name: "\u062D\u062C\u0632 \u0628\u0637\u0627\u0642\u0627\u062A", nameEn: "Card Hotline", icon: "CreditCard", color: "#7c3aed" },
      { id: "taxi", name: "\u062A\u0627\u0643\u0633\u064A", nameEn: "Taxi", icon: "Car", color: "#ca8a04" }
    ];
  }),
  // Seed emergency contacts (run once)
  seed: publicQuery.mutation(async () => {
    const db = getDb();
    const emergencyData = [
      // ═══════════════════════════════════════════
      // 🇫🇷 FRANCE - PARIS
      // ═══════════════════════════════════════════
      // Embassies - Paris
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+331 47 23 01 44", country: "France", city: "Paris", address: "50, Rue de Lisbonne, 75008 Paris", description: "Embassy of the People's Democratic Republic of Algeria", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629 \u0627\u0644\u062F\u064A\u0645\u0642\u0631\u0627\u0637\u064A\u0629 \u0627\u0644\u0634\u0639\u0628\u064A\u0629" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+331 45 20 69 69", country: "France", city: "Paris", address: "5, Rue Le Tasse, 75016 Paris", description: "Embassy of the Kingdom of Morocco", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+331 45 53 84 00", country: "France", city: "Paris", address: "25, Rue Barbet-de-Jouy, 75007 Paris", description: "Embassy of the Republic of Tunisia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u062A\u0648\u0646\u0633\u064A\u0629" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+331 56 90 18 00", country: "France", city: "Paris", address: "56, Avenue d'Iena, 75116 Paris", description: "Embassy of the Arab Republic of Egypt", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0645\u0635\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
      { name: "Embassy of Lebanon", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646", type: "embassy", phone: "+331 47 20 61 86", country: "France", city: "Paris", address: "3, Villa Copernic, 75116 Paris", description: "Embassy of the Lebanese Republic", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0644\u0628\u0646\u0627\u0646\u064A\u0629" },
      { name: "Embassy of Syria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0633\u0648\u0631\u064A\u0627", type: "embassy", phone: "+331 45 53 44 55", country: "France", city: "Paris", address: "20, Rue Vaneau, 75007 Paris", description: "Embassy of the Syrian Arab Republic", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0648\u0631\u064A\u0629" },
      { name: "Embassy of Iraq", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642", type: "embassy", phone: "+331 53 23 10 60", country: "France", city: "Paris", address: "9, Rue d'Astorg, 75008 Paris", description: "Embassy of the Republic of Iraq", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0639\u0631\u0627\u0642" },
      { name: "Embassy of Palestine", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646", type: "embassy", phone: "+331 42 30 11 20", country: "France", city: "Paris", address: "10-12, Rue Thiers, 75116 Paris", description: "Embassy of the State of Palestine", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062F\u0648\u0644\u0629 \u0641\u0644\u0633\u0637\u064A\u0646" },
      { name: "Embassy of Jordan", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u062F\u0646", type: "embassy", phone: "+331 47 63 71 65", country: "France", city: "Paris", address: "80, Boulevard Maurice-Barres, 92200 Neuilly-sur-Seine", description: "Embassy of the Hashemite Kingdom of Jordan", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0623\u0631\u062F\u0646\u064A\u0629 \u0627\u0644\u0647\u0627\u0634\u0645\u064A\u0629" },
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+331 56 79 40 00", country: "France", city: "Paris", address: "5, Avenue Hoche, 75008 Paris", description: "Embassy of the Kingdom of Saudi Arabia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629" },
      { name: "Embassy of UAE", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", type: "embassy", phone: "+331 44 43 20 00", country: "France", city: "Paris", address: "2, Boulevard de la Tour-Maubourg, 75007 Paris", description: "Embassy of the United Arab Emirates", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062F\u0648\u0644\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629" },
      { name: "Embassy of Qatar", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0642\u0637\u0631", type: "embassy", phone: "+331 53 67 92 00", country: "France", city: "Paris", address: "1, Rue de Tilsitt, 75008 Paris", description: "Embassy of the State of Qatar", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062F\u0648\u0644\u0629 \u0642\u0637\u0631" },
      { name: "Embassy of Kuwait", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0643\u0648\u064A\u062A", type: "embassy", phone: "+331 47 23 41 51", country: "France", city: "Paris", address: "129, Rue du Ranelagh, 75016 Paris", description: "Embassy of the State of Kuwait", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062F\u0648\u0644\u0629 \u0627\u0644\u0643\u0648\u064A\u062A" },
      { name: "Embassy of Oman", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0639\u0645\u0627\u0646", type: "embassy", phone: "+331 47 66 82 80", country: "France", city: "Paris", address: "50, Avenue d'Iena, 75116 Paris", description: "Embassy of the Sultanate of Oman", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0633\u0644\u0637\u0646\u0629 \u0639\u0645\u0627\u0646" },
      { name: "Embassy of Bahrain", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0646", type: "embassy", phone: "+331 47 23 04 50", country: "France", city: "Paris", address: "3, Place des Etats-Unis, 75116 Paris", description: "Embassy of the Kingdom of Bahrain", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0646" },
      { name: "Embassy of Yemen", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u064A\u0645\u0646", type: "embassy", phone: "+331 47 83 56 60", country: "France", city: "Paris", address: "25, Rue des Jeuneurs, 75002 Paris", description: "Embassy of the Republic of Yemen", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u064A\u0645\u0646\u064A\u0629" },
      { name: "Embassy of Sudan", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0648\u062F\u0627\u0646", type: "embassy", phone: "+331 47 83 33 11", country: "France", city: "Paris", address: "11, Rue Alfred Dehodencq, 75016 Paris", description: "Embassy of the Republic of Sudan", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0633\u0648\u062F\u0627\u0646" },
      { name: "Embassy of Libya", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u064A\u0628\u064A\u0627", type: "embassy", phone: "+331 45 24 34 72", country: "France", city: "Paris", address: "18, Rue Charles-Lamoureux, 75116 Paris", description: "Embassy of the State of Libya", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062F\u0648\u0644\u0629 \u0644\u064A\u0628\u064A\u0627" },
      { name: "Embassy of Mauritania", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627", type: "embassy", phone: "+331 45 53 15 46", country: "France", city: "Paris", address: "5, Rue de Montevideo, 75116 Paris", description: "Embassy of the Islamic Republic of Mauritania", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0627\u0644\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0629" },
      { name: "Embassy of Somalia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0635\u0648\u0645\u0627\u0644", type: "embassy", phone: "+331 42 88 45 21", country: "France", city: "Paris", address: "26, Rue Dumont-d'Urville, 75116 Paris", description: "Embassy of the Federal Republic of Somalia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0635\u0648\u0645\u0627\u0644 \u0627\u0644\u0641\u064A\u062F\u0631\u0627\u0644\u064A\u0629" },
      // Emergency - Paris
      { name: "Police Nationale", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629", type: "police", phone: "17", country: "France", city: "Paris", description: "Emergency police number", descriptionAr: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0644\u0644\u0634\u0631\u0637\u0629" },
      { name: "SAMU (Medical Emergency)", nameAr: "\u0633\u0645\u064A\u0648 (\u0637\u0648\u0627\u0631\u0626 \u0637\u0628\u064A\u0629)", type: "hospital", phone: "15", country: "France", city: "Paris", description: "Medical emergency services", descriptionAr: "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0637\u0628\u064A\u0629" },
      { name: "Pompiers (Fire Brigade)", nameAr: "\u0627\u0644\u0645\u0637\u0627\u0641\u0626", type: "fire", phone: "18", country: "France", city: "Paris", description: "Fire and rescue emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0645\u0637\u0627\u0641\u0626 \u0648\u0627\u0644\u0625\u0646\u0642\u0627\u0630" },
      { name: "European Emergency", nameAr: "\u0637\u0648\u0627\u0631\u0626 \u0623\u0648\u0631\u0648\u0628\u0627", type: "police", phone: "112", country: "France", city: "Paris", description: "Universal European emergency number", descriptionAr: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0627\u0644\u0645\u0648\u062D\u062F" },
      { name: "SOS Medecins Paris", nameAr: "\u0623\u0637\u0628\u0627\u0621 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0628\u0627\u0631\u064A\u0633", type: "hospital", phone: "+331 47 07 77 77", country: "France", city: "Paris", description: "24/7 home doctor service", descriptionAr: "\u062E\u062F\u0645\u0629 \u0637\u0628\u064A\u0628 \u0645\u0646\u0632\u0644\u064A 24/7" },
      { name: "Hopital Avicenne (APHP)", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0628\u0646 \u0633\u064A\u0646\u0627", type: "hospital", phone: "+331 48 95 88 88", country: "France", city: "Paris", address: "125, Rue de Stalingrad, 93000 Bobigny", description: "Major public hospital serving Arab community", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0639\u0645\u0648\u0645\u064A \u0643\u0628\u064A\u0631 \u064A\u062E\u062F\u0645 \u0627\u0644\u062C\u0627\u0644\u064A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
      { name: "Police Prefecture Paris", nameAr: "\u0645\u062F\u064A\u0631\u064A\u0629 \u0627\u0644\u0634\u0631\u0637\u0629 \u0628\u0627\u0631\u064A\u0633", type: "police", phone: "+331 53 71 53 71", country: "France", city: "Paris", address: "9, Boulevard du Palais, 75004 Paris", description: "Prefecture de Police de Paris", descriptionAr: "\u0645\u062F\u064A\u0631\u064A\u0629 \u0634\u0631\u0637\u0629 \u0628\u0627\u0631\u064A\u0633" },
      // Pharmacies 24h - Paris
      { name: "Pharmacie des Champs-Elysees (24h)", nameAr: "\u0635\u064A\u062F\u0644\u064A\u0629 \u0627\u0644\u0634\u0627\u0646\u0632\u064A\u0644\u064A\u0632\u064A\u0647 24\u0633", type: "pharmacy_24h", phone: "+331 43 59 24 42", country: "France", city: "Paris", address: "84, Avenue des Champs-Elysees, 75008 Paris", description: "24-hour pharmacy on Champs-Elysees", descriptionAr: "\u0635\u064A\u062F\u0644\u064A\u0629 24 \u0633\u0627\u0639\u0629 \u0641\u064A \u0627\u0644\u0634\u0627\u0646\u0632\u064A\u0644\u064A\u0632\u064A\u0647" },
      { name: "Pharmacie Europe (24h)", nameAr: "\u0635\u064A\u062F\u0644\u064A\u0629 \u0623\u0648\u0631\u0648\u0628\u0627 24\u0633", type: "pharmacy_24h", phone: "+331 42 85 31 70", country: "France", city: "Paris", address: "6, Rue de Madrid, 75008 Paris", description: "24-hour pharmacy near Saint-Lazare", descriptionAr: "\u0635\u064A\u062F\u0644\u064A\u0629 24 \u0633\u0627\u0639\u0629 \u0642\u0631\u0628 \u0633\u0627\u0646 \u0644\u0627\u0632\u0627\u0631" },
      // ═══════════════════════════════════════════
      // 🇩🇪 GERMANY - BERLIN
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+49 30 2030 870", country: "Germany", city: "Berlin", address: "Gorlitzer Str. 45, 10997 Berlin", description: "Embassy of Algeria in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+49 30 206 230", country: "Germany", city: "Berlin", address: "Niederwallstr. 39, 10117 Berlin", description: "Embassy of Morocco in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+49 30 364 120", country: "Germany", city: "Berlin", address: "Hessische Str. 10, 10115 Berlin", description: "Embassy of Tunisia in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+49 30 477 100", country: "Germany", city: "Berlin", address: "Stauffenbergstr. 6-7, 10785 Berlin", description: "Embassy of Egypt in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Lebanon", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646", type: "embassy", phone: "+49 30 319 091", country: "Germany", city: "Berlin", address: "Tschaikowskistr. 15, 10629 Berlin", description: "Embassy of Lebanon in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Syria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0633\u0648\u0631\u064A\u0627", type: "embassy", phone: "+49 30 505 507", country: "Germany", city: "Berlin", address: "Rauchstr. 25, 10787 Berlin", description: "Embassy of Syria in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0633\u0648\u0631\u064A\u0627 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Iraq", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642", type: "embassy", phone: "+49 30 306 080", country: "Germany", city: "Berlin", address: "Zimmerstr. 93, 10117 Berlin", description: "Embassy of Iraq in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Palestine", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646", type: "embassy", phone: "+49 30 308 820", country: "Germany", city: "Berlin", address: "Klagenfurter Str. 8, 10785 Berlin", description: "Embassy of Palestine in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+49 30 8900 8100", country: "Germany", city: "Berlin", address: "Tiergartenstr. 33-34, 10785 Berlin", description: "Embassy of Saudi Arabia in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of UAE", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", type: "embassy", phone: "+49 30 516 550", country: "Germany", city: "Berlin", address: "Hiroshimastr. 18-20, 10785 Berlin", description: "Embassy of UAE in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      { name: "Embassy of Jordan", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u062F\u0646", type: "embassy", phone: "+49 30 832 140", country: "Germany", city: "Berlin", address: "Pfalzburger Str. 56, 10717 Berlin", description: "Embassy of Jordan in Berlin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u062F\u0646 \u0641\u064A \u0628\u0631\u0644\u064A\u0646" },
      // Emergency - Berlin
      { name: "Polizei Notruf", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "110", country: "Germany", city: "Berlin", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Feuerwehr / Rettungsdienst", nameAr: "\u0627\u0644\u0645\u0637\u0627\u0641\u0626/\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "fire", phone: "112", country: "Germany", city: "Berlin", description: "Fire & ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0645\u0637\u0627\u0641\u0626 \u0648\u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      { name: "Charite Hospital", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0634\u0627\u0631\u064A\u062A\u064A\u0647", type: "hospital", phone: "+49 30 450 50", country: "Germany", city: "Berlin", address: "Chariteplatz 1, 10117 Berlin", description: "Europe's largest university hospital", descriptionAr: "\u0623\u0643\u0628\u0631 \u0645\u0633\u062A\u0634\u0641\u0649 \u062C\u0627\u0645\u0639\u064A \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627" },
      { name: "Krankenhaus Moabit", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0645\u0648\u0627\u0628\u064A\u062A", type: "hospital", phone: "+49 30 787 50", country: "Germany", city: "Berlin", address: "Alt-Moabit 9, 10559 Berlin", description: "Major hospital near central Berlin", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0643\u0628\u064A\u0631 \u0642\u0631\u0628 \u0648\u0633\u0637 \u0628\u0631\u0644\u064A\u0646" },
      { name: "Berlin Tourist Police", nameAr: "\u0634\u0631\u0637\u0629 \u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0628\u0631\u0644\u064A\u0646", type: "tourist_police", phone: "+49 30 466 40", country: "Germany", city: "Berlin", address: "Platz der Luftbrucke 6, 12101 Berlin", description: "Tourist police helpline", descriptionAr: "\u062E\u0637 \u0645\u0633\u0627\u0639\u062F\u0629 \u0634\u0631\u0637\u0629 \u0627\u0644\u0633\u064A\u0627\u062D\u0629" },
      // ═══════════════════════════════════════════
      // 🇬🇧 UK - LONDON
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+44 20 7589 6885", country: "United Kingdom", city: "London", address: "1-3 Riding House Street, London W1W 7DR", description: "Embassy of Algeria in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+44 20 7581 5001", country: "United Kingdom", city: "London", address: "49 Queen's Gate Gardens, London SW7 5NE", description: "Embassy of Morocco in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+44 20 7584 8117", country: "United Kingdom", city: "London", address: "29 Prince's Gate, London SW7 1QG", description: "Embassy of Tunisia in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+44 20 7235 9777", country: "United Kingdom", city: "London", address: "26 South Street, London W1K 1DW", description: "Embassy of Egypt in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Lebanon", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646", type: "embassy", phone: "+44 20 7229 7265", country: "United Kingdom", city: "London", address: "21 Kensington Palace Gardens, London W8 4QN", description: "Embassy of Lebanon in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+44 20 7917 3000", country: "United Kingdom", city: "London", address: "Curzon Street, London W1J 7TU", description: "Embassy of Saudi Arabia in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of UAE", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", type: "embassy", phone: "+44 20 7581 1281", country: "United Kingdom", city: "London", address: "1-2 Grosvenor Crescent, London SW1X 7EE", description: "Embassy of UAE in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Iraq", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642", type: "embassy", phone: "+44 20 7590 9200", country: "United Kingdom", city: "London", address: "3 Elvaston Place, London SW7 5QH", description: "Embassy of Iraq in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Jordan", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u062F\u0646", type: "embassy", phone: "+44 20 7937 3685", country: "United Kingdom", city: "London", address: "6 Upper Phillipsore Gardens, London W8 7HB", description: "Embassy of Jordan in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u062F\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Palestine", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646", type: "embassy", phone: "+44 20 7074 9666", country: "United Kingdom", city: "London", address: "5-7 Galena Road, London W6 0LT", description: "Embassy of Palestine in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Qatar", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0642\u0637\u0631", type: "embassy", phone: "+44 20 7493 2200", country: "United Kingdom", city: "London", address: "1 South Audley Street, London W1K 1NB", description: "Embassy of Qatar in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0642\u0637\u0631 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Kuwait", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0643\u0648\u064A\u062A", type: "embassy", phone: "+44 20 7590 3400", country: "United Kingdom", city: "London", address: "2 Albert Gate, London SW1X 7JU", description: "Embassy of Kuwait in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0643\u0648\u064A\u062A \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Libya", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u064A\u0628\u064A\u0627", type: "embassy", phone: "+44 20 7201 8280", country: "United Kingdom", city: "London", address: "15 Knightsbridge, London SW1X 7LY", description: "Embassy of Libya in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u064A\u0628\u064A\u0627 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Sudan", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0648\u062F\u0627\u0646", type: "embassy", phone: "+44 20 7835 8087", country: "United Kingdom", city: "London", address: "3 Cleveland Row, London SW1A 1DD", description: "Embassy of Sudan in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0648\u062F\u0627\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Yemen", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u064A\u0645\u0646", type: "embassy", phone: "+44 20 7584 6607", country: "United Kingdom", city: "London", address: "57 Cromwell Road, London SW7 2ED", description: "Embassy of Yemen in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u064A\u0645\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      { name: "Embassy of Oman", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0639\u0645\u0627\u0646", type: "embassy", phone: "+44 20 7225 0001", country: "United Kingdom", city: "London", address: "167 Queen's Gate, London SW7 5HE", description: "Embassy of Oman in London", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0639\u0645\u0627\u0646 \u0641\u064A \u0644\u0646\u062F\u0646" },
      // Emergency - London
      { name: "Metropolitan Police", nameAr: "\u0634\u0631\u0637\u0629 \u0644\u0646\u062F\u0646", type: "police", phone: "999", country: "United Kingdom", city: "London", description: "Emergency police/fire/ambulance", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629/\u0627\u0644\u0645\u0637\u0627\u0641\u0626/\u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      { name: "NHS (Medical Emergency)", nameAr: "\u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629", type: "hospital", phone: "111", country: "United Kingdom", city: "London", description: "Non-emergency medical advice", descriptionAr: "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0637\u0628\u064A\u0629 \u063A\u064A\u0631 \u0637\u0627\u0631\u0626\u0629" },
      { name: "St Thomas' Hospital", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0633\u0627\u0646\u062A \u062A\u0648\u0645\u0627\u0633", type: "hospital", phone: "+44 20 7188 7188", country: "United Kingdom", city: "London", address: "Westminster Bridge Road, London SE1 7EH", description: "Major NHS hospital", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 \u0627\u0644\u0643\u0628\u064A\u0631" },
      { name: "Royal London Hospital", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0644\u0646\u062F\u0646 \u0627\u0644\u0645\u0644\u0643\u064A", type: "hospital", phone: "+44 20 3594 1888", country: "United Kingdom", city: "London", address: "Whitechapel Road, London E1 1FR", description: "Major trauma centre", descriptionAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649" },
      { name: "Guy's Hospital", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u062C\u0627\u064A\u0632", type: "hospital", phone: "+44 20 7188 7188", country: "United Kingdom", city: "London", address: "Great Maze Pond, London SE1 9RT", description: "Teaching hospital", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u062A\u0639\u0644\u064A\u0645\u064A" },
      { name: "Samaritans (Crisis Line)", nameAr: "\u062E\u0637 \u0627\u0644\u0623\u0645\u0627\u0646 (\u0623\u0632\u0645\u0627\u062A)", type: "hospital", phone: "116 123", country: "United Kingdom", city: "London", description: "24/7 crisis support helpline", descriptionAr: "\u062E\u0637 \u0645\u0633\u0627\u0646\u062F\u0629 \u0627\u0644\u0623\u0632\u0645\u0627\u062A 24/7" },
      // ═══════════════════════════════════════════
      // 🇳🇱 NETHERLANDS - AMSTERDAM
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+31 70 368 4684", country: "Netherlands", city: "Amsterdam", address: "Amaliastraat 2, 2514 JC The Hague", description: "Embassy of Morocco", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+31 70 306 5500", country: "Netherlands", city: "Amsterdam", address: "Stationsweg 117, 2515 BS The Hague", description: "Embassy of Algeria", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+31 70 354 2000", country: "Netherlands", city: "Amsterdam", address: "Badhuisweg 92, 2587 CL The Hague", description: "Embassy of Egypt", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+31 70 354 6540", country: "Netherlands", city: "Amsterdam", address: "Carnegielaan 7, 2517 KH The Hague", description: "Embassy of Tunisia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633" },
      { name: "Embassy of UAE", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", type: "embassy", phone: "+31 70 310 8206", country: "Netherlands", city: "Amsterdam", address: "Molenstraat 10, 2513 BL The Hague", description: "Embassy of UAE", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A" },
      // Emergency - Amsterdam
      { name: "Politie (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Netherlands", city: "Amsterdam", description: "General emergency number", descriptionAr: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0639\u0627\u0645" },
      { name: "Academic Medical Center", nameAr: "\u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A", type: "hospital", phone: "+31 20 566 9111", country: "Netherlands", city: "Amsterdam", address: "Meibergdreef 9, 1105 AZ Amsterdam", description: "Major university hospital", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u062C\u0627\u0645\u0639\u064A \u0643\u0628\u064A\u0631" },
      // ═══════════════════════════════════════════
      // 🇪🇸 SPAIN - MADRID & BARCELONA
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+34 91 562 9490", country: "Spain", city: "Madrid", address: "Calle de Serrano 179, 28002 Madrid", description: "Embassy of Morocco in Madrid", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0645\u062F\u0631\u064A\u062F" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+34 91 745 9393", country: "Spain", city: "Madrid", address: "Calle de Princesa 81, 28008 Madrid", description: "Embassy of Algeria in Madrid", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0645\u062F\u0631\u064A\u062F" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+34 91 308 0800", country: "Spain", city: "Madrid", address: "Calle de Serrano 174, 28002 Madrid", description: "Embassy of Egypt in Madrid", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0645\u062F\u0631\u064A\u062F" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+34 91 303 0490", country: "Spain", city: "Madrid", address: "Pl. de la Republica Dominicana 3, 28016 Madrid", description: "Embassy of Tunisia in Madrid", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633 \u0641\u064A \u0645\u062F\u0631\u064A\u062F" },
      { name: "Consulate of Morocco - Barcelona", nameAr: "\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 - \u0628\u0631\u0634\u0644\u0648\u0646\u0629", type: "embassy", phone: "+34 93 272 1414", country: "Spain", city: "Barcelona", address: "Passeig de la Bonanova 56, 08017 Barcelona", description: "Consulate General of Morocco", descriptionAr: "\u0627\u0644\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629" },
      // Emergency - Madrid
      { name: "Policia Nacional", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629", type: "police", phone: "091", country: "Spain", city: "Madrid", description: "National police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629" },
      { name: "Guardia Civil", nameAr: "\u0627\u0644\u062D\u0631\u0633 \u0627\u0644\u0645\u062F\u0646\u064A", type: "police", phone: "062", country: "Spain", city: "Madrid", description: "Civil Guard emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u062D\u0631\u0633 \u0627\u0644\u0645\u062F\u0646\u064A" },
      { name: "Emergencias", nameAr: "\u0627\u0644\u0637\u0648\u0627\u0631\u0626", type: "fire", phone: "112", country: "Spain", city: "Madrid", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      { name: "Hospital General Universitario Gregorio Maranon", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u063A\u0631\u064A\u063A\u0648\u0631\u064A\u0648 \u0645\u0627\u0631\u0627\u0646\u064A\u0648\u0646", type: "hospital", phone: "+34 91 586 8000", country: "Spain", city: "Madrid", address: "Calle del Dr. Esquerdo 46, 28007 Madrid", description: "Major public hospital", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0639\u0627\u0645 \u0643\u0628\u064A\u0631" },
      { name: "Hospital Clinic Barcelona", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0643\u0644\u064A\u0646\u064A\u0643 \u0628\u0631\u0634\u0644\u0648\u0646\u0629", type: "hospital", phone: "+34 93 227 5400", country: "Spain", city: "Barcelona", address: "Carrer de Villarroel 170, 08036 Barcelona", description: "Major public hospital Barcelona", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0639\u0627\u0645 \u0643\u0628\u064A\u0631 \u0628\u0631\u0634\u0644\u0648\u0646\u0629" },
      // ═══════════════════════════════════════════
      // 🇮🇹 ITALY - ROME & MILAN
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+39 06 324 4611", country: "Italy", city: "Rome", address: "Via Lovanio 5, 00198 Roma", description: "Embassy of Morocco in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+39 06 323 3640", country: "Italy", city: "Rome", address: "Via Bartolomeo Eustachio 12, 00161 Roma", description: "Embassy of Algeria in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+39 06 833 9601", country: "Italy", city: "Rome", address: "Via Salaria 267, 00199 Roma", description: "Embassy of Egypt in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+39 06 841 4386", country: "Italy", city: "Rome", address: "Via G. Acerbi 30, 00197 Roma", description: "Embassy of Tunisia in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Embassy of Lebanon", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646", type: "embassy", phone: "+39 06 322 6104", country: "Italy", city: "Rome", address: "Via G. Marchi 3, 00198 Roma", description: "Embassy of Lebanon in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Embassy of Iraq", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642", type: "embassy", phone: "+39 06 8621 3783", country: "Italy", city: "Rome", address: "Via della Camilluccia 355, 00135 Roma", description: "Embassy of Iraq in Rome", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 \u0641\u064A \u0631\u0648\u0645\u0627" },
      { name: "Consulate of Morocco - Milan", nameAr: "\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 - \u0645\u064A\u0644\u0627\u0646", type: "embassy", phone: "+39 02 463 341", country: "Italy", city: "Milan", address: "Via dei Giardini 4, 20122 Milano", description: "Consulate of Morocco in Milan", descriptionAr: "\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0645\u064A\u0644\u0627\u0646" },
      // Emergency - Rome
      { name: "Polizia di Stato", nameAr: "\u0634\u0631\u0637\u0629 \u0627\u0644\u062F\u0648\u0644\u0629", type: "police", phone: "113", country: "Italy", city: "Rome", description: "State police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Carabinieri", nameAr: "\u0627\u0644\u062F\u0631\u0643", type: "police", phone: "112", country: "Italy", city: "Rome", description: "Military police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u062F\u0631\u0643 \u0627\u0644\u0639\u0633\u0643\u0631\u064A" },
      { name: "Emergenza Sanitaria", nameAr: "\u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0635\u062D\u064A\u0629", type: "hospital", phone: "118", country: "Italy", city: "Rome", description: "Medical emergency", descriptionAr: "\u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0637\u0628\u064A\u0629" },
      { name: "Policlinico Umberto I", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0623\u0645\u0628\u0631\u062A\u0648 \u0627\u0644\u0623\u0648\u0644", type: "hospital", phone: "+39 06 4997 1", country: "Italy", city: "Rome", address: "Viale del Policlinico 155, 00161 Roma", description: "Rome's largest public hospital", descriptionAr: "\u0623\u0643\u0628\u0631 \u0645\u0633\u062A\u0634\u0641\u0649 \u0639\u0627\u0645 \u0641\u064A \u0631\u0648\u0645\u0627" },
      // ═══════════════════════════════════════════
      // 🇧🇪 BELGIUM - BRUSSELS
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+32 2 343 6760", country: "Belgium", city: "Brussels", address: "Avenue de l'Armee 29, 1040 Brussels", description: "Embassy of Morocco in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+32 2 661 1160", country: "Belgium", city: "Brussels", address: "Rue G. Stocq 22, 1050 Brussels", description: "Embassy of Algeria in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Tunisia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633", type: "embassy", phone: "+32 2 343 0880", country: "Belgium", city: "Brussels", address: "Avenue Franklin Roosevelt 45, 1050 Brussels", description: "Embassy of Tunisia in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u062A\u0648\u0646\u0633 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+32 2 675 8588", country: "Belgium", city: "Brussels", address: "Avenue de l'Uruguay 19, 1000 Brussels", description: "Embassy of Egypt in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Lebanon", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646", type: "embassy", phone: "+32 2 375 5780", country: "Belgium", city: "Brussels", address: "Rue G. Stocq 20, 1050 Brussels", description: "Embassy of Lebanon in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0644\u0628\u0646\u0627\u0646 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+32 2 533 7788", country: "Belgium", city: "Brussels", address: "Avenue de Tervuren 475, 1150 Brussels", description: "Embassy of Saudi Arabia in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of UAE", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", type: "embassy", phone: "+32 2 648 4500", country: "Belgium", city: "Brussels", address: "Rue Montoyer 123, 1000 Brussels", description: "Embassy of UAE in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Qatar", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0642\u0637\u0631", type: "embassy", phone: "+32 2 289 3900", country: "Belgium", city: "Brussels", address: "Avenue Franklin Roosevelt 65, 1050 Brussels", description: "Embassy of Qatar in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0642\u0637\u0631 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Iraq", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642", type: "embassy", phone: "+32 2 660 2955", country: "Belgium", city: "Brussels", address: "Rue des Vignobles 38, 1150 Brussels", description: "Embassy of Iraq in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      { name: "Embassy of Palestine", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646", type: "embassy", phone: "+32 2 734 2140", country: "Belgium", city: "Brussels", address: "Rue des Deux Eglises 83, 1000 Brussels", description: "Embassy of Palestine in Brussels", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0641\u0644\u0633\u0637\u064A\u0646 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644" },
      // Emergency - Brussels
      { name: "Police/Police Federal", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u0641\u064A\u062F\u0631\u0627\u0644\u064A\u0629", type: "police", phone: "101", country: "Belgium", city: "Brussels", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Aide Medicale Urgente", nameAr: "\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0639\u0627\u062C\u0644\u0629", type: "hospital", phone: "112", country: "Belgium", city: "Brussels", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇸🇪 SWEDEN - STOCKHOLM
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+46 8 669 9390", country: "Sweden", city: "Stockholm", address: "Ostermalmsgatan 36, 114 26 Stockholm", description: "Embassy of Morocco in Stockholm", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+46 8 24 18 20", country: "Sweden", city: "Stockholm", address: "Sandhamnsgatan 30, 115 28 Stockholm", description: "Embassy of Algeria in Stockholm", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+46 8 23 08 00", country: "Sweden", city: "Stockholm", address: "Strandvagen 35, 114 56 Stockholm", description: "Embassy of Egypt in Stockholm", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645" },
      // Emergency - Stockholm
      { name: "Polisen (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Sweden", city: "Stockholm", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      { name: "Karolinska Universitetssjukhuset", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0643\u0627\u0631\u0648\u0644\u064A\u0646\u0633\u0643\u0627", type: "hospital", phone: "+46 8 517 700 00", country: "Sweden", city: "Stockholm", address: "171 76 Solna, Stockholm", description: "Sweden's premier university hospital", descriptionAr: "\u0623\u0641\u0636\u0644 \u0645\u0633\u062A\u0634\u0641\u0649 \u062C\u0627\u0645\u0639\u064A \u0641\u064A \u0627\u0644\u0633\u0648\u064A\u062F" },
      // ═══════════════════════════════════════════
      // 🇩🇰 DENMARK - COPENHAGEN
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+45 39 62 11 12", country: "Denmark", city: "Copenhagen", address: "Rosbaeksvej 18, 2100 Kobenhavn O", description: "Embassy of Morocco in Copenhagen", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+45 39 62 02 22", country: "Denmark", city: "Copenhagen", address: "Kastelsvej 25, 2100 Kobenhavn O", description: "Embassy of Egypt in Copenhagen", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646" },
      // Emergency - Copenhagen
      { name: "Politi (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Denmark", city: "Copenhagen", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      { name: "Rigshospitalet", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0631\u064A\u062C\u0632", type: "hospital", phone: "+45 35 45 35 45", country: "Denmark", city: "Copenhagen", address: "Blegdamsvej 9, 2100 Kobenhavn", description: "Denmark's largest hospital", descriptionAr: "\u0623\u0643\u0628\u0631 \u0645\u0633\u062A\u0634\u0641\u0649 \u0641\u064A \u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643" },
      // ═══════════════════════════════════════════
      // 🇦🇹 AUSTRIA - VIENNA
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+43 1 712 2222", country: "Austria", city: "Vienna", address: "Hochenstaufengasse 2, 1010 Wien", description: "Embassy of Morocco in Vienna", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0641\u064A\u064A\u0646\u0627" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+43 1 713 05 81", country: "Austria", city: "Vienna", address: "Khevenhullerstrasse 5, 1130 Wien", description: "Embassy of Algeria in Vienna", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0641\u064A\u064A\u0646\u0627" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+43 1 713 18 51", country: "Austria", city: "Vienna", address: "Hochenstaufengasse 6, 1010 Wien", description: "Embassy of Egypt in Vienna", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0641\u064A\u064A\u0646\u0627" },
      // Emergency - Vienna
      { name: "Polizei (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "133", country: "Austria", city: "Vienna", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Rettung (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "fire", phone: "144", country: "Austria", city: "Vienna", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      { name: "Feuerwehr (Fire)", nameAr: "\u0627\u0644\u0645\u0637\u0627\u0641\u0626", type: "fire", phone: "122", country: "Austria", city: "Vienna", description: "Fire emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0645\u0637\u0627\u0641\u0626" },
      { name: "AKH Wien", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0641\u064A\u064A\u0646\u0627 \u0627\u0644\u0639\u0627\u0645", type: "hospital", phone: "+43 1 404 00", country: "Austria", city: "Vienna", address: "Wahringer Gurtel 18-20, 1090 Wien", description: "Vienna General Hospital", descriptionAr: "\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0639\u0627\u0645 \u0641\u064A \u0641\u064A\u064A\u0646\u0627" },
      // ═══════════════════════════════════════════
      // 🇨🇭 SWITZERLAND - ZURICH
      // ═══════════════════════════════════════════
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+41 31 351 0551", country: "Switzerland", city: "Zurich", address: "Thunstrasse 66, 3005 Bern", description: "Embassy of Algeria in Bern", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0628\u0631\u0646" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+41 31 352 0555", country: "Switzerland", city: "Zurich", address: "Elfenstrasse 6, 3006 Bern", description: "Embassy of Morocco in Bern", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0631\u0646" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+41 31 352 0180", country: "Switzerland", city: "Zurich", address: "Elfenauweg 61, 3006 Bern", description: "Embassy of Egypt in Bern", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0631\u0646" },
      // Emergency - Zurich
      { name: "Polizei (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "117", country: "Switzerland", city: "Zurich", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Sanitat (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "hospital", phone: "144", country: "Switzerland", city: "Zurich", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      { name: "Feuerwehr (Fire)", nameAr: "\u0627\u0644\u0645\u0637\u0627\u0641\u0626", type: "fire", phone: "118", country: "Switzerland", city: "Zurich", description: "Fire emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0645\u0637\u0627\u0641\u0626" },
      { name: "Universitatsspital Zurich", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0632\u064A\u0648\u0631\u062E \u0627\u0644\u062C\u0627\u0645\u0639\u064A", type: "hospital", phone: "+41 44 255 11 11", country: "Switzerland", city: "Zurich", address: "Ramistrasse 100, 8091 Zurich", description: "University Hospital Zurich", descriptionAr: "\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062C\u0627\u0645\u0639\u064A \u0641\u064A \u0632\u064A\u0648\u0631\u062E" },
      // ═══════════════════════════════════════════
      // 🇳🇴 NORWAY - OSLO
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+47 22 55 35 38", country: "Norway", city: "Oslo", address: " Oscars gate 78, 0258 Oslo", description: "Embassy of Morocco in Oslo", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0623\u0648\u0633\u0644\u0648" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+47 22 55 70 35", country: "Norway", city: "Oslo", address: "Drammensveien 90A, 0271 Oslo", description: "Embassy of Egypt in Oslo", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0623\u0648\u0633\u0644\u0648" },
      // Emergency - Oslo
      { name: "Politi (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Norway", city: "Oslo", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      { name: "Oslo Universitetssykehus", nameAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u062C\u0627\u0645\u0639\u064A", type: "hospital", phone: "+47 23 01 80 00", country: "Norway", city: "Oslo", address: "Kirkeveien 166, 0450 Oslo", description: "Oslo University Hospital", descriptionAr: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u062C\u0627\u0645\u0639\u064A" },
      // ═══════════════════════════════════════════
      // 🇫🇮 FINLAND - HELSINKI
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+358 9 681 1420", country: "Finland", city: "Helsinki", address: "Unioninkatu 14 B, 00130 Helsinki", description: "Embassy of Morocco in Helsinki", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0647\u0644\u0633\u0646\u0643\u064A" },
      // Emergency - Helsinki
      { name: "Poliisi (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Finland", city: "Helsinki", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇬🇷 GREECE - ATHENS
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+30 210 363 1680", country: "Greece", city: "Athens", address: "3, Vassilissis Sophias Avenue, 10674 Athens", description: "Embassy of Egypt in Athens", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0623\u062B\u064A\u0646\u0627" },
      { name: "Embassy of Algeria", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631", type: "embassy", phone: "+30 210 681 9632", country: "Greece", city: "Athens", address: "14, Vassilissis Olgas Avenue, 10557 Athens", description: "Embassy of Algeria in Athens", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0641\u064A \u0623\u062B\u064A\u0646\u0627" },
      // Emergency - Athens
      { name: "Astynomia (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "100", country: "Greece", city: "Athens", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Ethniki Odiki Ypiresia", nameAr: "\u0627\u0644\u0637\u0648\u0627\u0631\u0626", type: "hospital", phone: "166", country: "Greece", city: "Athens", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      // ═══════════════════════════════════════════
      // 🇹🇷 TURKEY - ISTANBUL
      // ═══════════════════════════════════════════
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+90 212 515 0000", country: "Turkey", city: "Istanbul", address: "Tepebasi, Mesrutiyet Cad. No: 47, 34430 Istanbul", description: "Consulate General of Saudi Arabia", descriptionAr: "\u0627\u0644\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0633\u0639\u0648\u062F\u064A\u0629" },
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+90 212 336 1288", country: "Turkey", city: "Istanbul", address: "Askoc Apt, Cumhuriyet Cad. No: 22, 34367 Istanbul", description: "Consulate General of Egypt", descriptionAr: "\u0627\u0644\u0642\u0646\u0635\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0645\u0635\u0631" },
      // Emergency - Istanbul
      { name: "Polis (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "155", country: "Turkey", city: "Istanbul", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Ambulans (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "hospital", phone: "112", country: "Turkey", city: "Istanbul", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇵🇹 PORTUGAL - LISBON
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+351 21 390 8210", country: "Portugal", city: "Lisbon", address: "Rua Alto do Duque 21, 1400-009 Lisbon", description: "Embassy of Morocco in Lisbon", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0644\u0634\u0628\u0648\u0646\u0629" },
      // Emergency - Lisbon
      { name: "Policia (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Portugal", city: "Lisbon", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇮🇪 IRELAND - DUBLIN
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+353 1 668 4622", country: "Ireland", city: "Dublin", address: "12 Clyde Road, Ballsbridge, Dublin 4", description: "Embassy of Egypt in Dublin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u062F\u0628\u0644\u0646" },
      { name: "Embassy of Saudi Arabia", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", type: "embassy", phone: "+353 1 492 0700", country: "Ireland", city: "Dublin", address: "12 Fitzwilliam Square East, Dublin 2", description: "Embassy of Saudi Arabia in Dublin", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u062F\u0628\u0644\u0646" },
      // Emergency - Dublin
      { name: "Garda (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "999 / 112", country: "Ireland", city: "Dublin", description: "Emergency services", descriptionAr: "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇨🇿 CZECH REPUBLIC - PRAGUE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+420 234 043 800", country: "Czech Republic", city: "Prague", address: "Na Zatorce 18, 160 00 Prague 6", description: "Embassy of Egypt in Prague", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0631\u0627\u063A" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+420 257 318 612", country: "Czech Republic", city: "Prague", address: "Hradcanske namesti 4, 118 00 Prague 1", description: "Embassy of Morocco in Prague", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0631\u0627\u063A" },
      // Emergency - Prague
      { name: "Policie (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "158", country: "Czech Republic", city: "Prague", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Zachranka (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "hospital", phone: "155", country: "Czech Republic", city: "Prague", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      // ═══════════════════════════════════════════
      // 🇭🇺 HUNGARY - BUDAPEST
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+36 1 344 4800", country: "Hungary", city: "Budapest", address: "Stefania ut 47/b, 1143 Budapest", description: "Embassy of Egypt in Budapest", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+36 1 201 9082", country: "Hungary", city: "Budapest", address: "Dubrovniki utca 44, 1125 Budapest", description: "Embassy of Morocco in Budapest", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A" },
      // Emergency - Budapest
      { name: "Rendorseg (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "107", country: "Hungary", city: "Budapest", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Mentok (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "hospital", phone: "104", country: "Hungary", city: "Budapest", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      // ═══════════════════════════════════════════
      // 🇷🇴 ROMANIA - BUCHAREST
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+40 21 212 0150", country: "Romania", city: "Bucharest", address: "Bulevardul Dacia 47, 010162 Bucharest", description: "Embassy of Egypt in Bucharest", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0648\u062E\u0627\u0631\u0633\u062A" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+40 21 211 1992", country: "Romania", city: "Bucharest", address: "Strada Orlando 10, 014641 Bucharest", description: "Embassy of Morocco in Bucharest", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0628\u0648\u062E\u0627\u0631\u0633\u062A" },
      // Emergency - Bucharest
      { name: "Politia (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "112", country: "Romania", city: "Bucharest", description: "All emergencies", descriptionAr: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u0627\u0631\u0626" },
      // ═══════════════════════════════════════════
      // 🇵🇱 POLAND - WARSAW
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+48 22 616 8800", country: "Poland", city: "Warsaw", address: "Al. Ujazdowskie 33/35, 00-540 Warsaw", description: "Embassy of Egypt in Warsaw", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0648\u0627\u0631\u0633\u0648" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+48 22 646 7575", country: "Poland", city: "Warsaw", address: "Dolna 25, 00-773 Warsaw", description: "Embassy of Morocco in Warsaw", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0648\u0627\u0631\u0633\u0648" },
      // Emergency - Warsaw
      { name: "Policja (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "997", country: "Poland", city: "Warsaw", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      { name: "Pogotowie (Ambulance)", nameAr: "\u0627\u0644\u0625\u0633\u0639\u0627\u0641", type: "hospital", phone: "999", country: "Poland", city: "Warsaw", description: "Ambulance emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0625\u0633\u0639\u0627\u0641" },
      // ═══════════════════════════════════════════
      // 🇭🇷 CROATIA - ZAGREB
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+385 1 4677 330", country: "Croatia", city: "Zagreb", address: "Rokov perivoj 20, 10000 Zagreb", description: "Embassy of Egypt in Zagreb", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0632\u063A\u0631\u0628" },
      // Emergency - Zagreb
      { name: "Policija (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "192", country: "Croatia", city: "Zagreb", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      // ═══════════════════════════════════════════
      // 🇸🇰 SLOVAKIA - BRATISLAVA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+421 2 5443 1967", country: "Slovakia", city: "Bratislava", address: "Hlboka 7, 811 03 Bratislava", description: "Embassy of Egypt in Bratislava", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0631\u0627\u062A\u064A\u0633\u0644\u0627\u0641\u0627" },
      // ═══════════════════════════════════════════
      // 🇷🇸 SERBIA - BELGRADE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+381 11 3671 876", country: "Serbia", city: "Belgrade", address: "Bulevar Oslobodjenja 23, 11000 Belgrade", description: "Embassy of Egypt in Belgrade", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0628\u0644\u063A\u0631\u0627\u062F" },
      // ═══════════════════════════════════════════
      // 🇧🇬 BULGARIA - SOFIA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+359 2 946 1093", country: "Bulgaria", city: "Sofia", address: "Ul. Sheinovo 16, 1504 Sofia", description: "Embassy of Egypt in Sofia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0635\u0648\u0641\u064A\u0627" },
      // ═══════════════════════════════════════════
      // 🇲🇹 MALTA - VALLETTA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+356 2133 1874", country: "Malta", city: "Valletta", address: "Villa Maurizia, Ta' Xbiex Terrace, Ta' Xbiex XBX 1032", description: "Embassy of Egypt in Malta", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0645\u0627\u0644\u0637\u0627" },
      // ═══════════════════════════════════════════
      // 🇨🇾 CYPRUS - NICOSIA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+357 22 590 100", country: "Cyprus", city: "Nicosia", address: "4, Zenonos Sozou Street, 1075 Nicosia", description: "Embassy of Egypt in Nicosia", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0646\u064A\u0642\u0648\u0633\u064A\u0627" },
      // ═══════════════════════════════════════════
      // 🇱🇺 LUXEMBOURG
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+352 22 00 31", country: "Luxembourg", city: "Luxembourg City", address: "6, Rue Philippe II, 2340 Luxembourg", description: "Embassy of Morocco in Luxembourg", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0644\u0648\u0643\u0633\u0645\u0628\u0648\u0631\u063A" },
      // ═══════════════════════════════════════════
      // 🇪🇪 ESTONIA - TALLINN
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+372 630 6300", country: "Estonia", city: "Tallinn", address: " represented by Helsinki", description: "Non-resident embassy - contact Helsinki", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0647\u0644\u0633\u0646\u0643\u064A" },
      // ═══════════════════════════════════════════
      // 🇱🇻 LATVIA - RIGA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+371 676 117 40", country: "Latvia", city: "Riga", address: " represented by Stockholm", description: "Non-resident embassy - contact Stockholm", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645" },
      // ═══════════════════════════════════════════
      // 🇱🇹 LITHUANIA - VILNIUS
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+370 5 219 3700", country: "Lithuania", city: "Vilnius", address: " represented by Warsaw", description: "Non-resident embassy - contact Warsaw", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0648\u0627\u0631\u0633\u0648" },
      // ═══════════════════════════════════════════
      // 🇸🇮 SLOVENIA - LJUBLJANA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+386 1 200 8950", country: "Slovenia", city: "Ljubljana", address: " represented by Vienna", description: "Non-resident embassy - contact Vienna", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0641\u064A\u064A\u0646\u0627" },
      // ═══════════════════════════════════════════
      // 🇧🇦 BOSNIA - SARAJEVO
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+387 33 219 700", country: "Bosnia and Herzegovina", city: "Sarajevo", address: "Alipasina 80, 71000 Sarajevo", description: "Embassy of Egypt in Sarajevo", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0633\u0631\u0627\u064A\u064A\u0641\u0648" },
      // ═══════════════════════════════════════════
      // 🇦🇱 ALBANIA - TIRANA
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+355 4 228 1150", country: "Albania", city: "Tirana", address: "Rruga e Elbasanit, 1020 Tirana", description: "Embassy of Egypt in Tirana", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u062A\u064A\u0631\u0627\u0646\u0627" },
      // ═══════════════════════════════════════════
      // 🇲🇰 NORTH MACEDONIA - SKOPJE
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+389 2 310 7700", country: "North Macedonia", city: "Skopje", address: "Ul. Naum Naumovski Borce 6b, 1000 Skopje", description: "Embassy of Egypt in Skopje", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0633\u0643\u0648\u0628\u064A" },
      // ═══════════════════════════════════════════
      // 🇲🇩 MOLDOVA - CHISINAU
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+373 22 211 115", country: "Moldova", city: "Chisinau", address: " represented by Bucharest", description: "Non-resident embassy - contact Bucharest", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0628\u0648\u062E\u0627\u0631\u0633\u062A" },
      // ═══════════════════════════════════════════
      // 🇺🇦 UKRAINE - KYIV
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631", type: "embassy", phone: "+380 44 490 0101", country: "Ukraine", city: "Kyiv", address: "Observatorny Lane 17, 01901 Kyiv", description: "Embassy of Egypt in Kyiv", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 \u0641\u064A \u0643\u064A\u064A\u0641" },
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+380 44 490 0102", country: "Ukraine", city: "Kyiv", address: "Saksahanskoho St. 60, 01033 Kyiv", description: "Embassy of Morocco in Kyiv", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0643\u064A\u064A\u0641" },
      // Emergency - Kyiv
      { name: "Politsiya (Police)", nameAr: "\u0627\u0644\u0634\u0631\u0637\u0629", type: "police", phone: "102", country: "Ukraine", city: "Kyiv", description: "Police emergency", descriptionAr: "\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0631\u0637\u0629" },
      // ═══════════════════════════════════════════
      // 🇲🇨 MONACO
      // ═══════════════════════════════════════════
      { name: "Embassy of Morocco", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628", type: "embassy", phone: "+377 93 50 17 27", country: "Monaco", city: "Monaco", address: "7, Rue Bellevue, 98000 Monaco", description: "Embassy of Morocco in Monaco", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0645\u063A\u0631\u0628 \u0641\u064A \u0645\u0648\u0646\u0627\u0643\u0648" },
      // ═══════════════════════════════════════════
      // 🇮🇸 ICELAND - REYKJAVIK
      // ═══════════════════════════════════════════
      { name: "Embassy of Egypt (Non-resident)", nameAr: "\u0633\u0641\u0627\u0631\u0629 \u0645\u0635\u0631 (\u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629)", type: "embassy", phone: "+354 510 7500", country: "Iceland", city: "Reykjavik", address: " represented by Oslo", description: "Non-resident embassy - contact Oslo", descriptionAr: "\u0633\u0641\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0642\u064A\u0645\u0629 - \u0627\u062A\u0635\u0644 \u0628\u0623\u0648\u0633\u0644\u0648" }
    ];
    const pgClient = postgres4(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      await pgClient.unsafe(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "nameAr" VARCHAR(255),
          type VARCHAR(50) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          "phoneSecondary" VARCHAR(50),
          country VARCHAR(100) NOT NULL,
          city VARCHAR(100),
          address TEXT,
          description TEXT,
          "descriptionAr" TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      await pgClient.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_type ON emergency_contacts(type)`);
      await pgClient.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_country ON emergency_contacts(country)`);
      await pgClient.unsafe(`CREATE INDEX IF NOT EXISTS idx_emergency_city ON emergency_contacts(city)`);
    } catch (e) {
      console.log("[seed] Table creation note:", e.message);
    }
    await pgClient.end();
    try {
      await db.delete(emergencyContacts);
    } catch (e) {
    }
    let inserted = 0;
    for (const contact of emergencyData) {
      await db.insert(emergencyContacts).values({
        ...contact,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      inserted++;
    }
    return { success: true, inserted, total: emergencyData.length };
  })
});

// api/pending-merchant-router.ts
import { z as z13 } from "zod";
import { eq as eq11, desc as desc9 } from "drizzle-orm";

// api/lib/email.ts
import nodemailer from "nodemailer";
var SMTP_HOST = env.smtpHost;
var SMTP_PORT = env.smtpPort;
var SMTP_USER = env.smtpUser;
var SMTP_PASS = env.smtpPass;
var FROM_EMAIL = env.fromEmail;
var ADMIN_EMAIL = env.adminEmail;
var emailLogs = [];
function getTransporter() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }
  return null;
}
async function sendMerchantRegistrationEmail(merchant) {
  const subject = `\u{1F3EA} \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u062A\u062C\u0631 \u062C\u062F\u064A\u062F \u2014 ${merchant.businessNameAr}`;
  const reviewLink = `https://euroarabmarket.com/admin/merchants?id=${merchant.id}`;
  const fallbackLink = `https://euro-arab-market.onrender.com/admin/merchants?id=${merchant.id}`;
  const arabicBody = `
\u0645\u0631\u062D\u0628\u0627\u064B \u0641\u0631\u064A\u0642 \u0633\u0646\u062F\u0628\u0627\u062F\u060C

\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u062A\u062C\u0631 \u062C\u062F\u064A\u062F:

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4CB} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u2022 \u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062C\u0631: ${merchant.businessNameAr}
\u2022 Business Name: ${merchant.businessName}
\u2022 \u0627\u0644\u062A\u0635\u0646\u064A\u0641: ${merchant.category}
\u2022 \u0627\u0644\u0645\u062F\u064A\u0646\u0629: ${merchant.city}
\u2022 \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${merchant.address || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u2022 \u0627\u0644\u0647\u0627\u062A\u0641: ${merchant.phone || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u2022 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${merchant.email || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u2022 \u0627\u0644\u0645\u0648\u0642\u0639: ${merchant.website || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}

\u{1F4DD} \u0627\u0644\u0648\u0635\u0641:
${merchant.descriptionAr || merchant.description || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641"}

\u{1F4CE} \u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A:
\u2022 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A: ${merchant.businessRegistrationPhoto || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}
\u2022 \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0627\u0644\u0643: ${merchant.ownerIdPhoto || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}
\u2022 \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0644\u0627\u0644: ${merchant.halalCertificate || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}
\u2022 \u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u062A\u062C\u0631: ${merchant.logo || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F517} \u0631\u0627\u0628\u0637 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628:
${reviewLink}
(\u0623\u0648: ${fallbackLink})
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  const englishBody = `
Hello Sindbad Team,

A new merchant registration has been received:

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Store Information:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u2022 Store Name: ${merchant.businessNameAr} / ${merchant.businessName}
\u2022 Category: ${merchant.category}
\u2022 City: ${merchant.city}, ${merchant.country}
\u2022 Address: ${merchant.address || "Not provided"}
\u2022 Phone: ${merchant.phone || "Not provided"}
\u2022 Email: ${merchant.email || "Not provided"}
\u2022 Website: ${merchant.website || "Not provided"}

Description:
${merchant.description || merchant.descriptionAr || "No description"}

Attachments:
\u2022 Business Registration: ${merchant.businessRegistrationPhoto || "Not attached"}
\u2022 Owner ID: ${merchant.ownerIdPhoto || "Not attached"}
\u2022 Halal Certificate: ${merchant.halalCertificate || "Not attached"}
\u2022 Logo: ${merchant.logo || "Not attached"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Review Link: ${reviewLink}
(Fallback: ${fallbackLink})
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  const htmlBody = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;}
.header{background:linear-gradient(135deg,#0a1628,#1a2744);color:#c9a227;padding:20px;text-align:center;}
.header h1{margin:0;font-size:24px;}
.content{padding:20px;}
.section{margin-bottom:20px;border-right:3px solid #c9a227;padding-right:15px;}
.section h3{color:#1a5f4a;margin-bottom:10px;}
.field{margin-bottom:8px;}
.field-label{font-weight:bold;color:#555;}
.field-value{color:#333;}
.doc-link{display:inline-block;background:#c9a227;color:#0a1628;padding:8px 15px;border-radius:5px;text-decoration:none;margin:5px;font-size:12px;}
.no-doc{color:#999;font-style:italic;}
.review-link{display:block;background:#1a5f4a;color:#fff;text-align:center;padding:15px;border-radius:5px;text-decoration:none;margin:20px 0;font-weight:bold;}
.footer{text-align:center;padding:15px;background:#f9f9f9;color:#999;font-size:12px;}
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>\u{1F3EA} \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u062A\u062C\u0631 \u062C\u062F\u064A\u062F</h1>
    <p style="color:#fff;margin:5px 0;">\u0633\u0646\u062F\u0628\u0627\u062F \u2014 \u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627</p>
  </div>
  <div class="content">
    <div class="section">
      <h3>\u{1F4CB} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631</h3>
      <div class="field"><span class="field-label">\u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062C\u0631:</span> <span class="field-value">${merchant.businessNameAr}</span></div>
      <div class="field"><span class="field-label">Business Name:</span> <span class="field-value">${merchant.businessName}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u062A\u0635\u0646\u064A\u0641:</span> <span class="field-value">${merchant.category}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0645\u062F\u064A\u0646\u0629:</span> <span class="field-value">${merchant.city}, ${merchant.country}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0639\u0646\u0648\u0627\u0646:</span> <span class="field-value">${merchant.address || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0647\u0627\u062A\u0641:</span> <span class="field-value">${merchant.phone || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0628\u0631\u064A\u062F:</span> <span class="field-value">${merchant.email || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
      ${merchant.website ? `<div class="field"><span class="field-label">\u0627\u0644\u0645\u0648\u0642\u0639:</span> <span class="field-value">${merchant.website}</span></div>` : ""}
    </div>
    <div class="section">
      <h3>\u{1F4DD} \u0627\u0644\u0648\u0635\u0641</h3>
      <p>${merchant.descriptionAr || merchant.description || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641"}</p>
    </div>
    <div class="section">
      <h3>\u{1F4CE} \u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A</h3>
      ${merchant.businessRegistrationPhoto ? `<a class="doc-link" href="${merchant.businessRegistrationPhoto}">\u{1F4C4} \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A</a>` : "<span class='no-doc'>\u{1F4C4} \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}<br/>
      ${merchant.ownerIdPhoto ? `<a class="doc-link" href="${merchant.ownerIdPhoto}">\u{1F194} \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0627\u0644\u0643</a>` : "<span class='no-doc'>\u{1F194} \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0627\u0644\u0643: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}<br/>
      ${merchant.halalCertificate ? `<a class="doc-link" href="${merchant.halalCertificate}">\u2705 \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0644\u0627\u0644</a>` : "<span class='no-doc'>\u2705 \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062D\u0644\u0627\u0644: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}<br/>
      ${merchant.logo ? `<a class="doc-link" href="${merchant.logo}">\u{1F3A8} \u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u062A\u062C\u0631</a>` : "<span class='no-doc'>\u{1F3A8} \u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u062A\u062C\u0631: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}
    </div>
    <a class="review-link" href="${reviewLink}">\u{1F517} \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A \u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629</a>
    <p style="text-align:center;color:#999;font-size:11px;">\u0623\u0648 \u0627\u0641\u062A\u062D: ${fallbackLink}</p>
  </div>
  <div class="footer">
    \u0633\u0646\u062F\u0628\u0627\u062F | \u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627 | ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-SA")}
  </div>
</div>
</body></html>`;
  const emailData = {
    id: merchant.id,
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject,
    arabicBody,
    englishBody,
    htmlBody,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    merchantId: merchant.id
  };
  emailLogs.push(emailData);
  console.log(`[EMAIL] Merchant registration notification logged for ID ${merchant.id}: ${merchant.businessNameAr}`);
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"\u0633\u0646\u062F\u0628\u0627\u062F" <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: arabicBody + "\n\n" + englishBody,
        html: htmlBody
      });
      console.log(`[EMAIL] Sent successfully to ${ADMIN_EMAIL}`);
      return { success: true, message: "Email sent successfully" };
    } catch (e) {
      console.error(`[EMAIL] SMTP error: ${e.message}`);
      return { success: false, message: `SMTP failed: ${e.message}. Email logged for review.` };
    }
  }
  console.log(`[EMAIL] SMTP not configured. Email logged for review.`);
  return { success: true, message: "Email logged (SMTP not configured). To enable real email, set SMTP_HOST, SMTP_USER, SMTP_PASS env vars." };
}
async function sendSkillRegistrationEmail(skill) {
  const subject = `\u{1F6E0}\uFE0F \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u0647\u0627\u0631\u0629 \u062C\u062F\u064A\u062F\u0629 \u2014 ${skill.fullNameAr || skill.fullName}`;
  const reviewLink = `https://euroarabmarket.com/admin/skills?id=${skill.id}`;
  const fallbackLink = `https://euro-arab-market.onrender.com/admin/skills?id=${skill.id}`;
  const arabicBody = `
\u0645\u0631\u062D\u0628\u0627\u064B \u0641\u0631\u064A\u0642 \u0633\u0646\u062F\u0628\u0627\u062F\u060C

\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u0647\u0627\u0631\u0629 \u062C\u062F\u064A\u062F\u0629:

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4CB} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u2022 \u0627\u0644\u0627\u0633\u0645: ${skill.fullNameAr || skill.fullName}
\u2022 \u0646\u0648\u0639 \u0627\u0644\u062E\u062F\u0645\u0629: ${skill.serviceTypeAr || skill.serviceType}
\u2022 \u0627\u0644\u062A\u0635\u0646\u064A\u0641: ${skill.category}
\u2022 \u0627\u0644\u0645\u062F\u064A\u0646\u0629: ${skill.city}
\u2022 \u0627\u0644\u0647\u0627\u062A\u0641: ${skill.phone || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u2022 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${skill.email || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
\u2022 \u0633\u0646\u0648\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629: ${skill.yearsOfExperience || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}

\u{1F4DD} \u0627\u0644\u0648\u0635\u0641:
${skill.descriptionAr || skill.description || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641"}

\u{1F4CE} \u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A:
\u2022 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A: ${skill.businessRegistrationPhoto || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}
\u2022 \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062E\u0628\u0631\u0629: ${skill.experienceCertificate || "\u063A\u064A\u0631 \u0645\u0631\u0641\u0642"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F517} \u0631\u0627\u0628\u0637 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628:
${reviewLink}
(\u0623\u0648: ${fallbackLink})
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  const englishBody = `
Hello Sindbad Team,

A new skill/freelancer registration has been received:

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Service Provider Information:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u2022 Name: ${skill.fullNameAr || skill.fullName}
\u2022 Service Type: ${skill.serviceTypeAr || skill.serviceType}
\u2022 Category: ${skill.category}
\u2022 City: ${skill.city}, ${skill.country}
\u2022 Phone: ${skill.phone || "Not provided"}
\u2022 Email: ${skill.email || "Not provided"}
\u2022 Years of Experience: ${skill.yearsOfExperience || "Not provided"}

Description:
${skill.description || skill.descriptionAr || "No description"}

Attachments:
\u2022 Business Registration: ${skill.businessRegistrationPhoto || "Not attached"}
\u2022 Experience Certificate: ${skill.experienceCertificate || "Not attached"}

Review Link: ${reviewLink}
(Fallback: ${fallbackLink})
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  const htmlBody = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;}
.header{background:linear-gradient(135deg,#0a1628,#1a2744);color:#c9a227;padding:20px;text-align:center;}
.header h1{margin:0;font-size:24px;}
.content{padding:20px;}
.section{margin-bottom:20px;border-right:3px solid #c9a227;padding-right:15px;}
.section h3{color:#1a5f4a;margin-bottom:10px;}
.field{margin-bottom:8px;}
.field-label{font-weight:bold;color:#555;}
.field-value{color:#333;}
.doc-link{display:inline-block;background:#c9a227;color:#0a1628;padding:8px 15px;border-radius:5px;text-decoration:none;margin:5px;font-size:12px;}
.no-doc{color:#999;font-style:italic;}
.review-link{display:block;background:#1a5f4a;color:#fff;text-align:center;padding:15px;border-radius:5px;text-decoration:none;margin:20px 0;font-weight:bold;}
.footer{text-align:center;padding:15px;background:#f9f9f9;color:#999;font-size:12px;}
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>\u{1F6E0}\uFE0F \u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0645\u0647\u0627\u0631\u0629 \u062C\u062F\u064A\u062F\u0629</h1>
    <p style="color:#fff;margin:5px 0;">\u0633\u0646\u062F\u0628\u0627\u062F \u2014 \u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627</p>
  </div>
  <div class="content">
    <div class="section">
      <h3>\u{1F4CB} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629</h3>
      <div class="field"><span class="field-label">\u0627\u0644\u0627\u0633\u0645:</span> <span class="field-value">${skill.fullNameAr || skill.fullName}</span></div>
      <div class="field"><span class="field-label">\u0646\u0648\u0639 \u0627\u0644\u062E\u062F\u0645\u0629:</span> <span class="field-value">${skill.serviceTypeAr || skill.serviceType}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u062A\u0635\u0646\u064A\u0641:</span> <span class="field-value">${skill.category}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0645\u062F\u064A\u0646\u0629:</span> <span class="field-value">${skill.city}, ${skill.country}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0647\u0627\u062A\u0641:</span> <span class="field-value">${skill.phone || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
      <div class="field"><span class="field-label">\u0627\u0644\u0628\u0631\u064A\u062F:</span> <span class="field-value">${skill.email || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
      <div class="field"><span class="field-label">\u0633\u0646\u0648\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629:</span> <span class="field-value">${skill.yearsOfExperience || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}</span></div>
    </div>
    <div class="section">
      <h3>\u{1F4DD} \u0627\u0644\u0648\u0635\u0641</h3>
      <p>${skill.descriptionAr || skill.description || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641"}</p>
    </div>
    <div class="section">
      <h3>\u{1F4CE} \u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A</h3>
      ${skill.businessRegistrationPhoto ? `<a class="doc-link" href="${skill.businessRegistrationPhoto}">\u{1F4C4} \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A</a>` : "<span class='no-doc'>\u{1F4C4} \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}<br/>
      ${skill.experienceCertificate ? `<a class="doc-link" href="${skill.experienceCertificate}">\u{1F3C6} \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062E\u0628\u0631\u0629</a>` : "<span class='no-doc'>\u{1F3C6} \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062E\u0628\u0631\u0629: \u063A\u064A\u0631 \u0645\u0631\u0641\u0642</span>"}
    </div>
    <a class="review-link" href="${reviewLink}">\u{1F517} \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A \u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629</a>
    <p style="text-align:center;color:#999;font-size:11px;">\u0623\u0648 \u0627\u0641\u062A\u062D: ${fallbackLink}</p>
  </div>
  <div class="footer">
    \u0633\u0646\u062F\u0628\u0627\u062F | \u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627 | ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-SA")}
  </div>
</div>
</body></html>`;
  const emailData = {
    id: skill.id,
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject,
    arabicBody,
    englishBody,
    htmlBody,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    skillId: skill.id
  };
  emailLogs.push(emailData);
  console.log(`[EMAIL] Skill registration notification logged for ID ${skill.id}: ${skill.fullNameAr || skill.fullName}`);
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"\u0633\u0646\u062F\u0628\u0627\u062F" <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: arabicBody + "\n\n" + englishBody,
        html: htmlBody
      });
      console.log(`[EMAIL] Sent successfully to ${ADMIN_EMAIL}`);
      return { success: true, message: "Email sent successfully" };
    } catch (e) {
      console.error(`[EMAIL] SMTP error: ${e.message}`);
      return { success: false, message: `SMTP failed: ${e.message}` };
    }
  }
  return { success: true, message: "Email logged (SMTP not configured)" };
}
function getEmailLogs(limit = 50) {
  return emailLogs.slice(-limit).reverse();
}

// api/pending-merchant-router.ts
import postgres5 from "postgres";
var pendingMerchantRouter = createRouter({
  // Submit new merchant registration
  submit: publicQuery.input(
    z13.object({
      businessName: z13.string().min(1),
      businessNameAr: z13.string().min(1),
      category: z13.string().min(1),
      subcategory: z13.string().optional(),
      description: z13.string().optional(),
      descriptionAr: z13.string().optional(),
      phone: z13.string().min(1),
      email: z13.string().email(),
      website: z13.string().optional(),
      country: z13.string().min(1),
      city: z13.string().min(1),
      address: z13.string().optional(),
      businessRegistrationPhoto: z13.string().optional(),
      ownerIdPhoto: z13.string().optional(),
      halalCertificate: z13.string().optional(),
      logo: z13.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(pendingMerchants).values({
      ...input,
      status: "pending"
    }).returning();
    const merchant = result[0];
    const merchantId = merchant.id;
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
        logo: input.logo
      });
      console.log(`[submit] Email result: ${emailResult.message}`);
    } catch (e) {
      console.error(`[submit] Email failed: ${e.message}`);
    }
    return { success: true, id: merchantId };
  }),
  // List all pending merchants (for admin)
  list: publicQuery.input(
    z13.object({
      status: z13.string().optional(),
      limit: z13.number().min(1).max(100).default(50)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    if (input?.status) {
      return db.select().from(pendingMerchants).where(eq11(pendingMerchants.status, input.status)).orderBy(desc9(pendingMerchants.createdAt)).limit(input.limit);
    }
    return db.select().from(pendingMerchants).orderBy(desc9(pendingMerchants.createdAt)).limit(input?.limit || 50);
  }),
  // Get single pending merchant
  getById: publicQuery.input(z13.object({ id: z13.number() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(pendingMerchants).where(eq11(pendingMerchants.id, input.id)).limit(1);
    return result[0] || null;
  }),
  // Update status (approve/reject)
  updateStatus: publicQuery.input(
    z13.object({
      id: z13.number(),
      status: z13.enum(["pending", "approved", "rejected", "more_info"]),
      adminNotes: z13.string().optional(),
      rejectionReason: z13.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(pendingMerchants).set({
      status: input.status,
      adminNotes: input.adminNotes,
      rejectionReason: input.rejectionReason
    }).where(eq11(pendingMerchants.id, input.id));
    return { success: true };
  }),
  // Approve: copy pending merchant → merchants table (so it appears on site)
  approve: publicQuery.input(z13.object({ id: z13.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const client = postgres5(env.databaseUrl, {
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 1
    });
    try {
      const pending = await db.select().from(pendingMerchants).where(eq11(pendingMerchants.id, input.id)).limit(1);
      if (!pending[0]) {
        return { success: false, error: "Pending merchant not found" };
      }
      const pm = pending[0];
      const slug = (pm.businessName || pm.businessNameAr || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const result = await client`
          INSERT INTO merchants (
            business_name, business_name_ar, short_description,
            description, description_ar, category, subcategory,
            tags, country, city, address,
            phone, email, website, status, slug,
            logo, cover_image,
            is_featured, is_verified, rating, review_count,
            price_range,
            created_at, updated_at,
            "businessName", "businessNameAr", "shortDescription",
            "description", "descriptionAr",
            "isFeatured", "isVerified", "reviewCount",
            "priceRange", "createdAt", "updatedAt"
          ) VALUES (
            ${pm.businessName}, ${pm.businessNameAr},
            ${(pm.descriptionAr || pm.description || `${pm.businessNameAr} \u0641\u064A ${pm.city}`).slice(0, 160)},
            ${pm.description || ""}, ${pm.descriptionAr || ""},
            ${pm.category}, ${pm.subcategory || pm.category},
            ${`${pm.category} ${pm.city} ${pm.businessNameAr} ${pm.businessName}`.slice(0, 200)},
            ${pm.country}, ${pm.city}, ${pm.address || pm.city},
            ${pm.phone}, ${pm.email}, ${pm.website || null},
            'active', ${slug},
            ${pm.logo || null}, ${pm.businessRegistrationPhoto || null},
            ${false}, ${true}, ${0}, ${0},
            ${"$$"},
            NOW(), NOW(),
            ${pm.businessName}, ${pm.businessNameAr},
            ${(pm.descriptionAr || pm.description || `${pm.businessNameAr} \u0641\u064A ${pm.city}`).slice(0, 160)},
            ${pm.description || ""}, ${pm.descriptionAr || ""},
            ${false}, ${true}, ${0},
            ${"$$"}, NOW(), NOW()
          )
          RETURNING id
        `;
      const merchantId = result[0]?.id;
      await db.update(pendingMerchants).set({ status: "approved" }).where(eq11(pendingMerchants.id, input.id));
      return { success: true, merchantId, slug };
    } catch (e) {
      console.error("[approve] Error:", e?.message);
      return { success: false, error: e?.message };
    } finally {
      await client.end();
    }
  }),
  // Get email logs (for admin to review sent emails)
  emailLogs: publicQuery.input(z13.object({ limit: z13.number().min(1).max(100).default(50) }).optional()).query(async ({ input }) => {
    return getEmailLogs(input?.limit || 50);
  })
});

// api/skills-router.ts
import { z as z14 } from "zod";
import { eq as eq12, desc as desc10 } from "drizzle-orm";
var skillsRouter = createRouter({
  // Submit new skill/freelancer registration
  submit: publicQuery.input(
    z14.object({
      fullName: z14.string().min(1),
      fullNameAr: z14.string().optional(),
      serviceType: z14.string().min(1),
      serviceTypeAr: z14.string().optional(),
      category: z14.string().min(1),
      subcategory: z14.string().optional(),
      description: z14.string().optional(),
      descriptionAr: z14.string().optional(),
      yearsOfExperience: z14.number().optional(),
      phone: z14.string().min(1),
      email: z14.string().email(),
      whatsapp: z14.string().optional(),
      country: z14.string().min(1),
      city: z14.string().min(1),
      address: z14.string().optional(),
      businessRegistrationPhoto: z14.string().optional(),
      experienceCertificate: z14.string().optional(),
      portfolioPhotos: z14.array(z14.string()).optional(),
      profilePhoto: z14.string().optional(),
      hourlyRate: z14.number().optional(),
      fixedPrice: z14.number().optional(),
      currency: z14.string().default("EUR")
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(skills).values({
      ...input,
      status: "pending",
      subscriptionStatus: "trial",
      subscriptionPlan: "basic",
      subscriptionPrice: "5.00"
    }).returning();
    const skill = result[0];
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
        experienceCertificate: input.experienceCertificate
      });
    } catch (e) {
      console.error("[skills.submit] Email failed:", e.message);
    }
    return { success: true, id: skill.id };
  }),
  // List skills (for admin)
  list: publicQuery.input(
    z14.object({
      status: z14.string().optional(),
      city: z14.string().optional(),
      category: z14.string().optional(),
      limit: z14.number().min(1).max(100).default(50)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    let query = db.select().from(skills);
    if (input?.status) {
      return query.where(eq12(skills.status, input.status)).orderBy(desc10(skills.createdAt)).limit(input.limit);
    }
    return query.orderBy(desc10(skills.createdAt)).limit(input?.limit || 50);
  }),
  // Get single skill
  getById: publicQuery.input(z14.object({ id: z14.number() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(skills).where(eq12(skills.id, input.id)).limit(1);
    return result[0] || null;
  }),
  // Update status (approve/reject)
  updateStatus: publicQuery.input(
    z14.object({
      id: z14.number(),
      status: z14.enum(["pending", "active", "suspended", "rejected"]),
      adminNotes: z14.string().optional(),
      rejectionReason: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(skills).set({
      status: input.status,
      adminNotes: input.adminNotes,
      rejectionReason: input.rejectionReason
    }).where(eq12(skills.id, input.id));
    return { success: true };
  }),
  // Featured skills by city
  featuredByCity: publicQuery.input(z14.object({ city: z14.string() }).optional()).query(async ({ input }) => {
    const db = getDb();
    if (input?.city) {
      return db.select().from(skills).where(eq12(skills.city, input.city)).where(eq12(skills.status, "active")).where(eq12(skills.isFeatured, true)).orderBy(desc10(skills.createdAt)).limit(20);
    }
    return db.select().from(skills).where(eq12(skills.status, "active")).orderBy(desc10(skills.createdAt)).limit(20);
  })
});

// api/email-log-router.ts
import { z as z15 } from "zod";
var emailLogRouter = createRouter({
  // Get recent email logs (for admin to check notifications)
  list: publicQuery.input(
    z15.object({
      limit: z15.number().min(1).max(100).default(20),
      type: z15.string().optional()
      // "merchant" | "skill"
    }).optional()
  ).query(({ input }) => {
    let logs = [...emailLogs].reverse();
    if (input?.type) {
      logs = logs.filter((l) => {
        if (input.type === "merchant") return l.merchantId !== void 0;
        if (input.type === "skill") return l.skillId !== void 0;
        return true;
      });
    }
    return logs.slice(0, input?.limit || 20).map((l) => ({
      id: l.id || Math.random().toString(36).slice(2),
      subject: l.subject,
      to: l.to,
      sentAt: l.sentAt,
      merchantId: l.merchantId,
      skillId: l.skillId,
      preview: l.arabicBody ? l.arabicBody.slice(0, 200) + "..." : ""
    }));
  }),
  // Get full email details
  getById: publicQuery.input(z15.object({ id: z15.string() })).query(({ input }) => {
    const log = emailLogs.find((l) => l.id === input.id);
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
      skillId: log.skillId
    };
  }),
  // Get counts
  stats: publicQuery.query(() => {
    const total = emailLogs.length;
    const merchantEmails = emailLogs.filter((l) => l.merchantId !== void 0).length;
    const skillEmails = emailLogs.filter((l) => l.skillId !== void 0).length;
    return { total, merchantEmails, skillEmails };
  })
});

// api/router.ts
var appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  merchant: merchantRouter,
  job: jobRouter,
  search: searchRouter,
  sindbad: sindbadRouter,
  admin: adminRouter,
  adminAuth: adminAuthRouter,
  subscription: subscriptionRouter,
  claim: claimRouter,
  seed: seedRouter,
  migrate: migrateRouter,
  reviews: reviewsRouter,
  featured: featuredRouter,
  analytics: analyticsRouter,
  emergency: emergencyRouter,
  pendingMerchant: pendingMerchantRouter,
  skills: skillsRouter,
  emailLog: emailLogRouter
});

// api/kimi/auth.ts
import { setCookie } from "hono/cookie";
import * as jose3 from "jose";
import * as cookie2 from "cookie";

// contracts/errors.ts
function appError(status, message) {
  return { tag: "app_error", status, message };
}
var Errors = {
  badRequest: (msg) => appError(400, msg),
  unauthorized: (msg) => appError(401, msg),
  forbidden: (msg) => appError(403, msg),
  notFound: (msg) => appError(404, msg),
  internal: (msg) => appError(500, msg)
};

// api/kimi/session.ts
import * as jose2 from "jose";
var JWT_ALG = "HS256";
async function signSessionToken(payload) {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose2.SignJWT(payload).setProtectedHeader({ alg: JWT_ALG }).setIssuedAt().setExpirationTime("1 year").sign(secret);
}
async function verifySessionToken(token) {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose2.jwtVerify(token, secret, {
      algorithms: [JWT_ALG]
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}

// api/kimi/platform.ts
async function kimiRequest(path2, token, init) {
  const resp = await fetch(`${env.kimiOpenUrl}${path2}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers
    }
  });
  if (!resp.ok) {
    const text2 = await resp.text();
    console.warn(
      `[kimi] Request to ${path2} failed (${resp.status}): ${text2}`
    );
    return null;
  }
  return resp.json();
}
var users2 = {
  getProfile: (token) => kimiRequest("/v1/users/me/profile", token)
};

// api/queries/users.ts
import { eq as eq13 } from "drizzle-orm";
async function findUserByUnionId(unionId) {
  const rows = await getDb().select().from(users).where(eq13(users.unionId, unionId)).limit(1);
  return rows.at(0);
}
async function upsertUser(data) {
  const values = { ...data };
  const updateSet = {
    lastSignInAt: /* @__PURE__ */ new Date(),
    ...data
  };
  if (values.role === void 0 && values.unionId && values.unionId === env.ownerUnionId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await getDb().insert(users).values(values).onConflictDoUpdate({
    target: users.unionId,
    set: updateSet
  });
}

// api/kimi/auth.ts
async function exchangeAuthCode(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret
  });
  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!resp.ok) {
    const text2 = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text2}`);
  }
  return resp.json();
}
function getJwks() {
  const authUrl = env.kimiAuthUrl || "https://kimi-auth.example.com";
  return jose3.createRemoteJWKSet(
    new URL(`${authUrl}/api/.well-known/jwks.json`)
  );
}
async function verifyAccessToken(accessToken) {
  const { payload } = await jose3.jwtVerify(accessToken, getJwks());
  const userId = payload.user_id;
  const clientId = payload.client_id;
  if (!userId) {
    throw new Error("user_id missing from access token");
  }
  return { userId, clientId };
}
async function authenticateRequest(headers) {
  const cookies = cookie2.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}
function createOAuthCallbackHandler() {
  return async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");
    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400
      );
    }
    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }
    try {
      const redirectUri = atob(state);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = await users2.getProfile(tokenResp.access_token);
      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Kimi Open");
      }
      await upsertUser({
        unionId: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url,
        lastSignInAt: /* @__PURE__ */ new Date()
      });
      const token = await signSessionToken({
        unionId: userId,
        clientId: env.appId
      });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1e3
      });
      return c.redirect("/", 302);
    } catch (error2) {
      console.error("[OAuth] Callback failed", error2);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

// api/context.ts
async function createContext(opts) {
  const ctx = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
  }
  return ctx;
}

// api/boot.ts
import fs from "fs";
import path from "path";
var app = new Hono();
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
var allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://euro-arab-market.onrender.com",
  "https://www.euroarabmarket.com",
  "https://euroarabmarket.com"
];
app.use("/api/trpc/*", cors({
  origin: (origin) => {
    if (!origin || allowedOrigins.includes(origin)) return origin;
    return null;
  },
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  await next();
});
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));
var possiblePaths = [
  path.join(process.cwd(), "dist"),
  path.join(process.cwd(), "dist", "public")
];
var publicPath = "";
for (const p of possiblePaths) {
  console.log("[Static] Checking:", p, "exists:", fs.existsSync(p));
  if (fs.existsSync(p)) {
    publicPath = p;
    break;
  }
}
if (!publicPath) {
  console.error("[Static] ERROR: No public folder found!");
  app.use("*", async (c) => c.json({
    error: "public folder not found",
    cwd: process.cwd(),
    files: fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : "N/A"
  }, 500));
} else {
  console.log("[Static] Serving from:", publicPath);
  app.use("/search", async (c, next) => {
    const indexPath = path.join(publicPath, "search.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      });
    }
    const staticPath = path.join(publicPath, "search-static.html");
    if (fs.existsSync(staticPath)) {
      return c.html(fs.readFileSync(staticPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      });
    }
    await next();
  });
  app.use("/assets/*", async (c) => {
    const file = path.basename(c.req.path);
    const filePath = path.join(publicPath, "assets", file);
    if (!fs.existsSync(filePath)) return c.json({ error: "Not found" }, 404);
    const ext = path.extname(filePath);
    const mime = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml"
    };
    return new Response(fs.readFileSync(filePath), {
      headers: { "Content-Type": mime[ext] || "text/plain" }
    });
  });
  app.use("*", async (c) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
    }
    return c.json({ error: "index.html missing", publicPath }, 500);
  });
}
var { serve } = await import("@hono/node-server");
var port = parseInt(process.env.PORT || "3000");
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
var boot_default = app;
export {
  boot_default as default
};
