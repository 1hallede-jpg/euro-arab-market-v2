import { relations } from "drizzle-orm";
import { users, merchants, jobs, reviews, chatMessages, searchLogs, favorites } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  merchants: many(merchants),
  jobs: many(jobs),
  reviews: many(reviews),
  chatMessages: many(chatMessages),
  searchLogs: many(searchLogs),
  favorites: many(favorites),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, { fields: [merchants.userId], references: [users.id] }),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  favorites: many(favorites),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [reviews.merchantId], references: [merchants.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const searchLogsRelations = relations(searchLogs, ({ one }) => ({
  user: one(users, { fields: [searchLogs.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [favorites.merchantId], references: [merchants.id] }),
  job: one(jobs, { fields: [favorites.jobId], references: [jobs.id] }),
}));
