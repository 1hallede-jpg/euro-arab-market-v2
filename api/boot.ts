import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "../contracts/constants";
import fs from "fs";
import path from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// CORS for both Render and custom domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://euro-arab-market.onrender.com",
  "https://www.euroarabmarket.com",
  "https://euroarabmarket.com",
];

app.use("/api/trpc/*", cors({
  origin: (origin) => {
    if (!origin || allowedOrigins.includes(origin)) return origin;
    return null;
  },
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Security headers for all responses
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
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Static files - serve from dist (built files), NOT public (stale cached files)
const possiblePaths = [
  path.join(process.cwd(), "dist"),
  path.join(process.cwd(), "dist", "public"),
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

  // Direct search page (bypasses React SPA to avoid cache issues)
  app.use("/search", async (c, next) => {
    const indexPath = path.join(publicPath, "search.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      });
    }
    const staticPath = path.join(publicPath, "search-static.html");
    if (fs.existsSync(staticPath)) {
      return c.html(fs.readFileSync(staticPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      });
    }
    await next();
  });

  // Serve assets
  app.use("/assets/*", async (c) => {
    const file = path.basename(c.req.path);
    const filePath = path.join(publicPath, "assets", file);
    if (!fs.existsSync(filePath)) return c.json({ error: "Not found" }, 404);
    const ext = path.extname(filePath);
    const mime: Record<string, string> = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml",
    };
    return new Response(fs.readFileSync(filePath), {
      headers: { "Content-Type": mime[ext] || "text/plain" },
    });
  });

  // SPA fallback
  app.use("*", async (c) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"), 200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      });
    }
    return c.json({ error: "index.html missing", publicPath }, 500);
  });
}

// Start server
const { serve } = await import("@hono/node-server");
const port = parseInt(process.env.PORT || "3000");
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}/`);
});

export default app;
