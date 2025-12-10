import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressState } from "../types";
import { createDefaultProgress, useChatStream } from "./use-chat-stream";

describe("createDefaultProgress", () => {
	it("creates progress with all questions incomplete", () => {
		const progress = createDefaultProgress();
		expect(progress.completedCount).toBe(0);
		expect(progress.totalQuestions).toBe(9);
		expect(progress.isComplete).toBe(false);
		expect(progress.questionsCompleted.ai_background).toBe(false);
		expect(progress.questionsCompleted.overall_impression).toBe(false);
	});
});

describe("useChatStream", () => {
	const mockSessionId = "test-session-123";
	const mockWorkshopSlidesUrl = "https://example.com/slides";
	let mockOnProgressUpdate: (progress: ProgressState) => void;
	let mockOnComplete: () => void;

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnProgressUpdate = vi.fn();
		mockOnComplete = vi.fn();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("initializes with empty chat items and not streaming", () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		expect(result.current.chatItems).toEqual([]);
		expect(result.current.isStreaming).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("does not send message when sessionId is null", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: null,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		await act(async () => {
			await result.current.sendMessage("Hello");
		});
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("does not send message when already streaming", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		// Track when we should end the stream
		let readCount = 0;
		const mockReader = {
			read: vi.fn().mockImplementation(async () => {
				readCount++;
				if (readCount === 1) {
					// First read: return some data to keep stream open
					return {
						done: false,
						value: new TextEncoder().encode(
							'event: token\ndata: {"content":"test"}\n\n',
						),
					};
				}
				// Keep returning data for a few reads, then end
				if (readCount < 5) {
					// Add a small delay to allow the second sendMessage to be attempted
					await new Promise((resolve) => setTimeout(resolve, 10));
					return { done: false, value: new TextEncoder().encode("") };
				}
				return { done: true, value: undefined };
			}),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		// Start first message (don't await - let it run in background)
		act(() => {
			result.current.sendMessage("First");
		});

		// Wait for streaming to start
		await waitFor(() => expect(result.current.isStreaming).toBe(true));

		// Try to send second message while streaming
		await act(async () => {
			await result.current.sendMessage("Second");
		});

		// Should only have called fetch once
		expect(vi.mocked(global.fetch).mock.calls.length).toBe(1);

		// Wait for stream to complete
		await waitFor(() => expect(result.current.isStreaming).toBe(false));
	});

	it("adds user message to chat items", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const mockReader = {
			read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Hello");
		});

		await waitFor(() => {
			expect(result.current.chatItems.length).toBeGreaterThan(0);
			const userMessage = result.current.chatItems.find(
				(item) => item.type === "message" && item.data.role === "user",
			);
			expect(userMessage).toBeDefined();
			if (userMessage?.type === "message") {
				expect(userMessage.data.content).toBe("Hello");
			}
		});
	});

	it("handles message_start event and creates assistant message", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const messageId = "msg-123";
		// Include a token so the message has content and won't be filtered out
		const sseData = `event: message_start\ndata: {"messageId":"${messageId}"}\n\nevent: token\ndata: {"content":"Hi"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Hello");
		});

		await waitFor(() => {
			const assistantMessage = result.current.chatItems.find(
				(item) =>
					item.type === "message" &&
					item.data.role === "assistant" &&
					item.data.id === messageId,
			);
			expect(assistantMessage).toBeDefined();
			if (assistantMessage?.type === "message") {
				expect(assistantMessage.data.content).toBe("Hi");
			}
		});
	});

	it("handles token events and appends to assistant message", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const messageId = "msg-123";
		const sseData = `event: message_start\ndata: {"messageId":"${messageId}"}\n\nevent: token\ndata: {"content":"Hello"}\n\nevent: token\ndata: {"content":" World"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			const assistantMessage = result.current.chatItems.find(
				(item) => item.type === "message" && item.data.role === "assistant",
			);
			if (assistantMessage?.type === "message") {
				expect(assistantMessage.data.content).toBe("Hello World");
			}
		});
	});

	it("handles message_end event and finalizes message", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const messageId = "msg-123";
		const sseData = `event: message_start\ndata: {"messageId":"${messageId}"}\n\nevent: token\ndata: {"content":"Hello"}\n\nevent: message_end\ndata: {"messageId":"${messageId}"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			const assistantMessage = result.current.chatItems.find(
				(item) => item.type === "message" && item.data.role === "assistant",
			);
			if (assistantMessage?.type === "message") {
				expect(assistantMessage.data.isStreaming).toBe(false);
			}
		});
	});

	it("handles tool_start event and adds tool card", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const sseData = `event: tool_start\ndata: {"name":"record_ai_background"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			const toolCard = result.current.chatItems.find(
				(item) => item.type === "tool_card",
			);
			expect(toolCard).toBeDefined();
			expect(toolCard?.data.questionId).toBe("ai_background");
			expect(toolCard?.data.state).toBe("active");
		});
	});

	it("handles tool_end event and updates tool card state", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const sseData = `event: tool_start\ndata: {"name":"record_ai_background"}\n\nevent: tool_end\ndata: {"name":"record_ai_background"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			const toolCard = result.current.chatItems.find(
				(item) => item.type === "tool_card",
			);
			expect(toolCard?.data.state).toBe("completed");
		});
	});

	it("handles progress event and calls onProgressUpdate", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const progressData = {
			questionsCompleted: {
				ai_background: true,
				overall_impression: false,
				perceived_content: false,
				difficulty: false,
				content_quality: false,
				presentation: false,
				clarity: false,
				suggestions: false,
				course_parts: false,
			},
			completedCount: 1,
			totalQuestions: 9,
			isComplete: false,
		};

		const sseData = `event: progress\ndata: ${JSON.stringify(progressData)}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(mockOnProgressUpdate).toHaveBeenCalledWith(progressData);
		});
	});

	it("calls onComplete when progress indicates completion", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const progressData = {
			questionsCompleted: {
				ai_background: true,
				overall_impression: true,
				perceived_content: true,
				difficulty: true,
				content_quality: true,
				presentation: true,
				clarity: true,
				suggestions: true,
				course_parts: true,
			},
			completedCount: 9,
			totalQuestions: 9,
			isComplete: true,
		};

		const sseData = `event: progress\ndata: ${JSON.stringify(progressData)}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(mockOnComplete).toHaveBeenCalled();
		});
	});

	it("handles done event with progress", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const progressData = {
			questionsCompleted: {
				ai_background: true,
				overall_impression: false,
				perceived_content: false,
				difficulty: false,
				content_quality: false,
				presentation: false,
				clarity: false,
				suggestions: false,
				course_parts: false,
			},
			completedCount: 1,
			totalQuestions: 9,
			isComplete: false,
		};

		const sseData = `event: done\ndata: ${JSON.stringify({ progress: progressData })}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(mockOnProgressUpdate).toHaveBeenCalledWith(progressData);
		});
	});

	it("handles error event and sets error state", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const errorMessage = "Something went wrong";
		const sseData = `event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(result.current.error).toBe(errorMessage);
		});
	});

	it("handles network errors", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(result.current.error).toBe("Network error");
			expect(result.current.isStreaming).toBe(false);
		});
	});

	it("handles HTTP errors", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const mockResponse = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(result.current.error).toContain("HTTP 500");
			expect(result.current.isStreaming).toBe(false);
		});
	});

	it("handles abort errors gracefully", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const abortError = new Error("Aborted");
		abortError.name = "AbortError";
		vi.mocked(global.fetch).mockRejectedValue(abortError);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(result.current.error).toBeNull();
		});
	});

	it("filters out empty assistant messages on completion", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const messageId = "msg-123";
		// Create message_start but no tokens, so message stays empty
		const sseData = `event: message_start\ndata: {"messageId":"${messageId}"}\n\n`;
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			expect(result.current.isStreaming).toBe(false);
			const emptyMessage = result.current.chatItems.find(
				(item) =>
					item.type === "message" &&
					item.data.role === "assistant" &&
					item.data.content.trim() === "",
			);
			expect(emptyMessage).toBeUndefined();
		});
	});

	it("handles malformed JSON gracefully", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const sseData = "event: token\ndata: {invalid json}\n\n";
		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(sseData),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		// Should not throw and should complete
		await waitFor(() => {
			expect(result.current.isStreaming).toBe(false);
		});
	});

	it("handles split SSE data across multiple reads", async () => {
		const { result } = renderHook(() =>
			useChatStream({
				sessionId: mockSessionId,
				workshopSlidesUrl: mockWorkshopSlidesUrl,
				onProgressUpdate: mockOnProgressUpdate,
				onComplete: mockOnComplete,
			}),
		);

		const messageId = "msg-123";
		// Split the SSE data at event boundaries (after \n\n) which is the supported case
		const part1 = `event: message_start\ndata: {"messageId":"${messageId}"}\n\n`;
		const part2 = `event: token\ndata: {"content":"Hello"}\n\n`;

		const mockReader = {
			read: vi
				.fn()
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(part1),
				})
				.mockResolvedValueOnce({
					done: false,
					value: new TextEncoder().encode(part2),
				})
				.mockResolvedValue({ done: true, value: undefined }),
		};
		const mockResponse = {
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		};
		vi.mocked(global.fetch).mockResolvedValue(
			mockResponse as unknown as Response,
		);

		await act(async () => {
			await result.current.sendMessage("Test");
		});

		await waitFor(() => {
			const assistantMessage = result.current.chatItems.find(
				(item) => item.type === "message" && item.data.role === "assistant",
			);
			if (assistantMessage?.type === "message") {
				expect(assistantMessage.data.content).toBe("Hello");
			}
		});
	});
});
