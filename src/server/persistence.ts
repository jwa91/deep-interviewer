/**
 * Persistence Module
 *
 * Manages interview session storage and SQLite checkpointer.
 * Uses dependency injection for storage to enable easy testing.
 */

import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { v4 as uuidv4 } from "uuid";
import type { KeyValueStorage } from "./storage/index.js";
import { createNodeFileStorage } from "./storage/index.js";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface InterviewSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  participantId?: string;
}

export interface SessionStore {
  createSession(participantId?: string): InterviewSession;
  getSession(id: string): InterviewSession | undefined;
  updateSession(
    id: string,
    updates: Partial<Omit<InterviewSession, "id" | "createdAt">>
  ): InterviewSession | undefined;
  listSessions(): InterviewSession[];
  deleteSession(id: string): boolean;
}

// ═══════════════════════════════════════════════════════════════
// SESSION STORE FACTORY
// ═══════════════════════════════════════════════════════════════

const SESSIONS_FILE = "sessions.json";

/**
 * Creates a session store with the given storage backend.
 *
 * @param storage - Storage implementation (defaults to file storage)
 * @returns SessionStore instance
 *
 * @example
 * // Production usage
 * const store = createSessionStore();
 *
 * @example
 * // Test usage
 * const store = createSessionStore(new InMemoryStorage());
 */
export function createSessionStore(
  storage: KeyValueStorage = createNodeFileStorage()
): SessionStore {
  // In-memory cache
  let sessions = new Map<string, InterviewSession>();
  let initialized = false;

  function ensureInitialized(): void {
    if (initialized) {
      return;
    }

    try {
      const data = storage.read(SESSIONS_FILE);
      if (data) {
        const parsed = JSON.parse(data);
        sessions = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
    initialized = true;
  }

  function saveSessions(): void {
    try {
      const data = Object.fromEntries(sessions);
      storage.write(SESSIONS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save sessions:", error);
    }
  }

  return {
    createSession(participantId?: string): InterviewSession {
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
    },

    getSession(id: string): InterviewSession | undefined {
      ensureInitialized();
      return sessions.get(id);
    },

    updateSession(
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
    },

    listSessions(): InterviewSession[] {
      ensureInitialized();
      return Array.from(sessions.values());
    },

    deleteSession(id: string): boolean {
      ensureInitialized();
      const result = sessions.delete(id);
      if (result) {
        saveSessions();
      }
      return result;
    },
  };
}

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
// DEFAULT INSTANCE (for backwards compatibility during migration)
// ═══════════════════════════════════════════════════════════════

let defaultStore: SessionStore | null = null;

function getDefaultStore(): SessionStore {
  if (!defaultStore) {
    defaultStore = createSessionStore();
  }
  return defaultStore;
}

// Legacy exports - use these during migration, then switch to DI
export const createSession = (participantId?: string) =>
  getDefaultStore().createSession(participantId);
export const getSession = (id: string) => getDefaultStore().getSession(id);
export const updateSession = (
  id: string,
  updates: Partial<Omit<InterviewSession, "id" | "createdAt">>
) => getDefaultStore().updateSession(id, updates);
export const listSessions = () => getDefaultStore().listSessions();
export const deleteSession = (id: string) => getDefaultStore().deleteSession(id);

// For testing - resets the default store and checkpointer
// biome-ignore lint/style/useNamingConvention: underscore prefix indicates test-only function
export function _resetForTesting(): void {
  defaultStore = null;
  checkpointer = null;
}
