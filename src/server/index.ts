import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3001;

console.log(`Server starting on port ${port}...`);

serve({
	fetch: app.fetch,
	port,
});

console.log(`Server running at http://localhost:${port}`);
