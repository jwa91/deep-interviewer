import "dotenv/config";
import { readFile } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { interviewRoutes } from "./routes/index.js";

// ═══════════════════════════════════════════════════════════════
// SERVER SETUP
// ═══════════════════════════════════════════════════════════════

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*", // Configure for production
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

// API info
app.get("/", (c) =>
  c.json({
    name: "Deep Interviewer API",
    version: "0.1.0",
    endpoints: {
      health: "GET /health",
      interviews: {
        list: "GET /api/interviews",
        create: "POST /api/interviews",
        get: "GET /api/interviews/:id",
        chat: "POST /api/interviews/:id/chat",
        results: "GET /api/interviews/:id/results",
      },
    },
  })
);

// Interview routes
app.route("/api/interviews", interviewRoutes);

// ═══════════════════════════════════════════════════════════════
// STATIC FILES (Production only)
// ═══════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./client" }));

  // SPA fallback
  app.get("*", async (c) => {
    try {
      const indexHtml = await readFile("./client/index.html", "utf-8");
      return c.html(indexHtml);
    } catch (_e) {
      return c.text("Not found", 404);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const port = Number(process.env.PORT) || 3001;

// Check required environment variables
const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
const hasLangSmith = !!process.env.LANGSMITH_API_KEY;

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   Deep Interviewer API                        ║
╠══════════════════════════════════════════════════════════════╣
║  Server starting on port ${port}...                              ║
║  Health check: http://localhost:${port}/health                   ║
║  API docs:     http://localhost:${port}/                         ║
╠══════════════════════════════════════════════════════════════╣
║  Anthropic API Key: ${hasAnthropicKey ? "✓ loaded" : "✗ missing"}                            ║
║  LangSmith:         ${hasLangSmith ? "✓ enabled" : "✗ disabled"}                           ║
╚══════════════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
