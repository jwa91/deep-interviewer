import { Button } from "@/components/ui/button";
import { HeeyooLogo } from "@/components/ui/heeyoo-logo";
import type { ProgressState } from "../types";
import { ProgressBar } from "./progress-bar";

interface ChatHeaderProps {
  readonly progress: ProgressState;
  readonly sessionId: string;
  readonly onLeave: () => void;
  readonly onShowCompletion: () => void;
}

export function ChatHeader({ progress, sessionId, onLeave, onShowCompletion }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-border border-b-2 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HeeyooLogo height={40} width={152} className="hidden sm:block" />
            <div>
              <h1 className="font-black font-heading text-foreground text-xl">LLM Fundamentals</h1>
              <p className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">
                Cursus feedback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress.isComplete && (
              <Button
                variant="default"
                size="sm"
                onClick={onShowCompletion}
                className="xs:inline-flex hidden"
              >
                Bekijk afronding
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onLeave}>
              Chat verlaten
            </Button>
          </div>
        </div>
        <ProgressBar progress={progress} sessionId={sessionId} />
      </div>
    </header>
  );
}
