import { useCallback, useEffect, useState } from "react";
import type {
  CreateSessionResponse,
  GetSessionResponse,
  Message,
  ProgressState,
  SessionState,
} from "../types";
import { createDefaultProgress } from "./use-chat-stream";

const API_BASE = "http://localhost:3001";
const SESSION_STORAGE_KEY = "interview_session";

interface UseInterviewSessionReturn {
  session: SessionState | null;
  progress: ProgressState;
  isLoading: boolean;
  error: string | null;
  existingMessages: Message[];
  startSession: (code: string) => Promise<void>;
  updateProgress: (progress: ProgressState) => void;
  clearSession: () => void;
}

function getStoredSession(): SessionState | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SessionState;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function storeSession(session: SessionState): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

function clearStoredSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const [session, setSession] = useState<SessionState | null>(null);
  const [progress, setProgress] = useState<ProgressState>(createDefaultProgress());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingMessages, setExistingMessages] = useState<Message[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const stored = getStoredSession();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify session still exists on backend
        const response = await fetch(`${API_BASE}/api/interviews/${stored.sessionId}`);

        if (response.ok) {
          const data = (await response.json()) as GetSessionResponse;
          setSession(stored);
          setProgress(data.progress);

          // Restore existing messages
          if (data.messages && data.messages.length > 0) {
            const restoredMessages: Message[] = data.messages.map((msg, index) => ({
              id: `restored_${index}`,
              role: msg.role,
              content: msg.content,
              toolCalls: msg.toolCalls,
              timestamp: new Date(),
            }));
            setExistingMessages(restoredMessages);
          }
        } else {
          // Session no longer exists, clear storage
          clearStoredSession();
        }
      } catch {
        // Network error, keep stored session for retry
        setSession(stored);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const resumeSession = useCallback(async (sessionId: string) => {
    const sessionResponse = await fetch(`${API_BASE}/api/interviews/${sessionId}`);
    if (sessionResponse.ok) {
      const sessionData = (await sessionResponse.json()) as GetSessionResponse;
      setProgress(sessionData.progress);
      if (sessionData.messages && sessionData.messages.length > 0) {
        const restoredMessages: Message[] = sessionData.messages.map((msg, index) => ({
          id: `restored_${index}`,
          role: msg.role,
          content: msg.content,
          toolCalls: msg.toolCalls,
          timestamp: new Date(),
        }));
        setExistingMessages(restoredMessages);
      }
    }
  }, []);

  const startSession = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create session or resume existing one using the code
        const response = await fetch(`${API_BASE}/api/interviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Ongeldige toegangscode.");
          }
          throw new Error("Kon geen sessie starten. Probeer het opnieuw.");
        }

        const data = (await response.json()) as CreateSessionResponse & { isResumed?: boolean };

        // Debug mode handling: auto-add query param and reload to activate debug view
        if (code === "DEBUG_MODE") {
            const url = new URL(window.location.href);
            if (!url.searchParams.has("debug")) {
                url.searchParams.set("debug", "true");
                window.location.href = url.toString();
                return; // Stop execution to allow reload
            }
        }

        const newSession: SessionState = {
          code,
          sessionId: data.id,
        };

        storeSession(newSession);
        setSession(newSession);

        // If resumed, we need to fetch the existing state to restore progress and messages
        if (data.isResumed) {
          await resumeSession(data.id);
        } else {
          setProgress(createDefaultProgress());
          setExistingMessages([]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Er is een fout opgetreden. Probeer het opnieuw.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [resumeSession]
  );

  const updateProgress = useCallback((newProgress: ProgressState) => {
    setProgress(newProgress);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setProgress(createDefaultProgress());
    setExistingMessages([]);
    setError(null);
  }, []);

  return {
    session,
    progress,
    isLoading,
    error,
    existingMessages,
    startSession,
    updateProgress,
    clearSession,
  };
}
