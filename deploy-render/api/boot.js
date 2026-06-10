var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/boot.ts
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
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
var env = {
  appId: getEnv("APP_ID", "euro-arab-market"),
  appSecret: getEnv("APP_SECRET", "sk-euro-arab-secret-2024"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/euroarabmarket"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", ""),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", ""),
  ownerUnionId: getEnv("OWNER_UNION_ID", "")
};

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  claims: () => claims,
  favorites: () => favorites,
  jobs: () => jobs,
  merchants: () => merchants,
  reviews: () => reviews,
  searchLogs: () => searchLogs,
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
function getDb() {
  if (!instance) {
    const client = postgres(env.databaseUrl);
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// api/merchant-router.ts
import { eq, and, like, or, desc, sql } from "drizzle-orm";
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
    const db = getDb();
    const conditions = [];
    if (input?.category) {
      conditions.push(eq(merchants.category, input.category));
    }
    if (input?.country) {
      conditions.push(eq(merchants.country, input.country));
    }
    if (input?.city) {
      conditions.push(eq(merchants.city, input.city));
    }
    if (input?.status) {
      conditions.push(eq(merchants.status, input.status));
    } else {
      conditions.push(eq(merchants.status, "active"));
    }
    if (input?.featured) {
      conditions.push(eq(merchants.isFeatured, true));
    }
    if (input?.search) {
      const searchTerm = `%${input.search}%`;
      conditions.push(
        or(
          like(merchants.businessName, searchTerm),
          like(merchants.businessNameAr, searchTerm),
          like(merchants.description, searchTerm),
          like(merchants.descriptionAr, searchTerm),
          like(merchants.tags, searchTerm)
        )
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(merchants).where(where).limit(input?.limit || 20).offset(input?.offset || 0).orderBy(desc(merchants.createdAt)),
      db.select({ count: sql`count(*)` }).from(merchants).where(where)
    ]);
    return {
      items,
      total: countResult[0]?.count || 0
    };
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
  // Get merchant by slug
  getBySlug: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const merchant = await db.select().from(merchants).where(eq(merchants.slug, input.slug)).limit(1);
    if (!merchant[0]) {
      throw new Error("Merchant not found");
    }
    return merchant[0];
  }),
  // Create merchant
  create: publicQuery.input(
    z.object({
      businessName: z.string().min(1),
      businessNameAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      category: z.enum([
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
        "other"
      ]),
      subcategory: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional(),
      postalCode: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      openingHours: z.any().optional(),
      tags: z.string().optional(),
      userId: z.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const slug = input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
    const result = await db.insert(merchants).values({
      ...input,
      slug,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning({ id: merchants.id });
    return { id: result[0].id, slug };
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
      { id: 10, name: "\u0635\u064A\u062F\u0644\u064A\u0627\u062A", nameEn: "pharmacy", icon: "Pill", color: "#10b981", count: 0 }
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
    results.total = results.merchants.length + results.jobs.length;
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
var MAX_WISHES = 5;
async function callOpenRouter(message) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-or-v1-demo",
        // Free tier works without key for demo
        "HTTP-Referer": "https://euroarabmarket.com",
        "X-Title": "Euro Arab Market"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `\u0623\u0646\u062A \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0648\u0648\u062F\u0648\u062F \u0641\u064A \u0645\u0648\u0642\u0639 "\u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A" (Euro Arab Market). \u0627\u0644\u0645\u0648\u0642\u0639 \u0647\u0648 \u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627.

\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u0648\u0642\u0639:
- \u064A\u0636\u0645 \u0623\u0643\u062B\u0631 \u0645\u0646 50 \u0645\u062A\u062C\u0631 \u0639\u0631\u0628\u064A \u0641\u064A 25 \u0645\u062F\u064A\u0646\u0629 \u0623\u0648\u0631\u0648\u0628\u064A\u0629
- \u0627\u0644\u0641\u0626\u0627\u062A: \u0645\u0637\u0627\u0639\u0645\u060C \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A\u060C \u062D\u0644\u0648\u064A\u0627\u062A\u060C \u062D\u0644\u0627\u0642\u0629\u060C \u062C\u0632\u0627\u0631\u060C \u0645\u0642\u0627\u0647\u064A\u060C \u0645\u0633\u0627\u062C\u062F\u060C \u0648\u063A\u064A\u0631\u0647\u0627
- \u0627\u0644\u0645\u062F\u0646: \u0628\u0627\u0631\u064A\u0633\u060C \u0644\u0646\u062F\u0646\u060C \u0628\u0631\u0644\u064A\u0646\u060C \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645\u060C \u0628\u0631\u0648\u0643\u0633\u0644\u060C \u0641\u064A\u064A\u0646\u0627\u060C \u0645\u062F\u0631\u064A\u062F\u060C \u0631\u0648\u0645\u0627\u060C \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645\u060C \u0648\u063A\u064A\u0631\u0647\u0627
- \u064A\u0642\u062F\u0645 \u0623\u064A\u0636\u0627\u064B \u0648\u0638\u0627\u0626\u0641 \u0644\u0644\u0639\u0631\u0628 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627
- \u064A\u0645\u0643\u0646 \u0644\u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0645\u062A\u0627\u062C\u0631\u0647\u0645 \u0648\u0625\u062F\u0627\u0631\u062A\u0647\u0627

\u0623\u062C\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0623\u0648 \u0628\u0627\u0644\u0644\u0647\u062C\u0629 \u0627\u0644\u062A\u064A \u064A\u0643\u062A\u0628 \u0628\u0647\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645. \u0643\u0646 \u0648\u062F\u0648\u062F\u0627\u064B \u0648\u0645\u0641\u064A\u062F\u0627\u064B.`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    if (!response.ok) {
      console.log("OpenRouter error:", response.status);
      return null;
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter error:", error);
    return null;
  }
}
async function callOllama(message) {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: `\u0623\u0646\u062A \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0641\u064A \u0645\u0648\u0642\u0639 \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A.

\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${message}

\u0627\u0644\u0631\u062F:`,
        stream: false
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.response || null;
  } catch {
    return null;
  }
}
async function callGroq(message) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "\u0623\u0646\u062A \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0641\u064A \u0645\u0648\u0642\u0639 \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A - \u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}
async function getAIResponse(message) {
  const groq = await callGroq(message);
  if (groq) return groq;
  const openrouter = await callOpenRouter(message);
  if (openrouter) return openrouter;
  const ollama = await callOllama(message);
  if (ollama) return ollama;
  return null;
}
var KNOWLEDGE_BASE = {
  restaurants: {
    paris: [
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A", cuisine: "\u0633\u0648\u0631\u064A", rating: "4.7" },
      { name: "\u0645\u0642\u0647\u0649 \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", cuisine: "\u0645\u063A\u0631\u0628\u064A", rating: "4.7" },
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0634\u0627\u0645", cuisine: "\u0634\u0627\u0645\u064A", rating: "4.5" }
    ],
    berlin: [
      { name: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642", cuisine: "\u062F\u0645\u0634\u0642\u064A", rating: "4.6" },
      { name: "\u0628\u064A\u0631\u0648\u062A \u0625\u0643\u0633\u0628\u0631\u0633", cuisine: "\u0644\u0628\u0646\u0627\u0646\u064A", rating: "4.5" },
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0646\u062F\u0644\u0633", cuisine: "\u0645\u063A\u0631\u0628\u064A", rating: "4.4" }
    ],
    london: [
      { name: "\u0645\u0637\u0639\u0645 \u0628\u0644\u0627\u062F \u0627\u0644\u0634\u0627\u0645", cuisine: "\u0634\u0627\u0645\u064A \u0641\u0627\u062E\u0631", rating: "4.6" },
      { name: "\u0644\u064A\u0627\u0644\u064A \u0627\u0644\u0639\u0631\u0628\u064A\u0629", cuisine: "\u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", rating: "4.8" }
    ],
    amsterdam: [
      { name: "\u0633\u0648\u0642 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", cuisine: "\u0639\u0631\u0628\u064A", rating: "4.5" }
    ],
    brussels: [
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0635\u062D\u0631\u0627\u0621", cuisine: "\u0645\u063A\u0631\u0628\u064A \u062C\u0632\u0627\u0626\u0631\u064A", rating: "4.4" }
    ],
    vienna: [
      { name: "\u0627\u0644\u0634\u0631\u0642\u064A - \u0641\u064A\u064A\u0646\u0627", cuisine: "\u0639\u0631\u0627\u0642\u064A", rating: "4.5" }
    ],
    madrid: [
      { name: "\u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644", cuisine: "\u062D\u0644\u0627\u0644 \u0625\u0633\u0628\u0627\u0646\u064A", rating: "4.4" }
    ],
    rome: [
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0633\u0644\u0637\u0627\u0646", cuisine: "\u062A\u0631\u0643\u064A \u0639\u0631\u0628\u064A", rating: "4.3" }
    ],
    barcelona: [
      { name: "\u0644\u0627\u0648\u0646\u062C \u0628\u0631\u0634\u0644\u0648\u0646\u0629 \u0627\u0644\u0639\u0631\u0628\u064A", cuisine: "\u0639\u0631\u0628\u064A", rating: "4.3" }
    ],
    milan: [
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0646\u064A\u0644", cuisine: "\u0645\u0635\u0631\u064A", rating: "4.3" }
    ],
    lisbon: [
      { name: "\u0645\u0637\u0639\u0645 \u0645\u0643\u0629", cuisine: "\u0639\u0631\u0628\u064A \u062D\u0644\u0627\u0644", rating: "4.4" },
      { name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0646\u062F\u0644\u0633", cuisine: "\u0645\u063A\u0631\u0628\u064A \u0623\u0646\u062F\u0644\u0633\u064A", rating: "4.6" }
    ],
    athens: [
      { name: "\u0645\u0637\u0639\u0645 \u0623\u062B\u064A\u0646\u0627 \u0627\u0644\u062D\u0644\u0627\u0644", cuisine: "\u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A", rating: "4.2" }
    ]
  },
  supermarkets: {
    paris: ["\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A"],
    berlin: ["\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0628\u0627\u0628\u0644"],
    amsterdam: ["\u0633\u0648\u0642 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0627\u0644\u062D\u0644\u0627\u0644"],
    madrid: ["\u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0645\u0631\u0643\u0632\u064A"],
    prague: ["\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0631\u0634\u064A\u062F"],
    stockholm: ["\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A"]
  },
  barbers: {
    paris: ["\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646"],
    london: ["\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0645\u0644\u0643"],
    munich: ["\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u062D\u0644\u0627\u0644"],
    oslo: ["\u0635\u0627\u0644\u0648\u0646 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u0639\u0631\u0628\u064A"]
  },
  sweets: {
    paris: ["\u0628\u0643\u062F\u0627\u0634 - \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A"],
    berlin: ["\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0623\u0646\u062F\u0644\u0633"],
    brussels: ["\u0642\u0635\u0631 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629"],
    budapest: ["\u0645\u062E\u0628\u0632 \u0627\u0644\u0642\u062F\u0633"],
    zurich: ["\u0645\u0642\u0647\u0649 \u0627\u0644\u0635\u062D\u0631\u0627\u0621"]
  },
  cities: ["\u0628\u0627\u0631\u064A\u0633", "\u0644\u0646\u062F\u0646", "\u0628\u0631\u0644\u064A\u0646", "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", "\u0628\u0631\u0648\u0643\u0633\u0644", "\u0641\u064A\u064A\u0646\u0627", "\u0645\u062F\u0631\u064A\u062F", "\u0628\u0631\u0634\u0644\u0648\u0646\u0629", "\u0631\u0648\u0645\u0627", "\u0645\u064A\u0644\u0627\u0646\u0648", "\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", "\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", "\u0623\u062B\u064A\u0646\u0627", "\u0644\u0634\u0628\u0648\u0646\u0629", "\u0623\u0648\u0633\u0644\u0648", "\u0647\u0644\u0633\u0646\u0643\u064A", "\u062F\u0628\u0644\u0646", "\u0628\u0648\u062E\u0627\u0631\u0633\u062A", "\u0628\u0648\u062F\u0627\u0628\u0633\u062A", "\u0648\u0627\u0631\u0633\u0648", "\u0628\u0631\u0627\u063A"]
};
function getFallbackResponse(message, wishesRemaining) {
  const msg = message.toLowerCase();
  if (msg.includes("\u0645\u0637\u0639\u0645") || msg.includes("\u0645\u0637\u0627\u0639\u0645") || msg.includes("\u0623\u0643\u0644") || msg.includes("\u0637\u0639\u0627\u0645") || msg.includes("\u0623\u0643\u0644\u0629")) {
    let cityMatch = "";
    for (const city of KNOWLEDGE_BASE.cities) {
      if (msg.includes(city)) {
        cityMatch = city;
        break;
      }
    }
    let response = `\u{1F37D}\uFE0F **\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627**

`;
    if (cityMatch) {
      const cityData = KNOWLEDGE_BASE.restaurants[cityMatch];
      if (cityData) {
        response += `**\u0641\u064A ${cityMatch}:**
`;
        cityData.forEach((r, i) => {
          response += `${i + 1}. ${r.name} (${r.cuisine}) \u2B50${r.rating}
`;
        });
      }
    } else {
      response += `\u0623\u0634\u0647\u0631 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0639\u0631\u0628\u064A\u0629:

`;
      response += `\u{1F1EB}\u{1F1F7} **\u0628\u0627\u0631\u064A\u0633**: \u0627\u0644\u0623\u0639\u062C\u0645\u064A (\u0633\u0648\u0631\u064A) \u2B504.7\u060C \u0645\u0642\u0647\u0649 \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633 (\u0645\u063A\u0631\u0628\u064A) \u2B504.7
`;
      response += `\u{1F1E9}\u{1F1EA} **\u0628\u0631\u0644\u064A\u0646**: \u062F\u0645\u0634\u0642 (\u062F\u0645\u0634\u0642\u064A) \u2B504.6\u060C \u0628\u064A\u0631\u0648\u062A \u0625\u0643\u0633\u0628\u0631\u0633 (\u0644\u0628\u0646\u0627\u0646\u064A) \u2B504.5
`;
      response += `\u{1F1EC}\u{1F1E7} **\u0644\u0646\u062F\u0646**: \u0628\u0644\u0627\u062F \u0627\u0644\u0634\u0627\u0645 (\u0634\u0627\u0645\u064A \u0641\u0627\u062E\u0631) \u2B504.6
`;
      response += `\u{1F1F3}\u{1F1F1} **\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645**: \u0633\u0648\u0642 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645 (\u0639\u0631\u0628\u064A) \u2B504.5
`;
      response += `\u{1F1E6}\u{1F1F9} **\u0641\u064A\u064A\u0646\u0627**: \u0627\u0644\u0634\u0631\u0642\u064A (\u0639\u0631\u0627\u0642\u064A) \u2B504.5
`;
      response += `\u{1F1EA}\u{1F1F8} **\u0645\u062F\u0631\u064A\u062F**: \u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 (\u062D\u0644\u0627\u0644) \u2B504.4
`;
      response += `\u{1F1F5}\u{1F1F9} **\u0644\u0634\u0628\u0648\u0646\u0629**: \u0627\u0644\u0623\u0646\u062F\u0644\u0633 (\u0645\u063A\u0631\u0628\u064A) \u2B504.6
`;
    }
    response += `
\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0623\u062F\u0642! \u{1F3AF}`;
    return response;
  }
  if (msg.includes("\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A") || msg.includes("\u062D\u0644\u0627\u0644") || msg.includes("\u0628\u0642\u0627\u0644\u0629") || msg.includes("\u0633\u0648\u0642")) {
    return `\u{1F6D2} **\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062D\u0644\u0627\u0644 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627**

\u{1F1EB}\u{1F1F7} **\u0628\u0627\u0631\u064A\u0633**: \u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A
\u{1F1E9}\u{1F1EA} **\u0628\u0631\u0644\u064A\u0646**: \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0628\u0627\u0628\u0644
\u{1F1F3}\u{1F1F1} **\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645**: \u0633\u0648\u0642 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0627\u0644\u062D\u0644\u0627\u0644
\u{1F1EA}\u{1F1F8} **\u0645\u062F\u0631\u064A\u062F**: \u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0645\u0631\u0643\u0632\u064A
\u{1F1E8}\u{1F1FF} **\u0628\u0631\u0627\u063A**: \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0631\u0634\u064A\u062F
\u{1F1F8}\u{1F1EA} **\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645**: \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A

\u062C\u0645\u064A\u0639\u0647\u0627 \u0645\u0639\u062A\u0645\u062F\u0629 \u062D\u0644\u0627\u0644 \u2705`;
  }
  if (msg.includes("\u062D\u0644\u0627\u0642") || msg.includes("\u0635\u0627\u0644\u0648\u0646") || msg.includes("\u062D\u0644\u0627\u0642\u0629")) {
    return `\u{1F488} **\u0635\u0627\u0644\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629**

\u{1F1EB}\u{1F1F7} **\u0628\u0627\u0631\u064A\u0633**: \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 (\u0631\u062C\u0627\u0644\u064A \u0641\u0627\u062E\u0631)
\u{1F1EC}\u{1F1E7} **\u0644\u0646\u062F\u0646**: \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0645\u0644\u0643 (\u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631)
\u{1F1E9}\u{1F1EA} **\u0645\u064A\u0648\u0646\u062E**: \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u062D\u0644\u0627\u0644
\u{1F1F3}\u{1F1F4} **\u0623\u0648\u0633\u0644\u0648**: \u0635\u0627\u0644\u0648\u0646 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u0639\u0631\u0628\u064A

\u0643\u0644\u0647\u0627 \u062A\u062A\u0643\u0644\u0645 \u0639\u0631\u0628\u064A \u0648\u062A\u0639\u0631\u0641 \u0627\u0644\u0642\u0635\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629! \u2702\uFE0F`;
  }
  if (msg.includes("\u062D\u0644\u0648") || msg.includes("\u062D\u0644\u0648\u064A\u0627\u062A") || msg.includes("\u0628\u0642\u0644\u0627\u0648\u0629") || msg.includes("\u0643\u0646\u0627\u0641\u0629")) {
    return `\u{1F9C1} **\u0623\u0634\u0647\u0631 \u0645\u062D\u0644\u0627\u062A \u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A**

\u{1F1EB}\u{1F1F7} **\u0628\u0627\u0631\u064A\u0633**: \u0628\u0643\u062F\u0627\u0634 - \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A (\u0641\u0633\u062A\u0642 \u062D\u0644\u0628\u064A) \u2B504.8
\u{1F1E9}\u{1F1EA} **\u0628\u0631\u0644\u064A\u0646**: \u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0623\u0646\u062F\u0644\u0633 (\u0628\u0642\u0644\u0627\u0648\u0629 \u0648\u0643\u0646\u0627\u0641\u0629) \u2B504.8
\u{1F1E7}\u{1F1EA} **\u0628\u0631\u0648\u0643\u0633\u0644**: \u0642\u0635\u0631 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 (\u062A\u0631\u0643\u064A \u0641\u0627\u062E\u0631) \u2B504.7
\u{1F1ED}\u{1F1FA} **\u0628\u0648\u062F\u0627\u0628\u0633\u062A**: \u0645\u062E\u0628\u0632 \u0627\u0644\u0642\u062F\u0633 (\u0641\u0644\u0633\u0637\u064A\u0646\u064A) \u2B504.5
\u{1F1E8}\u{1F1ED} **\u0632\u064A\u0648\u0631\u062E**: \u0645\u0642\u0647\u0649 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 \u2B504.4

\u0628\u0627\u0644\u0639\u0627\u0641\u064A\u0629! \u{1F60B}`;
  }
  if (msg.includes("\u0648\u0638\u064A\u0641\u0629") || msg.includes("\u0634\u063A\u0644") || msg.includes("\u0639\u0645\u0644") || msg.includes("\u0648\u0638\u0627\u0626\u0641") || msg.includes("\u0645\u0647\u0646\u0629")) {
    return `\u{1F4BC} **\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0644\u0644\u0639\u0631\u0628 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627**

\u{1F3D7}\uFE0F **\u0627\u0644\u0628\u0646\u0627\u0621**: \u20AC1,800 - \u20AC3,500
\u{1F697} **\u0627\u0644\u0642\u064A\u0627\u062F\u0629**: \u20AC2,000 - \u20AC3,000
\u{1F37D}\uFE0F **\u0627\u0644\u0645\u0637\u0627\u0639\u0645**: \u20AC1,500 - \u20AC2,800
\u{1F4BB} **IT \u0648\u062A\u0637\u0648\u064A\u0631**: \u20AC3,000 - \u20AC6,000
\u{1F4DA} **\u0627\u0644\u062A\u0631\u062C\u0645\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645**: \u20AC2,500 - \u20AC4,500
\u{1F4F8} **\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0648\u0627\u0644\u062C\u0631\u0627\u0641\u064A\u0643**: \u20AC2,000 - \u20AC4,000

\u0632\u0631 \u0642\u0633\u0645 "\u0627\u0644\u0645\u0647\u0646" \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u0644\u062A\u0641\u0627\u0635\u064A\u0644! \u{1F4CB}`;
  }
  if (msg.includes("\u0645\u062F\u064A\u0646\u0629") || msg.includes("\u0645\u062F\u0646")) {
    return `\u{1F30D} **\u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0645\u063A\u0637\u0627\u0629 (25 \u0645\u062F\u064A\u0646\u0629)**

\u{1F1EB}\u{1F1F7} \u0628\u0627\u0631\u064A\u0633\u060C \u0644\u064A\u0648\u0646\u060C \u0645\u0631\u0633\u064A\u0644\u064A\u0627\u060C \u0646\u064A\u0633
\u{1F1E9}\u{1F1EA} \u0628\u0631\u0644\u064A\u0646\u060C \u0647\u0627\u0645\u0628\u0648\u0631\u063A\u060C \u0645\u064A\u0648\u0646\u062E\u060C \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A
\u{1F1EC}\u{1F1E7} \u0644\u0646\u062F\u0646\u060C \u0645\u0627\u0646\u0634\u0633\u062A\u0631\u060C \u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645
\u{1F1F3}\u{1F1F1} \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645\u060C \u0631\u0648\u062A\u0631\u062F\u0627\u0645
\u{1F1E7}\u{1F1EA} \u0628\u0631\u0648\u0643\u0633\u0644 | \u{1F1E6}\u{1F1F9} \u0641\u064A\u064A\u0646\u0627 | \u{1F1EA}\u{1F1F8} \u0645\u062F\u0631\u064A\u062F\u060C \u0628\u0631\u0634\u0644\u0648\u0646\u0629
\u{1F1EE}\u{1F1F9} \u0631\u0648\u0645\u0627\u060C \u0645\u064A\u0644\u0627\u0646\u0648 | \u{1F1E8}\u{1F1ED} \u062C\u0646\u064A\u0641\u060C \u0632\u064A\u0648\u0631\u062E
\u{1F1F8}\u{1F1EA} \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645 | \u{1F1E9}\u{1F1F0} \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646 | \u{1F1F3}\u{1F1F4} \u0623\u0648\u0633\u0644\u0648
\u{1F1EB}\u{1F1EE} \u0647\u0644\u0633\u0646\u0643\u064A | \u{1F1EE}\u{1F1EA} \u062F\u0628\u0644\u0646 | \u{1F1EC}\u{1F1F7} \u0623\u062B\u064A\u0646\u0627
\u{1F1F5}\u{1F1F9} \u0644\u0634\u0628\u0648\u0646\u0629 | \u{1F1F7}\u{1F1F4} \u0628\u0648\u062E\u0627\u0631\u0633\u062A | \u{1F1ED}\u{1F1FA} \u0628\u0648\u062F\u0627\u0628\u0633\u062A
\u{1F1F5}\u{1F1F1} \u0648\u0627\u0631\u0633\u0648 | \u{1F1E8}\u{1F1FF} \u0628\u0631\u0627\u063A

50+ \u0645\u062A\u062C\u0631 \u0639\u0631\u0628\u064A \u0645\u0646\u062A\u0634\u0631\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u062F\u0646! \u{1F3EA}`;
  }
  if (msg.includes("\u0645\u0637\u0627\u0644\u0628\u0629") || msg.includes("\u0645\u0644\u0643") || msg.includes("\u0645\u062A\u062C\u0631\u064A") || msg.includes("\u062A\u062C\u0627\u0631\u064A")) {
    return `\u{1F4CB} **\u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0627\u0644\u0645\u062A\u062C\u0631**

\u0644\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0645\u062A\u062C\u0631\u0643 \u0641\u064A \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A:

1. \u0633\u062C\u0644 \u062F\u062E\u0648\u0644 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639
2. \u0627\u0630\u0647\u0628 \u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u062A\u062C\u0631
3. \u0627\u0636\u063A\u0637 "\u0647\u0630\u0627 \u0645\u062A\u062C\u0631\u064A"
4. \u0627\u0645\u0644\u0623 \u0627\u0644\u0646\u0645\u0648\u0630\u062C \u0628\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642
5. \u0627\u0646\u062A\u0638\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629

\u0628\u0639\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u062A\u0633\u062A\u0637\u064A\u0639 \u0625\u062F\u0627\u0631\u0629 \u0635\u0641\u062D\u062A\u0643! \u2705`;
  }
  if (msg.includes("\u0645\u0631\u062D\u0628\u0627") || msg.includes("\u0647\u0644\u0627") || msg.includes("\u0627\u0644\u0633\u0644\u0627\u0645") || msg.includes("\u0623\u0647\u0644\u0627") || msg.includes("\u0635\u0628\u0627\u062D") || msg.includes("\u0645\u0633\u0627\u0621") || msg.includes("\u062A\u062D\u064A\u0629")) {
    return `\u{1F319} **\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647!**

\u0623\u0646\u0627 **\u0633\u0646\u062F\u0628\u0627\u062F** \u{1F9DE}\u200D\u2642\uFE0F\u060C \u0645\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \u0641\u064A **\u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A**!

\u{1F3EA} 50+ \u0645\u062A\u062C\u0631 \u0639\u0631\u0628\u064A \u0641\u064A 25 \u0645\u062F\u064A\u0646\u0629 \u0623\u0648\u0631\u0648\u0628\u064A\u0629
\u{1F4BC} \u0648\u0638\u0627\u0626\u0641 \u0644\u0644\u0639\u0631\u0628 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627

\u0627\u0643\u062A\u0628 \u0644\u064A \u0639\u0646:
\u{1F37D}\uFE0F \u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629 | \u{1F6D2} \u0623\u0633\u0648\u0627\u0642 \u062D\u0644\u0627\u0644
\u{1F488} \u0635\u0627\u0644\u0648\u0646\u0627\u062A | \u{1F4BC} \u0648\u0638\u0627\u0626\u0641
\u{1F4CD} \u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0645\u0648\u0627\u0642\u0639 | \u2753 \u0623\u064A \u0633\u0624\u0627\u0644

\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F \u2728`;
  }
  if (msg.includes("\u0645\u0633\u0627\u0639\u062F\u0629") || msg.includes("help") || msg.includes("\u0645\u0627\u0630\u0627") || msg.includes("\u0634\u0648") || msg.includes("\u0643\u064A\u0641")) {
    return `\u{1F3AF} **\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A:**

\u{1F50D} \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0645\u062A\u0627\u062C\u0631 \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627
\u{1F4CD} \u0625\u064A\u062C\u0627\u062F \u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0647\u0648\u0627\u062A\u0641 \u0627\u0644\u0645\u062A\u0627\u062C\u0631
\u{1F4BC} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u062A\u0627\u062D\u0629
\u{1F4CB} \u0634\u0631\u062D \u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0628\u0645\u062A\u062C\u0631\u0643
\u{1F3D9}\uFE0F \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A\u0629
\u2139\uFE0F \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0627\u0645

\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0648\u0633\u0623\u062C\u064A\u0628\u0643! \u{1F4AC}`;
  }
  return `\u0634\u0643\u0631\u0627\u064B \u0644\u0633\u0624\u0627\u0644\u0643! \u{1F31F}

\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F\u0643 \u0641\u064A \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A.

\u0627\u0643\u062A\u0628 \u0644\u064A \u0639\u0646:
\u{1F37D}\uFE0F \u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629
\u{1F6D2} \u0623\u0633\u0648\u0627\u0642 \u062D\u0644\u0627\u0644
\u{1F488} \u0635\u0627\u0644\u0648\u0646\u0627\u062A \u062D\u0644\u0627\u0642\u0629
\u{1F4BC} \u0648\u0638\u0627\u0626\u0641
\u{1F4CD} \u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0645\u0648\u0627\u0642\u0639
\u2753 \u0623\u064A \u0633\u0624\u0627\u0644

\u0645\u062A\u0628\u0642\u064A ${wishesRemaining} \u0623\u0645\u0646\u064A\u0627\u062A \u0627\u0644\u064A\u0648\u0645! \u{1F9DE}\u200D\u2642\uFE0F`;
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
    const sessionId = input.sessionId || `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
    let responseType = "fallback";
    if (wishesUsed >= MAX_WISHES && !input.userId) {
      response = `\u0639\u0630\u0631\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F6AB}

\u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u0630\u062A **${MAX_WISHES} \u0623\u0645\u0646\u064A\u0627\u062A\u0643** \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645.

\u{1F4A1} **\u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0645\u0646\u064A\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629:**
\u0633\u062C\u0644 \u062F\u062E\u0648\u0644 \u0628\u062D\u0633\u0627\u0628\u0643 (\u0645\u062C\u0627\u0646\u064A!)

\u0623\u0648 \u062A\u0639\u0627\u0644 \u063A\u062F\u0627\u064B \u0644\u0623\u0645\u0646\u064A\u0627\u062A \u062C\u062F\u064A\u062F\u0629! \u{1F319}`;
    } else {
      const aiResponse = await getAIResponse(input.message);
      if (aiResponse) {
        response = aiResponse;
        responseType = "ai";
      } else {
        response = getFallbackResponse(input.message, wishesRemaining);
      }
    }
    await db.insert(chatMessages).values({
      userId: input.userId,
      sessionId,
      role: "assistant",
      content: response,
      createdAt: /* @__PURE__ */ new Date()
    });
    return {
      response,
      responseType,
      sessionId,
      wishesUsed,
      wishesRemaining,
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
      isUnlimited: false
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
      pendingMerchants,
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
      pendingMerchants: pendingMerchants[0]?.count || 0,
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
  { businessName: "Al Ajami Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0627\u0631\u064A\u0633", description: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A \u0647\u0648 \u0648\u0627\u062D\u062F \u0645\u0646 \u0623\u0634\u0647\u0631 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0633\u0648\u0631\u064A\u0629 \u0641\u064A \u0628\u0627\u0631\u064A\u0633. \u064A\u0642\u062F\u0645 \u062A\u0634\u0643\u064A\u0644\u0629 \u0648\u0627\u0633\u0639\u0629 \u0645\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0634\u0631\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "3 Rue du Faubourg Montmartre, 75009 Paris", phone: "+33 1 42 46 04 38", email: "contact@alajami.fr", priceRange: "$$", rating: "4.7", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0627\u0631\u064A\u0633, \u062D\u0644\u0627\u0644, \u0645\u0634\u0627\u0648\u064A, \u0634\u0627\u0648\u0631\u0645\u0627", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Bakdash Ice Cream", businessNameAr: "\u0628\u0643\u062F\u0627\u0634 - \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", shortDescription: "\u0623\u0634\u0647\u0631 \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0628\u0643\u062F\u0627\u0634 \u064A\u0642\u062F\u0645 \u0627\u0644\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0627\u0644\u062D\u0644\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644 \u0628\u0623\u062C\u0648\u062F \u0627\u0644\u0645\u0643\u0633\u0631\u0627\u062A \u0648\u0627\u0644\u0641\u0633\u062A\u0642 \u0627\u0644\u062D\u0644\u0628\u064A.", category: "sweets", subcategory: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "12 Rue des Rosiers, 75004 Paris", phone: "+33 1 42 72 91 42", email: "info@bakdash.fr", priceRange: "$", rating: "4.8", tags: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645, \u062D\u0644\u0628\u064A, \u0641\u0633\u062A\u0642, \u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Les Deux Magots Arabic Bakery", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0634\u0631\u0642", shortDescription: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0637\u0627\u0632\u062C", description: "\u0645\u062E\u0628\u0632 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0625\u0646\u062A\u0627\u062C \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0637\u0627\u0632\u062C \u064A\u0648\u0645\u064A\u0627\u064B.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "25 Rue de la Roquette, 75011 Paris", phone: "+33 1 47 00 21 93", priceRange: "$", rating: "4.5", tags: "\u0645\u062E\u0628\u0632, \u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629, \u0643\u0646\u0627\u0641\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Barber Shop", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u0644\u0644\u062D\u0644\u0627\u0642\u0629", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", description: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0631\u062C\u0627\u0644\u064A \u0627\u0644\u0639\u0631\u0628\u064A.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0631\u062C\u0627\u0644\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "8 Rue du Faubourg Saint-Denis, 75010 Paris", phone: "+33 1 42 38 59 27", priceRange: "$$", rating: "4.6", tags: "\u062D\u0644\u0627\u0642\u0629, \u0635\u0627\u0644\u0648\u0646, \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A\u0629, \u062A\u062C\u0645\u064A\u0644 \u0631\u062C\u0627\u0644\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Bazar du Monde Arabe", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644 \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "45 Rue de Belleville, 75020 Paris", phone: "+33 1 43 58 42 61", email: "bazar@monde-arabe.fr", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0631\u0628\u064A\u0629, \u0628\u0642\u0627\u0644\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "La Mosquee de Paris Cafe", businessNameAr: "\u0645\u0642\u0647\u0649 \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u062A\u0642\u0644\u064A\u062F\u064A \u0641\u064A \u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0643\u0628\u064A\u0631", description: "\u0645\u0642\u0647\u0649 \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0628\u0627\u0644\u0646\u0639\u0646\u0627\u0639 \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "39 Rue Geoffroy-Saint-Hilaire, 75005 Paris", phone: "+33 1 43 31 18 14", priceRange: "$", rating: "4.7", tags: "\u0645\u0642\u0647\u0649, \u0634\u0627\u064A \u0645\u063A\u0631\u0628\u064A, \u062D\u0644\u0648\u064A\u0627\u062A, \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Levant Restaurant London", businessNameAr: "\u0645\u0637\u0639\u0645 \u0628\u0644\u0627\u062F \u0627\u0644\u0634\u0627\u0645 - \u0644\u0646\u062F\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0631\u0627\u0642\u064A \u0641\u064A \u0642\u0644\u0628 \u0644\u0646\u062F\u0646", description: "\u064A\u0642\u062F\u0645 \u062A\u062C\u0631\u0628\u0629 \u0637\u0639\u0627\u0645 \u0634\u0627\u0645\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0645\u0639 \u0625\u0637\u0644\u0627\u0644\u0629 \u0639\u0644\u0649 \u0646\u0647\u0631 \u0627\u0644\u062A\u0627\u064A\u0645\u0632.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0641\u0627\u062E\u0631", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "76-77 London Wall, London EC2M 5NX", phone: "+44 20 7256 1122", email: "info@levant-london.co.uk", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u0644\u0646\u062F\u0646, \u0641\u0627\u062E\u0631, \u0645\u0634\u0627\u0648\u064A, \u0645\u0627\u0632\u0629", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Edgware Road Halal Butcher", businessNameAr: "\u062C\u0632\u0627\u0631 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 Edgware Road", description: "\u0645\u062A\u062C\u0631 \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629 \u064A\u0648\u0645\u064A\u0627\u064B \u0645\u0646 \u0644\u062D\u0645 \u063A\u0646\u0645 \u0648\u0639\u062C\u0644 \u0648\u062F\u0648\u0627\u062C\u0646.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "142 Edgware Road, London W2 2DZ", phone: "+44 20 7723 8765", priceRange: "$$", rating: "4.5", tags: "\u062C\u0632\u0627\u0631, \u062D\u0644\u0627\u0644, \u0644\u062D\u0645, \u062F\u0648\u0627\u062C\u0646, Edgware Road", status: "active", isVerified: true, isFeatured: false },
  { businessName: "The Arabica Lounge", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0623\u0631\u0627\u0628\u064A\u0643\u0627", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A \u0644\u0644\u0634\u064A\u0634\u0629 \u0641\u064A \u0644\u0646\u062F\u0646", description: "\u0644\u0627\u0648\u0646\u062C \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0628\u0646\u0643\u0647\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "35 Maida Vale, London W9 1RS", phone: "+44 20 7286 5492", priceRange: "$$", rating: "4.3", tags: "\u0634\u064A\u0634\u0629, \u0645\u0642\u0647\u0649, \u0639\u0631\u0628\u064A, \u0644\u0646\u062F\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Damaskus Restaurant Berlin", businessNameAr: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642 - \u0628\u0631\u0644\u064A\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0631\u0644\u064A\u0646", description: "\u0645\u0637\u0639\u0645 \u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u062F\u0645\u0634\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0645\u0646 \u0641\u062A\u0629 \u062D\u0645\u0635\u060C \u0645\u0646\u0633\u0641\u060C \u0643\u0628\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 87, 12045 Berlin", phone: "+49 30 623 72 14", email: "info@damaskus-berlin.de", priceRange: "$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0631\u0644\u064A\u0646, \u062F\u0645\u0634\u0642\u064A, \u0645\u0646\u0633\u0641, Neukolln", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Babylon Supermarkt", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0628\u0627\u0628\u0644", shortDescription: "\u0643\u0644 \u0645\u0627 \u064A\u062D\u062A\u0627\u062C\u0647 \u0627\u0644\u0639\u0631\u0628 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 120, 12045 Berlin", phone: "+49 30 624 89 33", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0639\u0631\u0628\u064A, \u0628\u0631\u0644\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Andalus Konditorei", businessNameAr: "\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0623\u0646\u062F\u0644\u0633 - \u0628\u0631\u0644\u064A\u0646", shortDescription: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629 \u0648\u0623\u0646\u062F\u0644\u0633\u064A\u0629 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", description: "\u064A\u0642\u062F\u0645 \u062A\u0634\u0643\u064A\u0644\u0629 \u0648\u0627\u0633\u0639\u0629 \u0645\u0646 \u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0642\u064A\u0629 \u0648\u0627\u0644\u0623\u0646\u062F\u0644\u0633\u064A\u0629.", category: "sweets", subcategory: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnnenallee 45, 12045 Berlin", phone: "+49 30 622 35 71", priceRange: "$", rating: "4.8", tags: "\u062D\u0644\u0648\u064A\u0627\u062A, \u0634\u0631\u0642\u064A\u0629, \u0628\u0642\u0644\u0627\u0648\u0629, \u0643\u0646\u0627\u0641\u0629, \u0628\u0631\u0644\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Beirut Express Berlin", businessNameAr: "\u0628\u064A\u0631\u0648\u062A \u0625\u0643\u0633\u0628\u0631\u0633", shortDescription: "\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A \u0633\u0631\u064A\u0639 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", description: "\u064A\u0642\u062F\u0645 \u0623\u0634\u0647\u0649 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0644\u0628\u0646\u0627\u0646\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0645\u0646 \u0641\u0644\u0627\u0641\u0644\u060C \u0634\u0627\u0648\u0631\u0645\u0627.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Admiralstrasse 16, 10999 Berlin", phone: "+49 30 614 12 88", priceRange: "$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A, \u0641\u0644\u0627\u0641\u0644, \u0634\u0627\u0648\u0631\u0645\u0627, \u0628\u0631\u0644\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Souk Amsterdam", businessNameAr: "\u0633\u0648\u0642 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u0641\u064A \u0648\u0633\u0637 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629 \u0648\u0627\u0644\u0645\u0637\u0628\u062E \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0627\u0644\u0639\u0635\u0631\u064A.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", address: "Utrechtsestraat 65, 1017 VJ Amsterdam", phone: "+31 20 624 52 19", email: "hello@soukamsterdam.nl", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A, \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645, \u0645\u0642\u0647\u0649, \u062D\u0644\u0627\u0644", status: "active", isVerified: true, isFeatured: false },
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
    try {
      const existingCount = await db.select({ count: sql6`count(*)` }).from(merchants);
      const count = existingCount[0]?.count || 0;
      if (count >= 50) {
        return {
          success: true,
          message: "Database already seeded!",
          count,
          alreadySeeded: true
        };
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
          console.error(`Failed to insert ${merchant.businessNameAr}:`, err);
        }
      }
      return {
        success: true,
        message: `Successfully seeded ${inserted} merchants!`,
        count: inserted,
        alreadySeeded: false
      };
    } catch (error) {
      console.error("Seed error:", error);
      return {
        success: false,
        message: "Seed failed. Check server logs.",
        count: 0,
        alreadySeeded: false
      };
    }
  }),
  status: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: sql6`count(*)` }).from(merchants);
    return { count: result[0]?.count || 0 };
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
  seed: seedRouter
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
import { eq as eq8 } from "drizzle-orm";
async function findUserByUnionId(unionId) {
  const rows = await getDb().select().from(users).where(eq8(users.unionId, unionId)).limit(1);
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
if (env.isProduction) {
  const possiblePaths = [
    path.join(process.cwd(), "dist", "public"),
    path.join(process.cwd(), "public"),
    "/opt/render/project/src/public",
    "/opt/render/project/public"
  ];
  let publicPath = "";
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
        return c.html(fs.readFileSync(indexPath, "utf-8"));
      }
      return c.json({ error: "index.html missing", publicPath }, 500);
    });
  }
  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
var boot_default = app;
export {
  boot_default as default
};
