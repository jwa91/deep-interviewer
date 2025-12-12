import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Streamdown } from "streamdown";
import { TypingIndicator } from "../input";
import type { Message } from "../types";

interface MessageBubbleProps {
  readonly message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showTypingIndicator = message.isStreaming && !message.content;

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="brutal-shadow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          "brutal-shadow max-w-[80%] rounded-lg border-2 border-border px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {showTypingIndicator ? (
          <TypingIndicator />
        ) : (
          <div className="space-y-2">
            <Streamdown
              mode={message.isStreaming ? undefined : "static"}
              isAnimating={message.isStreaming}
              className="prose prose-sm whitespace-pre-wrap break-words font-mono text-sm leading-relaxed"
            >
              {message.content}
            </Streamdown>
            <time
              className={cn(
                "block font-bold text-[10px]",
                isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {formatTime(message.timestamp)}
            </time>
          </div>
        )}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="brutal-shadow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary">
          <svg
            className="h-5 w-5 text-secondary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
