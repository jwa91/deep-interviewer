import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInvite, getInvite, linkSessionToInvite, listInvites, _resetForTesting, type Invite } from "./invites";

// Mock fs operations
vi.mock("node:fs", () => {
  const existsSync = vi.fn();
  const readFileSync = vi.fn();
  const writeFileSync = vi.fn();
  return {
    default: { existsSync, readFileSync, writeFileSync },
    existsSync,
    readFileSync,
    writeFileSync,
  };
});

describe("invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetForTesting();
    // Mock Math.random to make tests deterministic
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createInvite", () => {
    it("generates a 6-character uppercase alphanumeric code", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});
      // Mock random to generate predictable code
      vi.spyOn(Math, "random").mockReturnValue(0.123456789);

      const code = createInvite();

      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(code.length).toBe(6);
    });

    it("saves invite to file", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});

      createInvite();

      expect(writeFileSync).toHaveBeenCalled();
      const callArgs = vi.mocked(writeFileSync).mock.calls[0];
      expect(String(callArgs[0])).toContain("invites.json");
      const savedData = JSON.parse(callArgs[1] as string);
      expect(Object.keys(savedData).length).toBeGreaterThan(0);
    });

    it("creates invite with createdAt timestamp", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {});

      const code = createInvite();
      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      const invite = savedData[code];

      expect(invite.createdAt).toBeDefined();
      expect(new Date(invite.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("ensures uniqueness by regenerating if code exists", () => {
      const existingCode = "EXISTS";
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          [existingCode]: {
            code: existingCode,
            createdAt: "2024-01-15T10:00:00.000Z",
          },
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      // Mock random to return the existing code first, then a new one
      let callCount = 0;
      vi.spyOn(Math, "random").mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0.123 : 0.456; // First returns existing, second returns new
      });

      const code = createInvite();

      expect(code).not.toBe(existingCode);
    });
  });

  describe("getInvite", () => {
    it("returns invite when it exists", () => {
      const mockInvite: Invite = {
        code: "TEST123",
        createdAt: "2024-01-15T10:00:00.000Z",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          TEST123: mockInvite,
        })
      );

      const invite = getInvite("TEST123");

      expect(invite).toEqual(mockInvite);
    });

    it("performs case-insensitive lookup", () => {
      const mockInvite: Invite = {
        code: "TEST123",
        createdAt: "2024-01-15T10:00:00.000Z",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          TEST123: mockInvite,
        })
      );

      const invite1 = getInvite("test123");
      const invite2 = getInvite("Test123");
      const invite3 = getInvite("TEST123");

      expect(invite1).toEqual(mockInvite);
      expect(invite2).toEqual(mockInvite);
      expect(invite3).toEqual(mockInvite);
    });

    it("returns undefined when invite does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

      const invite = getInvite("NONEXIST");

      expect(invite).toBeUndefined();
    });

    it("loads invites from file on first access", () => {
      const mockInvites = {
        CODE1: {
          code: "CODE1",
          createdAt: "2024-01-15T10:00:00.000Z",
        },
        CODE2: {
          code: "CODE2",
          createdAt: "2024-01-15T11:00:00.000Z",
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockInvites));

      const invite1 = getInvite("CODE1");
      const invite2 = getInvite("CODE2");

      expect(invite1?.code).toBe("CODE1");
      expect(invite2?.code).toBe("CODE2");
      expect(readFileSync).toHaveBeenCalledTimes(1); // Only loaded once
    });

    it("handles missing invites file gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const invite = getInvite("any-code");

      expect(invite).toBeUndefined();
    });

    it("handles invalid JSON in invites file gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("invalid json");

      const invite = getInvite("any-code");

      expect(invite).toBeUndefined();
    });
  });

  describe("linkSessionToInvite", () => {
    it("links sessionId to existing invite", () => {
      const mockInvite: Invite = {
        code: "TEST123",
        createdAt: "2024-01-15T10:00:00.000Z",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          TEST123: mockInvite,
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      linkSessionToInvite("TEST123", "session-456");

      expect(writeFileSync).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(savedData.TEST123.sessionId).toBe("session-456");
    });

    it("does nothing when invite does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));
      vi.mocked(writeFileSync).mockImplementation(() => {});

      linkSessionToInvite("NONEXIST", "session-456");

      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it("performs case-insensitive lookup", () => {
      const mockInvite: Invite = {
        code: "TEST123",
        createdAt: "2024-01-15T10:00:00.000Z",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          TEST123: mockInvite,
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      linkSessionToInvite("test123", "session-456");

      expect(writeFileSync).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(savedData.TEST123.sessionId).toBe("session-456");
    });

    it("preserves existing invite properties when linking", () => {
      const mockInvite: Invite = {
        code: "TEST123",
        createdAt: "2024-01-15T10:00:00.000Z",
        sessionId: "old-session",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          TEST123: mockInvite,
        })
      );
      vi.mocked(writeFileSync).mockImplementation(() => {});

      linkSessionToInvite("TEST123", "new-session");

      const savedData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(savedData.TEST123.code).toBe("TEST123");
      expect(savedData.TEST123.createdAt).toBe(mockInvite.createdAt);
      expect(savedData.TEST123.sessionId).toBe("new-session");
    });
  });

  describe("listInvites", () => {
    it("returns all invites", () => {
      const mockInvites = {
        CODE1: {
          code: "CODE1",
          createdAt: "2024-01-15T10:00:00.000Z",
        },
        CODE2: {
          code: "CODE2",
          createdAt: "2024-01-15T11:00:00.000Z",
          sessionId: "session-123",
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockInvites));

      const invites = listInvites();

      expect(invites).toHaveLength(2);
      expect(invites.map((i) => i.code)).toContain("CODE1");
      expect(invites.map((i) => i.code)).toContain("CODE2");
    });

    it("returns empty array when no invites file exists", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const invites = listInvites();

      expect(invites).toEqual([]);
    });

    it("includes sessionId when present", () => {
      const mockInvites = {
        CODE1: {
          code: "CODE1",
          createdAt: "2024-01-15T10:00:00.000Z",
          sessionId: "session-123",
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockInvites));

      const invites = listInvites();

      expect(invites[0].sessionId).toBe("session-123");
    });
  });

  describe("error handling", () => {
    it("handles file read errors gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("Read error");
      });

      // Should not throw
      const invite = getInvite("any-code");

      expect(invite).toBeUndefined();
    });

    it("handles file write errors gracefully", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error("Write error");
      });
      // Use a random value that produces a 6+ character base36 string
      vi.spyOn(Math, "random").mockReturnValue(0.123456789);

      // Should not throw, but code should still be generated
      const code = createInvite();

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
    });
  });
});

