import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressState, SessionState } from "../types";
import { useInterviewSession } from "./use-interview-session";

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("useInterviewSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    Object.defineProperty(window, "sessionStorage", {
      value: mockSessionStorage,
      writable: true,
    });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with null session and default progress", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    expect(result.current.session).toBeNull();
    expect(result.current.progress.completedCount).toBe(0);
    expect(result.current.progress.totalQuestions).toBe(9);
    expect(result.current.progress.isComplete).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.existingMessages).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("checks for existing session on mount and restores it", async () => {
    const storedSession: SessionState = {
      code: "TEST123",
      sessionId: "session-123",
    };
    mockSessionStorage.setItem("interview_session", JSON.stringify(storedSession));

    const mockProgress: ProgressState = {
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

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "session-123",
        createdAt: "2024-01-15T10:00:00.000Z",
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" },
        ],
        progress: mockProgress,
      }),
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(storedSession);
    expect(result.current.progress).toEqual(mockProgress);
    expect(result.current.existingMessages).toHaveLength(2);
    expect(result.current.existingMessages[0].content).toBe("Hello");
    expect(result.current.existingMessages[1].content).toBe("Hi there");
  });

  it("clears stored session if backend session no longer exists", async () => {
    const storedSession: SessionState = {
      code: "TEST123",
      sessionId: "session-123",
    };
    mockSessionStorage.setItem("interview_session", JSON.stringify(storedSession));

    const mockResponse = {
      ok: false,
      status: 404,
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(mockSessionStorage.getItem("interview_session")).toBeNull();
  });

  it("keeps stored session on network error during check", async () => {
    const storedSession: SessionState = {
      code: "TEST123",
      sessionId: "session-123",
    };
    mockSessionStorage.setItem("interview_session", JSON.stringify(storedSession));

    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should keep the stored session for retry
    expect(result.current.session).toEqual(storedSession);
  });

  it("creates new session with valid invite code", async () => {
    const mockCreateResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "new-session-456",
        createdAt: "2024-01-15T10:00:00.000Z",
      }),
    };
    vi.mocked(global.fetch).mockResolvedValue(mockCreateResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startSession("VALID123");
    });

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.code).toBe("VALID123");
      expect(result.current.session?.sessionId).toBe("new-session-456");
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSessionStorage.getItem("interview_session")).toBeTruthy();
    const stored = JSON.parse(mockSessionStorage.getItem("interview_session") || "{}");
    expect(stored.code).toBe("VALID123");
    expect(stored.sessionId).toBe("new-session-456");
  });

  it("handles invalid invite code (403)", async () => {
    const mockResponse = {
      ok: false,
      status: 403,
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startSession("INVALID");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Ongeldige toegangscode.");
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles generic errors during session creation", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startSession("TEST123");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Kon geen sessie starten. Probeer het opnieuw.");
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles network errors during session creation", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startSession("TEST123");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("resumes existing session when isResumed flag is true", async () => {
    const mockCreateResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "existing-session-789",
        createdAt: "2024-01-15T10:00:00.000Z",
        isResumed: true,
      }),
    };

    const mockGetResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "existing-session-789",
        createdAt: "2024-01-15T10:00:00.000Z",
        messages: [{ role: "user", content: "Previous message" }],
        progress: {
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
        },
      }),
    };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockCreateResponse as unknown as Response)
      .mockResolvedValueOnce(mockGetResponse as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startSession("RESUME123");
    });

    await waitFor(() => {
      expect(result.current.session?.sessionId).toBe("existing-session-789");
      expect(result.current.existingMessages).toHaveLength(1);
      expect(result.current.progress.completedCount).toBe(1);
    });
  });

  it("updates progress when updateProgress is called", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newProgress: ProgressState = {
      questionsCompleted: {
        ai_background: true,
        overall_impression: true,
        perceived_content: false,
        difficulty: false,
        content_quality: false,
        presentation: false,
        clarity: false,
        suggestions: false,
        course_parts: false,
      },
      completedCount: 2,
      totalQuestions: 9,
      isComplete: false,
    };

    act(() => {
      result.current.updateProgress(newProgress);
    });

    expect(result.current.progress).toEqual(newProgress);
    expect(result.current.progress.completedCount).toBe(2);
  });

  it("clears session and resets state", async () => {
    const storedSession: SessionState = {
      code: "TEST123",
      sessionId: "session-123",
    };
    mockSessionStorage.setItem("interview_session", JSON.stringify(storedSession));

    // Mock the initial fetch check
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { result } = renderHook(() => useInterviewSession());

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Set some state first
    act(() => {
      result.current.updateProgress({
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
      });
    });

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.progress.completedCount).toBe(0);
    expect(result.current.existingMessages).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockSessionStorage.getItem("interview_session")).toBeNull();
  });

  it("handles debug mode by reloading page with debug param", async () => {
    const mockCreateResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "debug-session",
        createdAt: "2024-01-15T10:00:00.000Z",
      }),
    };

    // Mock initial fetch (for useEffect check)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);
    // Mock create session fetch
    vi.mocked(global.fetch).mockResolvedValueOnce(mockCreateResponse as unknown as Response);

    // Mock window.location to prevent actual navigation
    const originalLocation = window.location;
    let hrefValue = "http://localhost:5173/";
    const mockLocation = {
      get href() {
        return hrefValue;
      },
      set href(val: string) {
        hrefValue = val;
        // Don't actually navigate in test
      },
      search: "",
      searchParams: {
        has: () => false,
        set: () => {
          // No-op for test mock
        },
      },
    };

    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start session - this should trigger the debug mode logic
    // Note: The actual implementation sets window.location.href which would reload,
    // but in the test we just verify it doesn't throw
    await act(async () => {
      await expect(result.current.startSession("DEBUG_MODE")).resolves.not.toThrow();
    });

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("handles malformed sessionStorage data gracefully", async () => {
    mockSessionStorage.setItem("interview_session", "invalid json");

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
  });

  it("handles sessionStorage errors gracefully", async () => {
    // Mock sessionStorage to throw errors
    const throwingStorage = {
      getItem: () => {
        throw new Error("Storage error");
      },
      setItem: () => {
        throw new Error("Storage error");
      },
      removeItem: () => {
        throw new Error("Storage error");
      },
      clear: () => {
        // No-op for test mock
      },
    };

    Object.defineProperty(window, "sessionStorage", {
      value: throwingStorage,
      writable: true,
    });

    const { result } = renderHook(() => useInterviewSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not crash, just proceed without storage
    expect(result.current.session).toBeNull();
  });
});
