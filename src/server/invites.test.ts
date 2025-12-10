import { inviteFactory } from "@/test/factories";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type InviteStore, createInviteStore } from "./invites";
import { InMemoryStorage } from "./storage";

describe("invites", () => {
  let storage: InMemoryStorage;
  let store: InviteStore;

  beforeEach(() => {
    storage = new InMemoryStorage();
    store = createInviteStore(storage);
    // Mock Math.random to make tests deterministic
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createInvite", () => {
    it("generates a 6-character uppercase alphanumeric code", () => {
      // Mock random to generate predictable code
      vi.spyOn(Math, "random").mockReturnValue(0.123456789);

      const code = store.createInvite();

      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(code.length).toBe(6);
    });

    it("saves invite to storage", () => {
      const code = store.createInvite();

      const data = storage.read("invites.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData[code]).toBeDefined();
    });

    it("creates invite with createdAt timestamp", () => {
      const code = store.createInvite();

      const data = storage.read("invites.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      const invite = savedData[code];

      expect(invite.createdAt).toBeDefined();
      expect(new Date(invite.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("ensures uniqueness by regenerating if code exists", () => {
      // Pre-seed storage with an existing invite
      const existingInvite = inviteFactory.withCode("EXISTS");
      storage.seed({
        "invites.json": JSON.stringify({ EXISTS: existingInvite }),
      });

      // Create a new store that will load the seeded data
      store = createInviteStore(storage);

      // Mock random to return the existing code first, then a new one
      let callCount = 0;
      vi.spyOn(Math, "random").mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0.123 : 0.456; // First returns existing, second returns new
      });

      const code = store.createInvite();

      expect(code).not.toBe("EXISTS");
    });
  });

  describe("getInvite", () => {
    it("returns invite when it exists", () => {
      const mockInvite = inviteFactory.withCode("TEST123");
      storage.seed({
        "invites.json": JSON.stringify({ TEST123: mockInvite }),
      });
      store = createInviteStore(storage);

      const invite = store.getInvite("TEST123");

      expect(invite).toEqual(mockInvite);
    });

    it("performs case-insensitive lookup", () => {
      const mockInvite = inviteFactory.withCode("TEST123");
      storage.seed({
        "invites.json": JSON.stringify({ TEST123: mockInvite }),
      });
      store = createInviteStore(storage);

      const invite1 = store.getInvite("test123");
      const invite2 = store.getInvite("Test123");
      const invite3 = store.getInvite("TEST123");

      expect(invite1).toEqual(mockInvite);
      expect(invite2).toEqual(mockInvite);
      expect(invite3).toEqual(mockInvite);
    });

    it("returns undefined when invite does not exist", () => {
      storage.seed({ "invites.json": JSON.stringify({}) });
      store = createInviteStore(storage);

      const invite = store.getInvite("NONEXIST");

      expect(invite).toBeUndefined();
    });

    it("loads invites from storage on first access", () => {
      const invite1 = inviteFactory.withCode("CODE1");
      const invite2 = inviteFactory.withCode("CODE2");
      storage.seed({
        "invites.json": JSON.stringify({ CODE1: invite1, CODE2: invite2 }),
      });
      store = createInviteStore(storage);

      const result1 = store.getInvite("CODE1");
      const result2 = store.getInvite("CODE2");

      expect(result1?.code).toBe("CODE1");
      expect(result2?.code).toBe("CODE2");
    });

    it("handles missing invites file gracefully", () => {
      // Empty storage - no invites.json
      store = createInviteStore(storage);

      const invite = store.getInvite("any-code");

      expect(invite).toBeUndefined();
    });

    it("handles invalid JSON in invites file gracefully", () => {
      storage.seed({ "invites.json": "invalid json" });
      store = createInviteStore(storage);

      const invite = store.getInvite("any-code");

      expect(invite).toBeUndefined();
    });
  });

  describe("linkSessionToInvite", () => {
    it("links sessionId to existing invite", () => {
      const mockInvite = inviteFactory.withCode("TEST123");
      storage.seed({
        "invites.json": JSON.stringify({ TEST123: mockInvite }),
      });
      store = createInviteStore(storage);

      store.linkSessionToInvite("TEST123", "session-456");

      const data = storage.read("invites.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData.TEST123.sessionId).toBe("session-456");
    });

    it("does nothing when invite does not exist", () => {
      storage.seed({ "invites.json": JSON.stringify({}) });
      store = createInviteStore(storage);
      const originalData = storage.read("invites.json");

      store.linkSessionToInvite("NONEXIST", "session-456");

      // Data should be unchanged
      expect(storage.read("invites.json")).toBe(originalData);
    });

    it("performs case-insensitive lookup", () => {
      const mockInvite = inviteFactory.withCode("TEST123");
      storage.seed({
        "invites.json": JSON.stringify({ TEST123: mockInvite }),
      });
      store = createInviteStore(storage);

      store.linkSessionToInvite("test123", "session-456");

      const data = storage.read("invites.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData.TEST123.sessionId).toBe("session-456");
    });

    it("preserves existing invite properties when linking", () => {
      const mockInvite = inviteFactory.linked("old-session", { code: "TEST123" });
      storage.seed({
        "invites.json": JSON.stringify({ TEST123: mockInvite }),
      });
      store = createInviteStore(storage);

      store.linkSessionToInvite("TEST123", "new-session");

      const data = storage.read("invites.json");
      expect(data).not.toBeNull();
      const savedData = JSON.parse(data ?? "{}");
      expect(savedData.TEST123.code).toBe("TEST123");
      expect(savedData.TEST123.createdAt).toBe(mockInvite.createdAt);
      expect(savedData.TEST123.sessionId).toBe("new-session");
    });
  });

  describe("listInvites", () => {
    it("returns all invites", () => {
      const invite1 = inviteFactory.withCode("CODE1");
      const invite2 = inviteFactory.linked("session-123", { code: "CODE2" });
      storage.seed({
        "invites.json": JSON.stringify({ CODE1: invite1, CODE2: invite2 }),
      });
      store = createInviteStore(storage);

      const invites = store.listInvites();

      expect(invites).toHaveLength(2);
      expect(invites.map((i) => i.code)).toContain("CODE1");
      expect(invites.map((i) => i.code)).toContain("CODE2");
    });

    it("returns empty array when no invites file exists", () => {
      // Empty storage
      store = createInviteStore(storage);

      const invites = store.listInvites();

      expect(invites).toEqual([]);
    });

    it("includes sessionId when present", () => {
      const mockInvite = inviteFactory.linked("session-123", { code: "CODE1" });
      storage.seed({
        "invites.json": JSON.stringify({ CODE1: mockInvite }),
      });
      store = createInviteStore(storage);

      const invites = store.listInvites();

      expect(invites[0].sessionId).toBe("session-123");
    });
  });
});
