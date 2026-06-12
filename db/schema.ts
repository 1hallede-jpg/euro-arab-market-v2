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
  jsonb,
} from "drizzle-orm/pg-core";

// ==================== ENUMS ====================
const roleEnum = pgEnum("role", ["user", "admin"]);

const merchantCategoryEnum = pgEnum("merchant_category", [
  "restaurant", "supermarket", "sweets", "barber", "butcher",
  "bakery", "cafe", "clothing", "electronics", "pharmacy",
  "halal_grocery", "shisha_lounge", "travel_agency", "money_transfer",
  "mosque", "cultural_center", "car_dealer", "repair_shop", "other",
]);

const merchantStatusEnum = pgEnum("merchant_status", [
  "pending", "active", "suspended", "rejected", "claimed",
]);

const jobCategoryEnum = pgEnum("job_category", [
  "construction", "driving", "photography", "painting", "plumbing",
  "electrician", "carpentry", "cleaning", "cooking", "it",
  "translation", "accounting", "medical", "education", "other",
]);

const jobTypeEnum = pgEnum("job_type", [
  "full_time", "part_time", "contract", "freelance", "temporary",
]);

const experienceLevelEnum = pgEnum("experience_level", [
  "entry", "mid", "senior", "expert",
]);

const jobStatusEnum = pgEnum("job_status", [
  "open", "closed", "filled", "paused",
]);

const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
const searchTypeEnum = pgEnum("search_type", ["merchant", "job", "general"]);
const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "expired", "cancelled", "trial",
]);
const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "basic", "premium", "featured",
]);
const claimStatusEnum = pgEnum("claim_status", [
  "pending", "approved", "rejected",
]);

// ==================== USERS ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== MERCHANTS (COMPLETE) ====================
export const merchants = pgTable("merchants", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

// ==================== JOBS ====================
export const jobs = pgTable("jobs", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  expiresAt: timestamp("expiresAt"),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// ==================== REVIEWS ====================
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== SUBSCRIPTIONS (For Business Owners) ====================
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  plan: subscriptionPlanEnum("plan").default("basic").notNull(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  billingCycle: varchar("billingCycle", { length: 20 }).default("monthly"), // monthly, yearly
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // paypal, stripe
  paymentId: varchar("paymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

// ==================== CLAIMS (Claim Business) ====================
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  status: claimStatusEnum("status").default("pending").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  proofDocument: text("proofDocument"), // URL to uploaded document
  businessRegistration: text("businessRegistration"),
  message: text("message"),
  reviewedBy: bigint("reviewedBy", { mode: "number" }).references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;

// ==================== CHAT MESSAGES (Sindbad) ====================
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  wishesUsed: integer("wishesUsed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== SEARCH LOGS ====================
export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  query: varchar("query", { length: 500 }).notNull(),
  type: searchTypeEnum("type").default("general"),
  filters: jsonb("filters"),
  resultsCount: integer("resultsCount").default(0),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==================== EMERGENCY CONTACTS ====================
export const emergencyTypeEnum = pgEnum("emergency_type", [
  "embassy", "hospital", "police", "fire", "pharmacy_24h", 
  "tourist_police", "airport", "lost_card", "taxi", "other",
]);

export const emergencyContacts = pgTable("emergency_contacts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;

// ==================== PENDING MERCHANTS (Registration) ====================
export const pendingMerchants = pgTable("pending_merchants", {
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
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected, more_info
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PendingMerchant = typeof pendingMerchants.$inferSelect;
export type InsertPendingMerchant = typeof pendingMerchants.$inferInsert;

// ==================== SKILLS / FREELANCERS ====================
export const skillStatusEnum = pgEnum("skill_status", [
  "pending", "active", "suspended", "rejected",
]);

export const skills = pgTable("skills", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

// ==================== FAVORITES ====================
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
