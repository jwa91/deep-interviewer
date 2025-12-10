import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  createSession,
  getSession,
  updateSession,
  listSessions,
  deleteSession,
  getCheckpointer,
  type InterviewSession,
} from "./persistence";

// Mock fs operations
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
}));

vi.mock("@langchain/langgraph-checkpoint-sqlite", () => ({
  SqliteSaver: {
    fromConnString: vi.fn().mockReturnValue({
      // Mock checkpointer instance
    }),
  },
}));

describe("persistence", () => {
  const mockDataDir = "/tmp/test-data";
  const mockSessionsFile = join(mockDataDir, "sessions.json");

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module state by clearing the internal cache
    vi.resetModules();
    process.env.DATA_DIR = mockDataDir;
  });

  afterEach(() => {
    delete process.env.DATA_DIR;
  });

  describe("createSession", () => {
    it("creates a new session with generated UUID", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});

      const session = createSession();

      expect(session.id).toBeDefined();
      expect(session.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(session.isComplete).toBe(false);
      expect(session.participantId).toBeUndefined();
    });

    it("creates session with participantId", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});

      const session = createSession("participant-123");

      expect(session.participantId).toBe("participant-123");
    });

    it("saves session to file", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});

      createSession();

      expect(writeFileSync).toHaveBeenCalled();
      const callArgs = vi.mocked(writeFileSync).mock.calls[0];
      expect(callArgs[0]).toBe(mockSessionsFile);
      expect(callArgs[1]).toContain('"isComplete":false');
    });
  });

  describe("getSession", () => {
    it("returns session when it exists", () => {
      const mockSession: InterviewSession = {
        id: "session-123",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z",
        isComplete: false,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          "session-123": mockSession,
        })
      );

      const session = getSession("session-123");

      expect(session).toEqual(mockSession);
    });

    it("returns undefined when session does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

      const session = getSession("non-existent");

      expect(session).toBeUndefined();
    });

    it("loads sessions from file on first access", () => {
      const mockSessions = {
        "session-1": {
          id: "session-1",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
          isComplete: false,
        },
        "session-2": {
          id: "session-2",
          createdAt: "2024-01-15T11:00:00.000Z",
          updatedAt: "2024-01-15T11:00:00.000Z",
          isComplete: true,
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSessions));

      const session1 = getSession("session-1");
      const session2 = getSession("session-2");

      expect(session1?.id).toBe("session-1");
      expect(session2?.id).toBe("session-2");
      expect(readFileSync).toHaveBeenCalledTimes(1); // Only loaded once
    });

    it("handles missing sessions file gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const session = getSession("any-id");

      expect(session).toBeUndefined();
    });

    it("handles invalid JSON in sessions file gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("invalid json");

      // Should not throw, but return undefined
      const session = getSession("any-id");

      expect(session).toBeUndefined();
    });
  });

  describe("updateSession", () => {
    it("updates existing session", () => {
      const existingSession: InterviewSession = {
        id: "session-123",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z",
        isComplete: false,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          "session-123": existingSession,
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      const updated = updateSession("session-123", {
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
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

      const updated = updateSession("non-existent", { isComplete: true });

      expect(updated).toBeUndefined();
    });

    it("saves updated session to file", () => {
      const existingSession: InterviewSession = {
        id: "session-123",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z",
        isComplete: false,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          "session-123": existingSession,
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      updateSession("session-123", { isComplete: true });

      expect(writeFileSync).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(savedData["session-123"].isComplete).toBe(true);
    });
  });

  describe("listSessions", () => {
    it("returns all sessions", () => {
      const mockSessions = {
        "session-1": {
          id: "session-1",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
          isComplete: false,
        },
        "session-2": {
          id: "session-2",
          createdAt: "2024-01-15T11:00:00.000Z",
          updatedAt: "2024-01-15T11:00:00.000Z",
          isComplete: true,
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSessions));

      const sessions = listSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toContain("session-1");
      expect(sessions.map((s) => s.id)).toContain("session-2");
    });

    it("returns empty array when no sessions file exists", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const sessions = listSessions();

      expect(sessions).toEqual([]);
    });
  });

  describe("deleteSession", () => {
    it("deletes existing session", () => {
      const mockSessions = {
        "session-1": {
          id: "session-1",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
          isComplete: false,
        },
        "session-2": {
          id: "session-2",
          createdAt: "2024-01-15T11:00:00.000Z",
          updatedAt: "2024-01-15T11:00:00.000Z",
          isComplete: true,
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSessions));
      vi.mocked(writeFileSync).mockImplementation(() => {});

      const deleted = deleteSession("session-1");

      expect(deleted).toBe(true);
      expect(writeFileSync).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(savedData["session-1"]).toBeUndefined();
      expect(savedData["session-2"]).toBeDefined();
    });

    it("returns false when session does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

      const deleted = deleteSession("non-existent");

      expect(deleted).toBe(false);
    });

    it("saves file after deletion", () => {
      const mockSessions = {
        "session-1": {
          id: "session-1",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
          isComplete: false,
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSessions));
      vi.mocked(writeFileSync).mockImplementation(() => {});

      deleteSession("session-1");

      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe("getCheckpointer", () => {
    it("creates checkpointer on first call", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);

      const checkpointer = await getCheckpointer();

      expect(checkpointer).toBeDefined();
      expect(mkdir).toHaveBeenCalledWith(mockDataDir, { recursive: true });
    });

    it("returns same checkpointer instance on subsequent calls", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);

      const checkpointer1 = await getCheckpointer();
      const checkpointer2 = await getCheckpointer();

      expect(checkpointer1).toBe(checkpointer2);
      expect(mkdir).toHaveBeenCalledTimes(1); // Only created once
    });

    it("uses DATA_DIR environment variable", async () => {
      const customDir = "/custom/data/dir";
      process.env.DATA_DIR = customDir;

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);

      await getCheckpointer();

      expect(mkdir).toHaveBeenCalledWith(customDir, { recursive: true });
    });

    it("defaults to ./data when DATA_DIR is not set", async () => {
      delete process.env.DATA_DIR;

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);

      await getCheckpointer();

      expect(mkdir).toHaveBeenCalledWith("./data", { recursive: true });
    });
  });

  describe("error handling", () => {
    it("handles file read errors gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("Read error");
      });

      // Should not throw
      const session = getSession("any-id");

      expect(session).toBeUndefined();
    });

    it("handles file write errors gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error("Write error");
      });

      // Should not throw, but session should still be created
      const session = createSession();

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
    });
  });
});

