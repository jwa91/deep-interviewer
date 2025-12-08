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

// In-memory session store (for now - could be SQLite later)
const sessions = new Map<string, InterviewSession>();

/**
 * Creates a new interview session
 */
export function createSession(participantId?: string): InterviewSession {
  const session: InterviewSession = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isComplete: false,
    participantId,
  };

  sessions.set(session.id, session);
  return session;
}

/**
 * Gets a session by ID
 */
export function getSession(id: string): InterviewSession | undefined {
  return sessions.get(id);
}

/**
 * Updates a session
 */
export function updateSession(
  id: string,
  updates: Partial<Omit<InterviewSession, "id" | "createdAt">>
): InterviewSession | undefined {
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
  return updated;
}

/**
 * Lists all sessions
 */
export function listSessions(): InterviewSession[] {
  return Array.from(sessions.values());
}

/**
 * Deletes a session
 */
export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}
