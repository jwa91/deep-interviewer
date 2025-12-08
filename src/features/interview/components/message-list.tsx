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
    <ScrollArea className="flex-1 overflow-y-auto px-4">
      <div className="space-y-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {toolActivity && <ToolActivity activity={toolActivity} />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
