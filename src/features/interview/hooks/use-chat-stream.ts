import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef, useState } from "react";
import type {
  Message,
  ProgressState,
  SSEDoneEvent,
  SSEErrorEvent,
  SSEProgressEvent,
  SSETokenEvent,
  SSEToolEndEvent,
  SSEToolStartEvent,
  ToolActivity,
} from "../types";

const API_BASE = "http://localhost:3001";

interface UseChatStreamOptions {
  sessionId: string | null;
  onProgressUpdate?: (progress: ProgressState) => void;
  onComplete?: () => void;
}

interface UseChatStreamReturn {
  messages: Message[];
  isStreaming: boolean;
  toolActivity: ToolActivity | null;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultProgress(): ProgressState {
  return {
    questionsCompleted: {
      ai_background: false,
      overall_impression: false,
      perceived_content: false,
      difficulty: false,
      content_quality: false,
      presentation: false,
      clarity: false,
      suggestions: false,
      course_parts: false,
    },
    completedCount: 0,
    totalQuestions: 9,
    isComplete: false,
  };
}

export function useChatStream({
  sessionId,
  onProgressUpdate,
  onComplete,
}: UseChatStreamOptions): UseChatStreamReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState<ToolActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isStreaming) {
        return;
      }

      setError(null);

      // Add user message
      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create placeholder for assistant message
      const assistantMessageId = generateMessageId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setIsStreaming(true);

      // Abort any existing request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE}/api/interviews/${sessionId}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: content }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              // Skip event type lines, we parse from data structure
              continue;
            }

            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (!dataStr) {
                continue;
              }

              try {
                const data = JSON.parse(dataStr);
                const eventLine = lines[lines.indexOf(line) - 1];
                const eventType = eventLine?.startsWith("event: ")
                  ? eventLine.slice(7).trim()
                  : null;

                handleSSEEvent(eventType, data, assistantMessageId);
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : "Er is iets misgegaan";
        setError(errorMessage);

        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      } finally {
        setIsStreaming(false);
        setToolActivity(null);
      }
    },
    [sessionId, isStreaming]
  );

  const handleSSEEvent = useCallback(
    (_eventType: string | null, data: unknown, messageId: string) => {
      // Parse based on data structure since event types may not be reliably parsed
      const payload = data as Record<string, unknown>;

      // Token event
      if ("content" in payload && typeof payload.content === "string") {
        const tokenData = payload as SSETokenEvent;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: msg.content + tokenData.content } : msg
          )
        );
        return;
      }

      // Tool start event
      if ("name" in payload && "input" in payload && !("output" in payload)) {
        const toolData = payload as SSEToolStartEvent;
        setToolActivity({ name: toolData.name, isActive: true });
        return;
      }

      // Tool end event
      if ("name" in payload && "output" in payload && !("fullResponse" in payload)) {
        const toolData = payload as SSEToolEndEvent;
        setToolActivity({ name: toolData.name, isActive: false });
        setTimeout(() => setToolActivity(null), 1500);
        return;
      }

      // Progress event (standalone)
      if (
        "completedCount" in payload &&
        "totalQuestions" in payload &&
        !("fullResponse" in payload)
      ) {
        const progressData = payload as SSEProgressEvent;
        onProgressUpdate?.(progressData);

        if (progressData.isComplete) {
          onComplete?.();
        }
        return;
      }

      // Done event
      if ("fullResponse" in payload) {
        const doneData = payload as SSEDoneEvent;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: doneData.fullResponse, isStreaming: false }
              : msg
          )
        );

        if (doneData.progress) {
          onProgressUpdate?.(doneData.progress);
          if (doneData.progress.isComplete) {
            onComplete?.();
          }
        }
        return;
      }

      // Error event
      if ("error" in payload) {
        const errorData = payload as SSEErrorEvent;
        setError(errorData.error);
        return;
      }
    },
    [onProgressUpdate, onComplete]
  );

  return {
    messages,
    isStreaming,
    toolActivity,
    error,
    sendMessage,
    setMessages,
  };
}

export { createDefaultProgress };
