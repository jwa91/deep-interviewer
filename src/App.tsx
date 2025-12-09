import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Spinner } from "./components/ui/spinner";
import {
  ChatContainer,
  CompletionModal,
  WelcomeScreen,
  createDefaultProgress,
  useChatStream,
  useInterviewSession,
} from "./features/interview";
import type { ChatItem, Message, ProgressState, ToolCall } from "./features/interview";
import { toolNameToQuestionId } from "./shared/schema";
import { WELCOME_MESSAGE } from "./shared/constants";

// Welcome message for new sessions - matches what's stored in LangGraph state
const createWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: WELCOME_MESSAGE,
  timestamp: new Date(),
});

// Convert Message to ChatItem
const messageToItem = (message: Message): ChatItem => {
  // Check if this message has tool calls that need to be rendered as tool cards
  // This is a simplified handling - in a real app we might want more sophisticated
  // interleaving, but for restoration, we primarily want to show the cards.
  // However, the ChatItem type expects either a message OR a tool_card.
  // If we have a message with tool calls, we might need to generate multiple items?
  // OR, the backend should have returned them as separate events/messages?
  
  // Actually, the `chatItems` state in useChatStream handles the "tool_card" items separately.
  // When we restore messages, we only get the "text" content messages usually.
  // If we want to restore tool cards, we need to know about them.
  
  // For now, basic message restoration:
  return {
    type: "message",
    id: message.id,
    data: message,
  };
};

// Helper to restore chat items from messages including tool calls
const restoreChatItems = (messages: Message[]): ChatItem[] => {
  const items: ChatItem[] = [];
  
  for (const msg of messages) {
    // Add the text message
    if (msg.content) {
      items.push({
        type: "message",
        id: msg.id,
        data: msg,
      });
    }
    
    // If message has tool calls, add tool cards
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      for (const [index, toolCall] of msg.toolCalls.entries()) {
        const questionId = toolNameToQuestionId(toolCall.name);
        if (questionId) {
          items.push({
            type: "tool_card",
            id: `${msg.id}_tool_${index}`,
            data: {
              questionId,
              state: "completed", // Restored tools are always completed
            },
          });
        }
      }
    }
  }
  
  return items;
};

function App() {
  const {
    session,
    progress,
    isLoading: sessionLoading,
    error: sessionError,
    existingMessages,
    startSession,
    updateProgress,
  } = useInterviewSession();

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [localProgress, setLocalProgress] = useState<ProgressState>(createDefaultProgress());

  const handleProgressUpdate = useCallback(
    (newProgress: ProgressState) => {
      setLocalProgress(newProgress);
      updateProgress(newProgress);
    },
    [updateProgress]
  );

  const handleComplete = useCallback(() => {
    setShowCompletionModal(true);
  }, []);

  const {
    chatItems,
    isStreaming,
    error: chatError,
    sendMessage,
    setChatItems,
  } = useChatStream({
    sessionId: session?.sessionId ?? null,
    onProgressUpdate: handleProgressUpdate,
    onComplete: handleComplete,
  });

  // Initialize with welcome message or restore existing messages
  useEffect(() => {
    if (existingMessages.length > 0) {
      // Restore existing conversation with tool cards
      setChatItems(restoreChatItems(existingMessages));
    } else if (session?.sessionId && chatItems.length === 0) {
      // New session - show welcome message (also stored in LangGraph state)
      setChatItems([messageToItem(createWelcomeMessage())]);
    }
  }, [session?.sessionId, existingMessages, setChatItems, chatItems.length]);

  // Sync progress from session hook
  useEffect(() => {
    if (progress.completedCount > 0) {
      setLocalProgress(progress);
    }

    // Check if session is already complete upon loading
    if (progress.isComplete) {
      setShowCompletionModal(true);
    }
  }, [progress]);

  // Show loading spinner while checking for existing session
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-4 text-slate-400 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen if no session
  if (!session) {
    return <WelcomeScreen onStart={startSession} isLoading={sessionLoading} error={sessionError} />;
  }

  // Show chat interface
  return (
    <>
      <ChatContainer
        chatItems={chatItems}
        sessionId={session.sessionId}
        progress={localProgress}
        isStreaming={isStreaming}
        error={chatError}
        onSendMessage={sendMessage}
      />
      <CompletionModal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} />
    </>
  );
}

export default App;
