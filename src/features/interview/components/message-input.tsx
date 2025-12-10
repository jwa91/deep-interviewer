import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useState } from "react";

interface MessageInputProps {
  readonly onSend: (message: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Typ je bericht...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  // Allow setting message externally (for debug quick actions)
  useEffect(() => {
    const handleDebugFill = (e: CustomEvent<string>) => {
        setMessage(e.detail);
        // Optional: auto-submit
        // onSend(e.detail);
        // setMessage("");
    };
    window.addEventListener("debug:fill-message", handleDebugFill as EventListener);
    return () => window.removeEventListener("debug:fill-message", handleDebugFill as EventListener);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-border border-t-2 bg-background p-4">
      <div className="flex items-end gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Even geduld, de interviewer is aan het typen..." : placeholder}
          disabled={disabled}
          className="max-h-32 min-h-[52px] resize-none bg-input font-mono text-base text-foreground placeholder:text-muted-foreground"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="h-[52px] w-[52px] shrink-0"
        >
          <svg
            className="h-6 w-6 rotate-90 transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span className="sr-only">Verstuur</span>
        </Button>
      </div>
    </form>
  );
}
