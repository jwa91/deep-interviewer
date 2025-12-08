import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import type { Message, ToolActivity as ToolActivityType } from "../types";
import { MessageBubble } from "./message-bubble";
import { ToolActivity } from "./tool-activity";

interface MessageListProps {
  messages: Message[];
  toolActivity: ToolActivityType | null;
}

export function MessageList({ messages, toolActivity }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or tool activity changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger on data changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, toolActivity?.name]);

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <svg
                className="h-6 w-6 text-slate-500"
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
            <p className="text-sm">Stuur een bericht om het interview te starten</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {toolActivity && <ToolActivity activity={toolActivity} />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
