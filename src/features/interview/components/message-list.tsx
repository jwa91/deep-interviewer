import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import type { ChatItem } from "../types";
import { AgentNoteCard } from "./agent-note-card";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  chatItems: ChatItem[];
  sessionId: string;
}

export function MessageList({ chatItems, sessionId }: MessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when items change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger on items changes
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [chatItems.length, chatItems[chatItems.length - 1]]);

  return (
    <ScrollArea ref={viewportRef} className="h-full px-4">
      <div className="space-y-4 py-4">
        {chatItems.map((item) => {
          if (item.type === "message") {
            return <MessageBubble key={item.id} message={item.data} />;
          }

          if (item.type === "tool_card") {
            return (
              <AgentNoteCard
                key={item.id}
                questionId={item.data.questionId}
                state={item.data.state}
                sessionId={sessionId}
              />
            );
          }

          return null;
        })}
      </div>
    </ScrollArea>
  );
}
