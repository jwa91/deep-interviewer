import { useEffect, useRef } from "react";
import type { Message, ToolActivity as ToolActivityType } from "../types";
import { MessageBubble } from "./message-bubble";
import { ToolActivity } from "./tool-activity";

interface MessageListProps {
  messages: Message[];
  toolActivity: ToolActivityType | null;
}

export function MessageList({ messages, toolActivity }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get last message info for scroll triggers
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage?.content ?? "";

  // Auto-scroll to bottom when messages change or content streams in
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger on content/activity changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, lastMessageContent.length, toolActivity?.name]);

  return (
    <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4">
      <div className="space-y-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {toolActivity && <ToolActivity activity={toolActivity} />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
