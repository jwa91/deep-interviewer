import { CompletionFooter, MessageInput } from "./input";
import { MessageList } from "./messages";
import { ChatHeader } from "./progress";
import type { ChatItem, ProgressState } from "./types";

interface ChatContainerProps {
  readonly chatItems: ChatItem[];
  readonly sessionId: string;
  readonly progress: ProgressState;
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly onSendMessage: (message: string) => void;
  readonly onLeave: () => void;
  readonly onShowCompletion: () => void;
}

export function ChatContainer({
  chatItems,
  sessionId,
  progress,
  isStreaming,
  error,
  onSendMessage,
  onLeave,
  onShowCompletion,
}: ChatContainerProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                        linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <ChatHeader
        progress={progress}
        sessionId={sessionId}
        onLeave={onLeave}
        onShowCompletion={onShowCompletion}
      />

      {/* Chat area */}
      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {error && (
          <div className="brutal-shadow mx-4 mt-4 rounded-md border-2 border-destructive bg-destructive/10 p-3 font-bold text-destructive">
            {error}
          </div>
        )}

        <MessageList chatItems={chatItems} sessionId={sessionId} />

        {progress.isComplete ? (
          <CompletionFooter onShowCompletion={onShowCompletion} />
        ) : (
          <MessageInput
            onSend={onSendMessage}
            disabled={isStreaming}
            placeholder="Typ je antwoord..."
          />
        )}
      </main>
    </div>
  );
}
