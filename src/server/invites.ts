import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Invite {
  code: string;
  sessionId?: string;
  createdAt: string;
}

const DATA_DIR = process.env.DATA_DIR || "./data";
const INVITES_FILE = join(DATA_DIR, "invites.json");

// In-memory cache
let invites = new Map<string, Invite>();
let initialized = false;

function ensureInitialized() {
  if (initialized) {
    return;
  }

  try {
    if (existsSync(INVITES_FILE)) {
      const data = JSON.parse(readFileSync(INVITES_FILE, "utf-8"));
      invites = new Map(Object.entries(data));
    }
  } catch (error) {
    console.error("Failed to load invites:", error);
  }
  initialized = true;
}

function saveInvites() {
  try {
    const data = Object.fromEntries(invites);
    writeFileSync(INVITES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save invites:", error);
  }
}

export function createInvite(): string {
  ensureInitialized();

  // Generate random 6-char code (uppercase alphanumeric)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Ensure uniqueness (extremely unlikely to collide but good practice)
  if (invites.has(code)) {
    return createInvite();
  }

  const invite: Invite = {
    code,
    createdAt: new Date().toISOString(),
  };

  invites.set(code, invite);
  saveInvites();

  return code;
}

export function getInvite(code: string): Invite | undefined {
  ensureInitialized();
  return invites.get(code.toUpperCase()); // Case-insensitive lookup
}

export function linkSessionToInvite(code: string, sessionId: string): void {
  ensureInitialized();
  const upperCode = code.toUpperCase();
  const invite = invites.get(upperCode);

  if (invite) {
    invites.set(upperCode, { ...invite, sessionId });
    saveInvites();
  }
}

export function listInvites(): Invite[] {
  ensureInitialized();
  return Array.from(invites.values());
}
