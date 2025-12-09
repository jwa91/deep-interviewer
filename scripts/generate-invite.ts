import { createInvite } from "../src/server/invites";

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || "./data";
const { mkdir } = await import("node:fs/promises");
await mkdir(dataDir, { recursive: true });

const code = createInvite();
console.log(`\n✅ Generated new invite code: \x1b[32m${code}\x1b[0m\n`);
console.log(`Share this code with a participant to start an interview.`);

