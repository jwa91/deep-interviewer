import { Bot } from "lucide-react";
import type { ChatItem, ProgressState } from "../types";
import { Button } from "@/components/ui/button";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { ProgressBar } from "./progress-bar";

interface ChatContainerProps {
  readonly chatItems: ChatItem[];
  readonly sessionId: string;
  readonly progress: ProgressState;
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly onSendMessage: (message: string) => void;
  readonly onLeave: () => void;
}

export function ChatContainer({
  chatItems,
  sessionId,
  progress,
  isStreaming,
  error,
  onSendMessage,
  onLeave,
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

      {/* Header with progress */}
      <header className="sticky top-0 z-10 border-border border-b-2 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="brutal-shadow flex h-10 w-10 items-center justify-center rounded-md border-2 border-border bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-black text-xl text-foreground">Cursus Feedback</h1>
                <p className="font-mono font-bold text-xs text-muted-foreground uppercase tracking-wide">
                  Interview in voortgang
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLeave}>
              Chat verlaten
            </Button>
          </div>
          <ProgressBar progress={progress} sessionId={sessionId} />
        </div>
      </header>

      {/* Chat area */}
      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {error && (
          <div className="brutal-shadow mx-4 mt-4 rounded-md border-2 border-destructive bg-destructive/10 p-3 font-bold text-destructive">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <MessageList chatItems={chatItems} sessionId={sessionId} />
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
