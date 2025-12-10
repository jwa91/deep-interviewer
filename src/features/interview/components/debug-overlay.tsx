import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { useChatStream } from "../hooks/use-chat-stream";

const API_BASE = "http://localhost:3001";

interface DebugOverlayProps {
  onAutoReply?: (text: string) => void;
}

export function DebugOverlay({ onAutoReply }: DebugOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const fetchSuggestedReply = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/interviews/debug/suggested-reply`);
      const data = await res.json();
      setSuggestedReply(data.reply);
    } catch {
      // ignore
    }
  }, []);

  // Poll for suggested reply (simple way to keep it synced)
  useEffect(() => {
    const interval = setInterval(fetchSuggestedReply, 2000);
    fetchSuggestedReply();
    return () => clearInterval(interval);
  }, [fetchSuggestedReply]);

  const handleReset = async () => {
    await fetch(`${API_BASE}/api/interviews/debug/reset`, { method: "POST" });
    window.location.reload();
  };

  const handleJump = async (step: number) => {
    await fetch(`${API_BASE}/api/interviews/debug/jump`, {
      method: "POST",
      body: JSON.stringify({ step }),
      headers: { "Content-Type": "application/json" },
    });
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          size="sm"
          variant="destructive"
          className="font-mono text-xs opacity-50 hover:opacity-100"
          onClick={() => setIsOpen(true)}
        >
          Debug Controls
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 rounded-lg border-2 border-primary bg-background p-4 brutal-shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono font-bold text-sm text-primary uppercase">Debug Controller</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-bold text-muted-foreground text-xs uppercase">Session</p>
          <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
            Reset Session (New Visitor)
          </Button>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-muted-foreground text-xs uppercase">Jump to Step</p>
          <div className="grid grid-cols-5 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Button
                key={i}
                variant="secondary"
                size="sm"
                className="h-6 px-0 text-xs"
                onClick={() => handleJump(i)}
              >
                {i}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-muted-foreground text-xs uppercase">Quick Actions</p>
          <div className="rounded-md border-2 bg-muted p-2">
            <p className="mb-2 text-[10px] text-muted-foreground">Suggested User Reply:</p>
            <p className="mb-2 font-mono text-xs italic">"{suggestedReply || "..."}"</p>
            <Button
              size="sm"
              className="w-full"
              disabled={!suggestedReply}
              onClick={() => {
                if (onAutoReply && suggestedReply) {
                  onAutoReply(suggestedReply);
                } else {
                  // Dispatch event for MessageInput
                  window.dispatchEvent(
                    new CustomEvent("debug:fill-message", { detail: suggestedReply })
                  );
                }
              }}
            >
              Auto-Fill Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
