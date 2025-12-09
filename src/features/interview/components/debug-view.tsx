import { useState, useCallback, useEffect } from "react";
import { ChatContainer } from "./chat-container";
import { CompletionModal } from "./completion-modal";
import { createDefaultProgress } from "../hooks/use-chat-stream";
import type { ChatItem, ProgressState } from "../types";

export function DebugView() {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    ...createDefaultProgress(),
    completedCount: 1,
    questionsCompleted: {
      ...createDefaultProgress().questionsCompleted,
      ai_background: true,
    },
  });

  const [chatItems, setChatItems] = useState<ChatItem[]>([
    {
      type: "message",
      id: "1",
      data: {
        id: "1",
        role: "assistant",
        content: "Hallo! Ik ben de AI interviewer. We gaan het hebben over de cursus.",
        timestamp: new Date(Date.now() - 60000),
      },
    },
    {
      type: "message",
      id: "2",
      data: {
        id: "2",
        role: "user",
        content: "Hoi, dat is goed. Ik ben er klaar voor.",
        timestamp: new Date(Date.now() - 50000),
      },
    },
    {
      type: "tool_card",
      id: "3",
      data: {
        questionId: "ai_background",
        state: "completed",
      },
    },
    {
      type: "message",
      id: "4",
      data: {
        id: "4",
        role: "assistant",
        content: "Mooi. Wat vond je van het onderdeel over AI achtergrond?",
        timestamp: new Date(Date.now() - 40000),
      },
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);

  const toggleCompleted = useCallback(() => {
    setProgress((prev) => {
        if (prev.isComplete) {
            return {
                ...createDefaultProgress(),
                completedCount: 1,
                questionsCompleted: {
                    ...createDefaultProgress().questionsCompleted,
                    ai_background: true,
                },
            };
        }
        return {
            ...prev,
            completedCount: 9,
            isComplete: true,
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
        };
    });
  }, []);

  useEffect(() => {
    if (progress.isComplete) {
        setShowCompletionModal(true);
    }
  }, [progress.isComplete]);

  const handleSendMessage = (message: string) => {
    // Check for debug commands
    if (message.trim() === "/complete") {
        toggleCompleted();
        return;
    }

    // Mock user message
    const userMsg: ChatItem = {
      type: "message",
      id: Date.now().toString(),
      data: {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      },
    };
    
    setChatItems((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Mock response after delay
    setTimeout(() => {
        setIsStreaming(false);
        const assistantMsg: ChatItem = {
            type: "message",
            id: (Date.now() + 1).toString(),
            data: {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Dat is interessant. Kun je daar meer over vertellen? (Dit is een test antwoord). Typ /complete om het interview af te ronden.",
                timestamp: new Date(),
            }
        };
        setChatItems((prev) => [...prev, assistantMsg]);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="fixed bottom-4 left-4 z-50 rounded bg-black/80 px-2 py-1 font-mono text-white text-xs">
         Debug Mode • <button onClick={toggleCompleted} className="underline hover:text-primary">Toggle Complete</button>
      </div>
      <ChatContainer
        chatItems={chatItems}
        sessionId="debug-session"
        progress={progress}
        isStreaming={isStreaming}
        error={null}
        onSendMessage={handleSendMessage}
        onLeave={() => {
          // Remove debug param to return to welcome screen
          const url = new URL(window.location.href);
          url.searchParams.delete("debug");
          
          // Clear any existing session so we actually go to the welcome screen
          try {
            sessionStorage.removeItem("interview_session");
          } catch (e) {
            // ignore
          }
          
          window.location.href = url.toString();
        }}
      />
      <CompletionModal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} />
    </div>
  );
}
