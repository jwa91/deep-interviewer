import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="border-slate-800 border-t p-4">
      <div className="flex items-end gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="max-h-32 min-h-[52px] resize-none border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="h-[52px] w-[52px] shrink-0 bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:shadow-none"
        >
          <svg
            className="h-5 w-5"
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
      {disabled && (
        <p className="mt-2 text-center text-slate-500 text-xs">
          Even geduld, de interviewer is aan het typen...
        </p>
      )}
    </form>
  );
}
