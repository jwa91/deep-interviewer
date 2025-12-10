import { sessionFactory } from "@/test/factories";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type SessionStore,
  _resetForTesting,
  createSessionStore,
  getCheckpointer,
} from "./persistence";
import { InMemoryStorage } from "./storage";

// Mock only the SQLite checkpointer dependencies
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@langchain/langgraph-checkpoint-sqlite", () => ({
  SqliteSaver: {
    fromConnString: vi.fn().mockReturnValue({
      // Mock checkpointer instance
    }),
  },
}));

describe("persistence", () => {
  let storage: InMemoryStorage;
  let store: SessionStore;

  beforeEach(() => {
    storage = new InMemoryStorage();
    store = createSessionStore(storage);
    _resetForTesting(); // Reset checkpointer for getCheckpointer tests
  });

  describe("createSession", () => {
    it("creates a new session with generated UUID", () => {
      const session = store.createSession();

      expect(session.id).toBeDefined();
      expect(session.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(session.isComplete).toBe(false);
      expect(session.participantId).toBeUndefined();
    });

    it("creates session with participantId", () => {
      const session = store.createSession("participant-123");

      expect(session.participantId).toBe("participant-123");
    });

    it("saves session to storage", () => {
      const session = store.createSession();

      const data = storage.read("sessions.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData[session.id]).toBeDefined();
      expect(savedData[session.id].isComplete).toBe(false);
    });
  });

  describe("getSession", () => {
    it("returns session when it exists", () => {
      const mockSession = sessionFactory.withId("session-123");
      storage.seed({
        "sessions.json": JSON.stringify({ "session-123": mockSession }),
      });
      store = createSessionStore(storage);

      const session = store.getSession("session-123");

      expect(session).toEqual(mockSession);
    });

    it("returns undefined when session does not exist", () => {
      storage.seed({ "sessions.json": JSON.stringify({}) });
      store = createSessionStore(storage);

      const session = store.getSession("non-existent");

      expect(session).toBeUndefined();
    });

    it("loads sessions from storage on first access", () => {
      const session1 = sessionFactory.withId("session-1");
      const session2 = sessionFactory.withId("session-2", { isComplete: true });
      storage.seed({
        "sessions.json": JSON.stringify({
          "session-1": session1,
          "session-2": session2,
        }),
      });
      store = createSessionStore(storage);

      const result1 = store.getSession("session-1");
      const result2 = store.getSession("session-2");

      expect(result1?.id).toBe("session-1");
      expect(result2?.id).toBe("session-2");
    });

    it("handles missing sessions file gracefully", () => {
      // Empty storage - no sessions.json
      store = createSessionStore(storage);

      const session = store.getSession("any-id");

      expect(session).toBeUndefined();
    });

    it("handles invalid JSON in sessions file gracefully", () => {
      storage.seed({ "sessions.json": "invalid json" });
      store = createSessionStore(storage);

      // Should not throw, but return undefined
      const session = store.getSession("any-id");

      expect(session).toBeUndefined();
    });
  });

  describe("updateSession", () => {
    it("updates existing session", () => {
      const existingSession = sessionFactory.withId("session-123");
      storage.seed({
        "sessions.json": JSON.stringify({ "session-123": existingSession }),
      });
      store = createSessionStore(storage);

      const updated = store.updateSession("session-123", {
        isComplete: true,
        participantId: "participant-456",
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe("session-123");
      expect(updated?.isComplete).toBe(true);
      expect(updated?.participantId).toBe("participant-456");
      expect(updated?.createdAt).toBe(existingSession.createdAt); // Should not change
      expect(updated?.updatedAt).not.toBe(existingSession.updatedAt); // Should be updated
    });

    it("returns undefined when session does not exist", () => {
      storage.seed({ "sessions.json": JSON.stringify({}) });
      store = createSessionStore(storage);

      const updated = store.updateSession("non-existent", { isComplete: true });

      expect(updated).toBeUndefined();
    });

    it("saves updated session to storage", () => {
      const existingSession = sessionFactory.withId("session-123");
      storage.seed({
        "sessions.json": JSON.stringify({ "session-123": existingSession }),
      });
      store = createSessionStore(storage);

      store.updateSession("session-123", { isComplete: true });

      const data = storage.read("sessions.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData["session-123"].isComplete).toBe(true);
    });
  });

  describe("listSessions", () => {
    it("returns all sessions", () => {
      const session1 = sessionFactory.withId("session-1");
      const session2 = sessionFactory.withId("session-2", { isComplete: true });
      storage.seed({
        "sessions.json": JSON.stringify({
          "session-1": session1,
          "session-2": session2,
        }),
      });
      store = createSessionStore(storage);

      const sessions = store.listSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toContain("session-1");
      expect(sessions.map((s) => s.id)).toContain("session-2");
    });

    it("returns empty array when no sessions file exists", () => {
      // Empty storage
      store = createSessionStore(storage);

      const sessions = store.listSessions();

      expect(sessions).toEqual([]);
    });
  });

  describe("deleteSession", () => {
    it("deletes existing session", () => {
      const session1 = sessionFactory.withId("session-1");
      const session2 = sessionFactory.withId("session-2", { isComplete: true });
      storage.seed({
        "sessions.json": JSON.stringify({
          "session-1": session1,
          "session-2": session2,
        }),
      });
      store = createSessionStore(storage);

      const deleted = store.deleteSession("session-1");

      expect(deleted).toBe(true);
      const data = storage.read("sessions.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData["session-1"]).toBeUndefined();
      expect(savedData["session-2"]).toBeDefined();
    });

    it("returns false when session does not exist", () => {
      storage.seed({ "sessions.json": JSON.stringify({}) });
      store = createSessionStore(storage);

      const deleted = store.deleteSession("non-existent");

      expect(deleted).toBe(false);
    });

    it("saves file after deletion", () => {
      const session1 = sessionFactory.withId("session-1");
      storage.seed({
        "sessions.json": JSON.stringify({ "session-1": session1 }),
      });
      store = createSessionStore(storage);

      store.deleteSession("session-1");

      const data = storage.read("sessions.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData["session-1"]).toBeUndefined();
    });
  });

  describe("getCheckpointer", () => {
    const { mkdir } = vi.hoisted(() => ({
      mkdir: vi.fn().mockResolvedValue(undefined),
    }));

    beforeEach(() => {
      vi.doMock("node:fs/promises", () => ({ mkdir }));
      _resetForTesting();
    });

    afterEach(() => {
      delete process.env.DATA_DIR;
    });

    it("creates checkpointer on first call", async () => {
      const checkpointer = await getCheckpointer();

      expect(checkpointer).toBeDefined();
    });

    it("returns same checkpointer instance on subsequent calls", async () => {
      const checkpointer1 = await getCheckpointer();
      const checkpointer2 = await getCheckpointer();

      expect(checkpointer1).toBe(checkpointer2);
    });

    it("uses DATA_DIR environment variable", async () => {
      const { mkdir: mkdirMock } = await import("node:fs/promises");
      const customDir = "/custom/data/dir";
      process.env.DATA_DIR = customDir;
      _resetForTesting();

      await getCheckpointer();

      expect(mkdirMock).toHaveBeenCalledWith(customDir, { recursive: true });
    });

    it("defaults to ./data when DATA_DIR is not set", async () => {
      const { mkdir: mkdirMock } = await import("node:fs/promises");
      delete process.env.DATA_DIR;
      _resetForTesting();

      await getCheckpointer();

      expect(mkdirMock).toHaveBeenCalledWith("./data", { recursive: true });
    });
  });
});
