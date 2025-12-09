import type { Message, ProgressState, ToolActivity } from "../types";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { ProgressBar } from "./progress-bar";

interface ChatContainerProps {
  messages: Message[];
  toolActivity: ToolActivity | null;
  progress: ProgressState;
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export function ChatContainer({
  messages,
  toolActivity,
  progress,
  isStreaming,
  error,
  onSendMessage,
}: ChatContainerProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header with progress */}
      <header className="sticky top-0 z-10 border-slate-800 border-b bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-slate-100">Cursus Feedback</h1>
                <p className="text-slate-500 text-xs">Interview in voortgang</p>
              </div>
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      {/* Chat area */}
      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <MessageList messages={messages} toolActivity={toolActivity} />
        </div>

        <MessageInput
          onSend={onSendMessage}
          disabled={isStreaming}
          placeholder="Typ je antwoord..."
        />
      </main>
    </div>
  );
}
