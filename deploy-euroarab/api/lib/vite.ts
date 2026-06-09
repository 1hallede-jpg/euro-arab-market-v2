import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const cwd = process.cwd();
  const distPath = path.join(cwd, "dist", "public");

  console.log("[DEBUG] CWD:", cwd);
  console.log("[DEBUG] Looking for dist at:", distPath);
  console.log("[DEBUG] Exists:", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    app.use("*", (c) => c.json({ 
      error: "dist/public not found",
      cwd: cwd,
      tried: distPath,
      files: fs.existsSync(cwd) ? fs.readdirSync(cwd) : "cwd not found"
    }, 500));
    return;
  }

  // Serve assets
  app.use("/assets/*", (c) => {
    const file = path.basename(c.req.path);
    const filePath = path.join(distPath, "assets", file);
    if (!fs.existsSync(filePath)) return c.json({ error: "Not found" }, 404);
    const ext = path.extname(filePath);
    const mime: Record<string, string> = { ".js": "application/javascript", ".css": "text/css" };
    return new Response(fs.readFileSync(filePath), { headers: { "Content-Type": mime[ext] || "text/plain" }});
  });

  // SPA fallback
  app.use("*", (c) => {
    const index = path.join(distPath, "index.html");
    if (fs.existsSync(index)) return c.html(fs.readFileSync(index, "utf-8"));
    return c.json({ error: "index.html missing", distPath }, 500);
  });
}
