import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { env } from "./lib/env";

import { SignJWT, jwtVerify } from "jose";

const getSecret = () => new TextEncoder().encode(env.sessionSecret || "sindbad-secret-key-2024");
const GOOGLE_CLIENT_ID = env.googleClientId || "";
const GOOGLE_CLIENT_SECRET = env.googleClientSecret || "";
const REDIRECT_URI = "https://www.euroarabmarket.com/api/auth/google/callback";

export const googleAuthRouter = createRouter({
  getAuthUrl: publicQuery.query(() => {
    if (!GOOGLE_CLIENT_ID) {
      return { url: null, error: "Google OAuth not configured" };
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
  }),

  callback: publicQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: input.code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
          }),
        });
        const tokens = await tokenRes.json();
        if (!tokenRes.ok) {
          console.error("[Google] Token error:", tokens);
          return { success: false, error: "Token exchange failed" };
        }

        const userRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
        const googleUser = await userRes.json();
        if (!googleUser.email) {
          return { success: false, error: "No email from Google" };
        }

        const db = getDb();
        const existing = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

        let userId: number;
        if (existing.length > 0) {
          await db.update(users).set({
            name: googleUser.name || googleUser.email.split("@")[0],
            avatar: googleUser.picture || null,
            updatedAt: new Date(),
          }).where(eq(users.id, existing[0].id));
          userId = existing[0].id;
        } else {
          const result = await db.insert(users).values({
            unionId: `google_${googleUser.id}`,
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split("@")[0],
            avatar: googleUser.picture || null,
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          userId = result[0].id;
        }

        const token = await new SignJWT({ userId, email: googleUser.email, name: googleUser.name })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(getSecret());

        return {
          success: true,
          token,
          user: { id: userId, name: googleUser.name, email: googleUser.email, avatar: googleUser.picture },
        };
      } catch (e: any) {
        console.error("[Google Auth] Error:", e.message);
        return { success: false, error: e.message };
      }
    }),

  me: publicQuery
    .input(z.object({ token: z.string() }).optional())
    .query(async ({ input }) => {
      if (!input?.token) return null;
      try {
        const { payload } = await jwtVerify(input.token, getSecret(), { clockTolerance: 60 });
        return payload;
      } catch {
        return null;
      }
    }),
});
