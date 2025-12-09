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
import type { Message, ProgressState } from "./features/interview";
import { WELCOME_MESSAGE } from "./shared/constants";

// Welcome message for new sessions - matches what's stored in LangGraph state
const createWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: WELCOME_MESSAGE,
  timestamp: new Date(),
});

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
    messages,
    isStreaming,
    toolActivity,
    error: chatError,
    sendMessage,
    setMessages,
  } = useChatStream({
    sessionId: session?.sessionId ?? null,
    onProgressUpdate: handleProgressUpdate,
    onComplete: handleComplete,
  });

  // Initialize with welcome message or restore existing messages
  useEffect(() => {
    if (existingMessages.length > 0) {
      // Restore existing conversation
      setMessages(existingMessages);
    } else if (session?.sessionId && messages.length === 0) {
      // New session - show welcome message (also stored in LangGraph state)
      setMessages([createWelcomeMessage()]);
    }
  }, [session?.sessionId, existingMessages, setMessages, messages.length]);

  // Sync progress from session hook
  useEffect(() => {
    if (progress.completedCount > 0) {
      setLocalProgress(progress);
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
        messages={messages}
        toolActivity={toolActivity}
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
