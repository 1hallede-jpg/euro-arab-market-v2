import { authRouter } from "./auth-router";
import { merchantRouter } from "./merchant-router";
import { jobRouter } from "./job-router";
import { searchRouter } from "./search-router";
import { sindbadRouter } from "./sindbad-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  merchant: merchantRouter,
  job: jobRouter,
  search: searchRouter,
  sindbad: sindbadRouter,
});

export type AppRouter = typeof appRouter;
