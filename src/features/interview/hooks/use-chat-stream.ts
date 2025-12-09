import { toolNameToQuestionId } from "@/shared/schema";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef, useState } from "react";
import type {
  ChatItem,
  Message,
  ProgressState,
  SSEProgressEvent,
  SSEToolEndEvent,
  SSEToolStartEvent,
} from "../types";

const API_BASE = "http://localhost:3001";

interface UseChatStreamOptions {
  sessionId: string | null;
  onProgressUpdate?: (progress: ProgressState) => void;
  onComplete?: () => void;
}

interface UseChatStreamReturn {
  chatItems: ChatItem[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  setChatItems: Dispatch<SetStateAction<ChatItem[]>>;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: SSE handler requires many branches for different event types
    async (content: string) => {
      if (!sessionId || isStreaming) {
        return;
      }

      setError(null);

      // Add user message
      const userMessageId = `user_${generateId()}`;
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setChatItems((prev) => [...prev, { type: "message", id: userMessageId, data: userMessage }]);

      setIsStreaming(true);

      // Abort any existing request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Track current message being streamed
      let currentMessageId: string | null = null;

      try {
        const response = await fetch(`${API_BASE}/api/interviews/${sessionId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith("event: ")) {
              continue;
            }

            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (!dataStr) {
                continue;
              }

              try {
                const data = JSON.parse(dataStr);
                const eventLine = i > 0 ? lines[i - 1] : null;
                const eventType = eventLine?.startsWith("event: ")
                  ? eventLine.slice(7).trim()
                  : null;

                // Handle message_start - create new assistant message
                if (eventType === "message_start" && data.messageId) {
                  const messageId = data.messageId as string;
                  currentMessageId = messageId;
                  const newMessage: Message = {
                    id: messageId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                    isStreaming: true,
                  };
                  setChatItems((prev) => [
                    ...prev,
                    { type: "message", id: messageId, data: newMessage },
                  ]);
                  continue;
                }

                // Handle token - append to current message
                if (eventType === "token" && data.content && currentMessageId) {
                  setChatItems((prev) =>
                    prev.map((item) =>
                      item.type === "message" && item.id === currentMessageId
                        ? {
                            ...item,
                            data: {
                              ...item.data,
                              content: item.data.content + data.content,
                            },
                          }
                        : item
                    )
                  );
                  continue;
                }

                // Handle message_end - finalize message
                if (eventType === "message_end" && data.messageId) {
                  setChatItems((prev) =>
                    prev.map((item) =>
                      item.type === "message" && item.id === data.messageId
                        ? {
                            ...item,
                            data: { ...item.data, isStreaming: false },
                          }
                        : item
                    )
                  );
                  continue;
                }

                // Handle tool_start - add tool card
                if (eventType === "tool_start" && data.name) {
                  const toolData = data as SSEToolStartEvent;
                  const questionId = toolNameToQuestionId(toolData.name);
                  if (questionId) {
                    const toolCardId = `tool_${questionId}_${generateId()}`;
                    setChatItems((prev) => [
                      ...prev,
                      {
                        type: "tool_card",
                        id: toolCardId,
                        data: { questionId, state: "active" },
                      },
                    ]);
                  }
                  continue;
                }

                // Handle tool_end - update tool card state
                if (eventType === "tool_end" && data.name) {
                  const toolData = data as SSEToolEndEvent;
                  const questionId = toolNameToQuestionId(toolData.name);
                  if (questionId) {
                    setChatItems((prev) =>
                      prev.map((item) =>
                        item.type === "tool_card" && item.data.questionId === questionId
                          ? {
                              ...item,
                              data: { ...item.data, state: "completed" },
                            }
                          : item
                      )
                    );
                  }
                  continue;
                }

                // Handle progress
                if (eventType === "progress" && "completedCount" in data) {
                  const progressData = data as SSEProgressEvent;
                  onProgressUpdate?.(progressData);
                  if (progressData.isComplete) {
                    onComplete?.();
                  }
                  continue;
                }

                // Handle done - process final progress (cleanup is in finally block)
                if (eventType === "done") {
                  if (data.progress) {
                    onProgressUpdate?.(data.progress);
                    if (data.progress.isComplete) {
                      onComplete?.();
                    }
                  }
                  continue;
                }

                // Handle error
                if (eventType === "error" && data.error) {
                  setError(data.error);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : "Er is iets misgegaan";
        setError(errorMessage);
      } finally {
        // Always cleanup: finalize streaming messages and remove empty ones
        setChatItems((prev) =>
          prev
            .map((item) =>
              item.type === "message" && item.data.isStreaming
                ? { ...item, data: { ...item.data, isStreaming: false } }
                : item
            )
            .filter(
              (item) =>
                item.type !== "message" ||
                item.data.role !== "assistant" ||
                item.data.content.trim() !== ""
            )
        );
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming, onProgressUpdate, onComplete]
  );

  return {
    chatItems,
    isStreaming,
    error,
    sendMessage,
    setChatItems,
  };
}

export { createDefaultProgress };
