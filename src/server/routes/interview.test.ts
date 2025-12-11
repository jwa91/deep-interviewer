import {
	agentStateFactory,
	inviteFactory,
	progressFactory,
	questionsCompletedFactory,
	sessionFactory,
} from "@/test/factories";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the persistence module
vi.mock("../persistence", () => ({
	getSession: vi.fn(),
	createSession: vi.fn(),
	listSessions: vi.fn(),
	updateSession: vi.fn(),
	getCheckpointer: vi.fn(),
}));

// Mock the invites module
vi.mock("../invites", () => ({
	getInvite: vi.fn(),
	linkSessionToInvite: vi.fn(),
}));

// Mock the agent module
vi.mock("@/agents/interviewer", () => ({
	createInterviewAgent: vi.fn(),
	createInterviewInput: vi.fn(),
}));

// Mock the mock-interview service
vi.mock("../services/mock-interview", () => ({
	mockInterviewService: {
		reset: vi.fn(),
		getState: vi.fn(),
		processMessage: vi.fn(),
	},
}));

import {
	createInterviewAgent,
	createInterviewInput,
} from "@/agents/interviewer";
import { getInvite, linkSessionToInvite } from "../invites";
import { createSession, getCheckpointer, getSession } from "../persistence";
import { mockInterviewService } from "../services/mock-interview";

// ═══════════════════════════════════════════════════════════════
// RESPONSE ENDPOINT TESTS
// ═══════════════════════════════════════════════════════════════

describe("Response API Endpoints", () => {
	const mockSession = sessionFactory.withId("test-session-123");

	const mockState = agentStateFactory.withResponses(
		{
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
		{ sessionId: "test-session-123" },
	);

	const mockAgent = {
		getState: vi.fn().mockResolvedValue(mockState),
		updateState: vi.fn().mockResolvedValue(undefined),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		vi.mocked(getSession).mockReturnValue(mockSession);
		vi.mocked(getCheckpointer).mockResolvedValue({} as never);
		vi.mocked(createInterviewAgent).mockReturnValue(mockAgent as never);
	});

	describe("GET /api/interviews/:id/responses", () => {
		it("returns 404 when session not found", async () => {
			vi.mocked(getSession).mockReturnValue(undefined);

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

			const res = await app.request(
				"/api/interviews/test-session-123/responses",
			);
			expect(res.status).toBe(200);

			const json = await res.json();
			expect(json.sessionId).toBe("test-session-123");
			expect(json.totalTopics).toBe(6);
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

			const res = await app.request(
				"/api/interviews/test-session-123/responses",
			);
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

			const res = await app.request(
				"/api/interviews/test-session-123/responses/invalid_topic",
			);
			expect(res.status).toBe(400);
			const json = await res.json();
			expect(json.error).toContain("Invalid topic");
		});

		it("returns 404 when session not found", async () => {
			vi.mocked(getSession).mockReturnValue(undefined);

			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/unknown-id/responses/ai_background",
			);
			expect(res.status).toBe(404);
		});

		it("returns 404 when topic has no response", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/test-session-123/responses/presentation",
			);
			expect(res.status).toBe(404);
			const json = await res.json();
			expect(json.error).toContain("No response recorded");
		});

		it("returns single topic response", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/test-session-123/responses/ai_background",
			);
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
				"difficulty",
				"content_quality",
				"presentation",
				"suggestions",
			];

			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			for (const topic of validTopics) {
				const res = await app.request(
					`/api/interviews/test-session-123/responses/${topic}`,
				);
				// Should not return 400 (invalid topic)
				expect(res.status).not.toBe(400);
			}
		});
	});

	describe("PUT /api/interviews/:id/responses/:topic", () => {
		it("returns 400 for invalid topic", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/test-session-123/responses/invalid_topic",
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ experienceLevel: 4 }),
				},
			);
			expect(res.status).toBe(400);
		});

		it("returns 404 when session not found", async () => {
			vi.mocked(getSession).mockReturnValue(undefined);

			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/unknown-id/responses/ai_background",
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ experienceLevel: 4 }),
				},
			);
			expect(res.status).toBe(404);
		});

		it("returns 400 for invalid request body", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/test-session-123/responses/ai_background",
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: "invalid json",
				},
			);
			expect(res.status).toBe(400);
		});

		it("updates response and marks as user_edit", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			const res = await app.request(
				"/api/interviews/test-session-123/responses/ai_background",
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						experienceLevel: 5,
						summary: "Updated summary",
						userType: "power_user",
					}),
				},
			);
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

			await app.request("/api/interviews/test-session-123/responses/suggestions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					topSuggestion: "Meer oefentijd",
					suggestions: ["Meer oefentijd", "Meer voorbeelden"],
					improvementPriority: 5,
					formatPreference: "more_practice",
					summary: "Meer hands-on oefeningen zou de grootste winst zijn.",
				}),
			});

			expect(mockAgent.updateState).toHaveBeenCalled();
			const updateCall = mockAgent.updateState.mock.calls[0];
			expect(updateCall[1].questionsCompleted.suggestions).toBe(true);
			expect(updateCall[1].responses.suggestions.source).toBe("user_edit");
		});

		it("marks question as completed after update", async () => {
			const { interviewRoutes } = await import("./interview");
			const app = new Hono().route("/api/interviews", interviewRoutes);

			await app.request(
				"/api/interviews/test-session-123/responses/presentation",
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						presentationRating: 5,
						summary: "Great presentation",
					}),
				},
			);

			expect(mockAgent.updateState).toHaveBeenCalled();
			const updateCall = mockAgent.updateState.mock.calls[0];
			expect(updateCall[1].questionsCompleted.presentation).toBe(true);
		});
	});
});

// ═══════════════════════════════════════════════════════════════
// SESSION CREATION TESTS
// ═══════════════════════════════════════════════════════════════

describe("POST /api/interviews - Session Creation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it("creates new session with valid invite code", async () => {
		const mockInvite = inviteFactory.withCode("VALID123");
		const mockNewSession = sessionFactory.withId("new-session-456");

		vi.mocked(getInvite).mockReturnValue(mockInvite);
		vi.mocked(createSession).mockReturnValue(mockNewSession);
		vi.mocked(linkSessionToInvite).mockImplementation(() => {
			// No-op mock
		});

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "VALID123" }),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.id).toBe("new-session-456");
		expect(json.createdAt).toBe(mockNewSession.createdAt);
		expect(json.isResumed).toBe(false);
		expect(createSession).toHaveBeenCalled();
		expect(linkSessionToInvite).toHaveBeenCalledWith(
			"VALID123",
			"new-session-456",
		);
	});

	it("returns 400 when invite code is missing", async () => {
		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Invite code is required");
	});

	it("returns 403 when invite code is invalid", async () => {
		vi.mocked(getInvite).mockReturnValue(undefined);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "INVALID" }),
		});

		expect(res.status).toBe(403);
		const json = await res.json();
		expect(json.error).toBe("Invalid invite code");
	});

	it("resumes existing session when invite has linked sessionId", async () => {
		const mockInvite = inviteFactory.linked("existing-session-789", {
			code: "EXISTING123",
		});
		const mockExistingSession = sessionFactory.withId("existing-session-789");

		vi.mocked(getInvite).mockReturnValue(mockInvite);
		vi.mocked(getSession).mockReturnValue(mockExistingSession);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "EXISTING123" }),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.id).toBe("existing-session-789");
		expect(json.isResumed).toBe(true);
		expect(json.message).toContain("Resuming");
		expect(createSession).not.toHaveBeenCalled();
	});

	it("creates new session when linked sessionId no longer exists", async () => {
		const mockInvite = inviteFactory.linked("deleted-session", {
			code: "ORPHANED123",
		});
		const mockNewSession = sessionFactory.withId("new-session-999");

		vi.mocked(getInvite).mockReturnValue(mockInvite);
		vi.mocked(getSession).mockReturnValue(undefined); // Session was deleted
		vi.mocked(createSession).mockReturnValue(mockNewSession);
		vi.mocked(linkSessionToInvite).mockImplementation(() => {
			// No-op mock
		});

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "ORPHANED123" }),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.id).toBe("new-session-999");
		expect(json.isResumed).toBe(false);
		expect(createSession).toHaveBeenCalled();
	});

	it("handles DEBUG_MODE code", async () => {
		vi.mocked(mockInterviewService.reset).mockImplementation(() => {
			// No-op mock
		});

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: "DEBUG_MODE" }),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.id).toBe("debug-session");
		expect(json.isResumed).toBe(false);
		expect(mockInterviewService.reset).toHaveBeenCalled();
	});

	it("creates session with participantId when provided", async () => {
		const mockInvite = inviteFactory.withCode("VALID123");
		const mockNewSession = sessionFactory.withId("new-session-456");

		vi.mocked(getInvite).mockReturnValue(mockInvite);
		vi.mocked(createSession).mockReturnValue(mockNewSession);
		vi.mocked(linkSessionToInvite).mockImplementation(() => {
			// No-op mock
		});

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: "VALID123",
				participantId: "participant-789",
			}),
		});

		expect(res.status).toBe(200);
		expect(createSession).toHaveBeenCalledWith("participant-789");
	});
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews/:id TESTS
// ═══════════════════════════════════════════════════════════════

describe("GET /api/interviews/:id - Get Session State", () => {
	const mockSession = sessionFactory.withId("test-session-123");

	const mockStateWithMessages = agentStateFactory.withMessages(
		[
			{
				_getType: () => "human",
				content: "Hello",
				tool_calls: undefined,
			},
			{
				_getType: () => "ai",
				content: "Hi there!",
				tool_calls: undefined,
			},
		],
		{
			sessionId: "test-session-123",
			questionsCompleted:
				questionsCompletedFactory.withCompleted("ai_background"),
		},
	);

	let mockAgent: {
		getState: ReturnType<typeof vi.fn>;
		streamEvents?: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		mockAgent = {
			getState: vi.fn().mockResolvedValue(mockStateWithMessages),
		};
		vi.mocked(getSession).mockReturnValue(mockSession);
		vi.mocked(getCheckpointer).mockResolvedValue({} as never);
		vi.mocked(createInterviewAgent).mockReturnValue(mockAgent as never);
	});

	it("returns session state with messages and progress", async () => {
		mockAgent.getState.mockResolvedValue(mockStateWithMessages);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/test-session-123");
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.id).toBe("test-session-123");
		expect(json.messages).toHaveLength(2);
		expect(json.messages[0].role).toBe("user");
		expect(json.messages[0].content).toBe("Hello");
		expect(json.messages[1].role).toBe("assistant");
		expect(json.messages[1].content).toBe("Hi there!");
		expect(json.progress.completedCount).toBe(1);
		expect(json.progress.totalQuestions).toBe(6);
	});

	it("returns 404 when session not found", async () => {
		vi.mocked(getSession).mockReturnValue(undefined);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/unknown-id");
		expect(res.status).toBe(404);
		const json = await res.json();
		expect(json.error).toBe("Interview not found");
	});

	it("returns empty messages and default progress when no state exists", async () => {
		const mockAgentEmpty = {
			getState: vi.fn().mockRejectedValue(new Error("No state")),
		};

		vi.mocked(createInterviewAgent).mockReturnValueOnce(
			mockAgentEmpty as never,
		);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/test-session-123");
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.messages).toEqual([]);
		expect(json.progress.completedCount).toBe(0);
		expect(json.progress.isComplete).toBe(false);

		vi.mocked(createInterviewAgent).mockReturnValue(mockAgent as never);
	});

	it("handles debug-session ID", async () => {
		const mockDebugState = {
			createdAt: "2024-01-15T10:00:00.000Z",
			messages: [{ role: "user", content: "Test" }],
			progress: progressFactory.empty(),
		};

		vi.mocked(mockInterviewService.getState).mockReturnValue(
			mockDebugState as never,
		);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/debug-session");
		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json.id).toBe("debug-session");
		expect(json.messages).toEqual(mockDebugState.messages);
	});
});

// ═══════════════════════════════════════════════════════════════
// POST /api/interviews/:id/chat TESTS (SSE Streaming)
// ═══════════════════════════════════════════════════════════════

describe("POST /api/interviews/:id/chat - Chat Streaming", () => {
	const mockSession = sessionFactory.withId("test-session-123");

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		vi.mocked(getSession).mockReturnValue(mockSession);
	});

	it("returns 404 when session not found", async () => {
		vi.mocked(getSession).mockReturnValue(undefined);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/unknown-id/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: "Hello" }),
		});

		expect(res.status).toBe(404);
		const json = await res.json();
		expect(json.error).toBe("Interview not found");
	});

	it("returns 400 when message is missing", async () => {
		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/test-session-123/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Message is required");
	});

	it("returns 400 when message is not a string", async () => {
		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/test-session-123/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: 123 }),
		});

		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBe("Message is required");
	});

	it("handles debug-session with SSE streaming", async () => {
		const mockProcessResult = {
			fullResponse: "Hello! How can I help?",
			toolCalls: [
				{
					name: "record_ai_background",
					args: { experienceLevel: 3 },
				},
			],
			progress: progressFactory.withCompleted("ai_background"),
		};

		vi.mocked(mockInterviewService.processMessage).mockResolvedValue(
			mockProcessResult as never,
		);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/debug-session/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: "Hello" }),
		});

		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/event-stream");
		expect(mockInterviewService.processMessage).toHaveBeenCalledWith("Hello");

		// Read SSE stream
		const reader = res.body?.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		const events: string[] = [];

		if (reader) {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";
				events.push(...lines.filter((line) => line.trim()));
			}
		}

		// Verify SSE events were sent
		expect(events.length).toBeGreaterThan(0);
		expect(events.some((e) => e.includes("message_start"))).toBe(true);
		expect(events.some((e) => e.includes("token"))).toBe(true);
		expect(events.some((e) => e.includes("tool_start"))).toBe(true);
		expect(events.some((e) => e.includes("progress"))).toBe(true);
		expect(events.some((e) => e.includes("done"))).toBe(true);
	});

	it("streams real agent response with proper SSE format", async () => {
		function* mockStream() {
			yield {
				event: "on_chat_model_stream",
				data: { chunk: { content: "Hello" } },
			};
			yield {
				event: "on_chat_model_stream",
				data: { chunk: { content: " there" } },
			};
		}

		const mockStreamAgent = {
			getState: vi.fn().mockResolvedValue(
				agentStateFactory.build({
					messages: [],
					questionsCompleted: questionsCompletedFactory.build(),
				}),
			),
			streamEvents: vi.fn().mockReturnValue(mockStream()),
		};

		vi.mocked(getCheckpointer).mockResolvedValue({} as never);
		vi.mocked(createInterviewAgent).mockReturnValueOnce(
			mockStreamAgent as never,
		);
		vi.mocked(createInterviewInput).mockReturnValue({
			messages: [],
		} as never);

		const { interviewRoutes } = await import("./interview");
		const app = new Hono().route("/api/interviews", interviewRoutes);

		const res = await app.request("/api/interviews/test-session-123/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: "Hello" }),
		});

		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/event-stream");
	});
});
