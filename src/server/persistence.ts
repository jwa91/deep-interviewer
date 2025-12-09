import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { v4 as uuidv4 } from "uuid";

// ═══════════════════════════════════════════════════════════════
// SQLITE CHECKPOINTER
// Persists LangGraph conversation state
// ═══════════════════════════════════════════════════════════════

let checkpointer: SqliteSaver | null = null;

/**
 * Gets or creates the SQLite checkpointer.
 * Uses DATA_DIR env var or defaults to ./data
 */
export async function getCheckpointer(): Promise<SqliteSaver> {
  if (!checkpointer) {
    const dataDir = process.env.DATA_DIR || "./data";
    const dbPath = `${dataDir}/interviews.db`;

    // Ensure data directory exists
    const { mkdir } = await import("node:fs/promises");
    await mkdir(dataDir, { recursive: true });

    checkpointer = SqliteSaver.fromConnString(dbPath);
  }

  return checkpointer;
}

// ═══════════════════════════════════════════════════════════════
// SESSION STORAGE
// Simple metadata storage for interview sessions
// ═══════════════════════════════════════════════════════════════

export interface InterviewSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  participantId?: string;
}

const DATA_DIR = process.env.DATA_DIR || "./data";
const SESSIONS_FILE = join(DATA_DIR, "sessions.json");

// In-memory session store backed by file
let sessions = new Map<string, InterviewSession>();
let initialized = false;

function ensureInitialized() {
  if (initialized) {
    return;
  }

  try {
    if (existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(readFileSync(SESSIONS_FILE, "utf-8"));
      sessions = new Map(Object.entries(data));
    }
  } catch (error) {
    console.error("Failed to load sessions:", error);
  }
  initialized = true;
}

function saveSessions() {
  try {
    const data = Object.fromEntries(sessions);
    writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save sessions:", error);
  }
}

/**
 * Creates a new interview session
 */
export function createSession(participantId?: string): InterviewSession {
  ensureInitialized();

  const session: InterviewSession = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isComplete: false,
    participantId,
  };

  sessions.set(session.id, session);
  saveSessions();
  return session;
}

/**
 * Gets a session by ID
 */
export function getSession(id: string): InterviewSession | undefined {
  ensureInitialized();
  return sessions.get(id);
}

/**
 * Updates a session
 */
export function updateSession(
  id: string,
  updates: Partial<Omit<InterviewSession, "id" | "createdAt">>
): InterviewSession | undefined {
  ensureInitialized();
  const session = sessions.get(id);
  if (!session) {
    return undefined;
  }

  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  sessions.set(id, updated);
  saveSessions();
  return updated;
}

/**
 * Lists all sessions
 */
export function listSessions(): InterviewSession[] {
  ensureInitialized();
  return Array.from(sessions.values());
}

/**
 * Deletes a session
 */
export function deleteSession(id: string): boolean {
  ensureInitialized();
  const result = sessions.delete(id);
  if (result) {
    saveSessions();
  }
  return result;
}
