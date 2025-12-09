import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Mock the persistence module
vi.mock("../persistence", () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
  listSessions: vi.fn(),
  updateSession: vi.fn(),
  getCheckpointer: vi.fn(),
}));

// Mock the agent module
vi.mock("@/agents/interviewer", () => ({
  createInterviewAgent: vi.fn(),
  createInterviewInput: vi.fn(),
}));

import { getSession, getCheckpointer } from "../persistence";
import { createInterviewAgent } from "@/agents/interviewer";

// ═══════════════════════════════════════════════════════════════
// RESPONSE ENDPOINT TESTS
// ═══════════════════════════════════════════════════════════════

describe("Response API Endpoints", () => {
  const mockSession = {
    id: "test-session-123",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    isComplete: false,
  };

  const mockState = {
    values: {
      sessionId: "test-session-123",
      startedAt: "2024-01-15T10:00:00.000Z",
      questionsCompleted: {
        ai_background: true,
        overall_impression: false,
        perceived_content: false,
        difficulty: true,
        content_quality: false,
        presentation: false,
        clarity: false,
        suggestions: false,
        course_parts: false,
      },
      responses: {
        ai_background: {
          experienceLevel: 3,
          summary: "Test summary",
          userType: "regular",
        },
        difficulty: {
          difficultyRating: 3,
          paceRating: 3,
          summary: "Difficulty feedback",
        },
      },
      messages: [],
      isComplete: false,
    },
  };

  const mockAgent = {
    getState: vi.fn().mockResolvedValue(mockState),
    updateState: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockReturnValue(mockSession);
    vi.mocked(getCheckpointer).mockResolvedValue({} as never);
    vi.mocked(createInterviewAgent).mockReturnValue(mockAgent as never);
  });

  describe("GET /api/interviews/:id/responses", () => {
    it("returns 404 when session not found", async () => {
      vi.mocked(getSession).mockReturnValue(undefined);

      // Import fresh to get mocked dependencies
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/unknown-id/responses");
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Interview not found");
    });

    it("returns all responses with metadata", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses");
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.sessionId).toBe("test-session-123");
      expect(json.totalTopics).toBe(9);
      expect(json.completedTopics).toContain("ai_background");
      expect(json.completedTopics).toContain("difficulty");
      expect(json.completedTopics).toHaveLength(2);
      expect(json.responses.ai_background).toBeDefined();
      expect(json.responses.ai_background.topic).toBe("ai_background");
      expect(json.responses.ai_background.source).toBe("agent");
    });

    it("returns empty responses for new session", async () => {
      mockAgent.getState.mockRejectedValueOnce(new Error("No state"));

      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses");
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.sessionId).toBe("test-session-123");
      expect(json.responses).toEqual({});
      expect(json.completedTopics).toEqual([]);
    });
  });

  describe("GET /api/interviews/:id/responses/:topic", () => {
    it("returns 400 for invalid topic", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/invalid_topic");
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Invalid topic");
    });

    it("returns 404 when session not found", async () => {
      vi.mocked(getSession).mockReturnValue(undefined);

      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/unknown-id/responses/ai_background");
      expect(res.status).toBe(404);
    });

    it("returns 404 when topic has no response", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/clarity");
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("No response recorded");
    });

    it("returns single topic response", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/ai_background");
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.topic).toBe("ai_background");
      expect(json.data.experienceLevel).toBe(3);
      expect(json.source).toBe("agent");
    });

    it("accepts all valid topic IDs", async () => {
      const validTopics = [
        "ai_background",
        "overall_impression",
        "perceived_content",
        "difficulty",
        "content_quality",
        "presentation",
        "clarity",
        "suggestions",
        "course_parts",
      ];

      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      for (const topic of validTopics) {
        const res = await app.request(`/api/interviews/test-session-123/responses/${topic}`);
        // Should not return 400 (invalid topic)
        expect(res.status).not.toBe(400);
      }
    });
  });

  describe("PUT /api/interviews/:id/responses/:topic", () => {
    it("returns 400 for invalid topic", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/invalid_topic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceLevel: 4 }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when session not found", async () => {
      vi.mocked(getSession).mockReturnValue(undefined);

      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/unknown-id/responses/ai_background", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceLevel: 4 }),
      });
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid request body", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/ai_background", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });
      expect(res.status).toBe(400);
    });

    it("updates response and marks as user_edit", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      const res = await app.request("/api/interviews/test-session-123/responses/ai_background", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceLevel: 5,
          summary: "Updated summary",
          userType: "power_user",
        }),
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.topic).toBe("ai_background");
      expect(json.source).toBe("user_edit");
      expect(json.data.experienceLevel).toBe(5);
      expect(json.data.source).toBe("user_edit");
    });

    it("calls updateState with correct parameters", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      await app.request("/api/interviews/test-session-123/responses/clarity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clarityRating: 4,
          summary: "Clear explanation",
        }),
      });

      expect(mockAgent.updateState).toHaveBeenCalled();
      const updateCall = mockAgent.updateState.mock.calls[0];
      expect(updateCall[1].questionsCompleted.clarity).toBe(true);
      expect(updateCall[1].responses.clarity.source).toBe("user_edit");
    });

    it("marks question as completed after update", async () => {
      const { interviewRoutes } = await import("./interview");
      const app = new Hono().route("/api/interviews", interviewRoutes);

      // Update a topic that wasn't completed before
      await app.request("/api/interviews/test-session-123/responses/presentation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationRating: 5,
          summary: "Great presentation",
        }),
      });

      expect(mockAgent.updateState).toHaveBeenCalled();
      const updateCall = mockAgent.updateState.mock.calls[0];
      expect(updateCall[1].questionsCompleted.presentation).toBe(true);
    });
  });
});

