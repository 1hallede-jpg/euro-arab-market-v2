import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "euro-arab-market-admin-secret-key-2024"
);

export const adminAuthRouter = createRouter({
  // Login with username/password
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Hardcoded admin credentials for now
      // In production, store hashed password in DB
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EuroArab2024!";

      if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
        throw new Error("Invalid credentials");
      }

      // Create JWT token
      const token = await new jose.SignJWT({
        username: input.username,
        role: "admin",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(JWT_SECRET);

      return { token, username: input.username };
    }),

  // Verify token
  verify: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const { payload } = await jose.jwtVerify(input.token, JWT_SECRET, {
          clockTolerance: 60,
        });
        return { valid: true, username: payload.username as string };
      } catch {
        return { valid: false, username: "" };
      }
    }),
});
