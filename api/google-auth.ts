import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { env } from "./lib/env";
import { sign, verify as verifyJwt } from "jsonwebtoken";

// Google OAuth Configuration
// User needs to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Render env vars
const GOOGLE_CLIENT_ID = env.googleClientId || "";
const GOOGLE_CLIENT_SECRET = env.googleClientSecret || "";
const REDIRECT_URI = "https://www.euroarabmarket.com/api/auth/google/callback";

export const googleAuthRouter = createRouter({
  // Get Google auth URL for frontend
  getAuthUrl: publicQuery.query(() => {
    if (!GOOGLE_CLIENT_ID) {
      return {
        url: null,
        error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables.",
      };
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }),

  // Handle Google OAuth callback
  callback: publicQuery
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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

        const tokens = await tokenResponse.json();
        if (!tokenResponse.ok) {
          console.error("[Google Auth] Token error:", tokens);
          return { success: false, error: "Failed to exchange code" };
        }

        // Get user info from Google
        const userResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
        );
        const googleUser = await userResponse.json();

        if (!googleUser.email) {
          return { success: false, error: "No email from Google" };
        }

        // Find or create user
        const db = getDb();
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, googleUser.email))
          .limit(1);

        let userId: number;

        if (existingUsers.length > 0) {
          // Update existing user
          await db
            .update(users)
            .set({
              name: googleUser.name || googleUser.email.split("@")[0],
              avatar: googleUser.picture || null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUsers[0].id));
          userId = existingUsers[0].id;
        } else {
          // Create new user
          const result = await db
            .insert(users)
            .values({
              unionId: `google_${googleUser.id}`,
              email: googleUser.email,
              name: googleUser.name || googleUser.email.split("@")[0],
              avatar: googleUser.picture || null,
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          userId = result[0].id;
        }

        // Create JWT token
        const token = sign(
          {
            userId,
            email: googleUser.email,
            name: googleUser.name,
          },
          env.sessionSecret || "sindbad-secret-key",
          { expiresIn: "7d" }
        );

        return {
          success: true,
          token,
          user: {
            id: userId,
            name: googleUser.name,
            email: googleUser.email,
            avatar: googleUser.picture,
          },
        };
      } catch (e: any) {
        console.error("[Google Auth] Error:", e.message);
        return { success: false, error: e.message };
      }
    }),

  // Get current user from token
  me: publicQuery
    .input(z.object({ token: z.string() }).optional())
    .query(async ({ input }) => {
      if (!input?.token) return null;
      try {
        const decoded = verifyJwt(
          input.token,
          env.sessionSecret || "sindbad-secret-key"
        );
        return decoded;
      } catch {
        return null;
      }
    }),
});
