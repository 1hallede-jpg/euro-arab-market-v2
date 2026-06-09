import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
  json,
} from "drizzle-orm/mysql-core";

// Users table (from auth)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Merchants table
export const merchants = mysqlTable("merchants", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessNameAr: varchar("businessNameAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
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
    "other",
  ]).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  logo: text("logo"),
  coverImage: text("coverImage"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  // Address
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  postalCode: varchar("postalCode", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  // Business hours
  openingHours: json("openingHours"),
  // Status
  status: mysqlEnum("status", ["pending", "active", "suspended", "rejected"]).default("pending").notNull(),
  isVerified: boolean("isVerified").default(false),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: int("reviewCount").default(0),
  // SEO
  slug: varchar("slug", { length: 255 }).unique(),
  tags: text("tags"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

// Jobs table
export const jobs = mysqlTable("jobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  // Job details
  category: mysqlEnum("category", [
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
    "other",
  ]).notNull(),
  type: mysqlEnum("type", ["full_time", "part_time", "contract", "freelance", "temporary"]).notNull(),
  // Requirements
  requirements: text("requirements"),
  requirementsAr: text("requirementsAr"),
  skills: text("skills"),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "mid", "senior", "expert"]).default("entry"),
  // Salary
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  salaryCurrency: varchar("salaryCurrency", { length: 3 }).default("EUR"),
  // Location
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  isRemote: boolean("isRemote").default(false),
  // Contact
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  // Status
  status: mysqlEnum("status", ["open", "closed", "filled", "paused"]).default("open").notNull(),
  // SEO
  slug: varchar("slug", { length: 255 }).unique(),
  tags: text("tags"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  expiresAt: timestamp("expiresAt"),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  merchantId: bigint("merchantId", { mode: "number", unsigned: true }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number", unsigned: true }).references(() => jobs.id),
  rating: int("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// Categories table
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  type: mysqlEnum("type", ["merchant", "job"]).notNull(),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// AI Chat Messages table (for Sindbad)
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  // Track wishes remaining
  wishesUsed: int("wishesUsed").default(0),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// Search logs table (for analytics)
export const searchLogs = mysqlTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  query: varchar("query", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["merchant", "job", "general"]).default("general"),
  filters: json("filters"),
  resultsCount: int("resultsCount").default(0),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchLog = typeof searchLogs.$inferSelect;

// Favorites table
export const favorites = mysqlTable("favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number", unsigned: true }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number", unsigned: true }).references(() => jobs.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
