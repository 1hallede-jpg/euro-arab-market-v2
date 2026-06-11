import { authRouter } from "./auth-router";
import { merchantRouter } from "./merchant-router";
import { jobRouter } from "./job-router";
import { searchRouter } from "./search-router";
import { sindbadRouter } from "./sindbad-router";
import { adminRouter } from "./admin-router";
import { adminAuthRouter } from "./admin-auth-router";
import { subscriptionRouter } from "./subscription-router";
import { claimRouter } from "./claim-router";
import { seedRouter } from "./seed-router";
import { migrateRouter } from "./migrate-router";
import { reviewsRouter } from "./reviews-router";
import { featuredRouter, analyticsRouter } from "./featured-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
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
});

export type AppRouter = typeof appRouter;
