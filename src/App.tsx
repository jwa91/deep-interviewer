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
import type { ProgressState } from "./features/interview";

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

  // Restore existing messages when session is loaded
  useEffect(() => {
    if (existingMessages.length > 0) {
      setMessages(existingMessages);
    }
  }, [existingMessages, setMessages]);

  // Sync progress from session hook
  useEffect(() => {
    if (progress.completedCount > 0) {
      setLocalProgress(progress);
    }
  }, [progress]);

  // Show loading spinner while checking for existing session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto text-emerald-500" />
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
        onComplete={handleComplete}
      />
      <CompletionModal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} />
    </>
  );
}

export default App;
