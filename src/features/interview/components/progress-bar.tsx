import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import type { ProgressState } from "../types";
import { SummaryModal } from "./summary-modal";

interface ProgressBarProps {
  readonly progress: ProgressState;
  readonly sessionId: string;
}

export function ProgressBar({ progress, sessionId }: ProgressBarProps) {
  const [showSummary, setShowSummary] = useState(false);
  const percentage = (progress.completedCount / progress.totalQuestions) * 100;
  const hasAnswers = progress.completedCount > 0;

  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground uppercase">Voortgang</span>
          <div className="flex items-center gap-3">
            {hasAnswers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(true)}
                className="-my-1 h-6 gap-1.5 px-2 font-bold text-primary hover:bg-primary/10 hover:text-primary-foreground"
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                <span>Bekijk antwoorden</span>
              </Button>
            )}
            <span className="font-bold font-mono text-foreground">
              {progress.completedCount} / {progress.totalQuestions} vragen beantwoord
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className="h-3 border-2 border-border bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
        />
        {progress.isComplete && (
          <p className="fade-in animate-in font-bold font-mono text-primary text-xs duration-500">
            ✓ Interview voltooid!
          </p>
        )}
      </div>

      <SummaryModal
        sessionId={sessionId}
        open={showSummary}
        onOpenChange={setShowSummary}
      />
    </>
  );
}
