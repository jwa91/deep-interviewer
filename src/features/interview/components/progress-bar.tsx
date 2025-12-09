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
          <span className="text-slate-400">Voortgang</span>
          <div className="flex items-center gap-3">
            {hasAnswers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(true)}
                className="-my-1 h-6 gap-1.5 px-2 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                <span>Bekijk antwoorden</span>
              </Button>
            )}
            <span className="font-medium text-slate-300">
              {progress.completedCount} / {progress.totalQuestions} vragen beantwoord
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className="h-2 bg-slate-800 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-emerald-500 [&>[data-slot=progress-indicator]]:to-teal-500"
        />
        {progress.isComplete && (
          <p className="fade-in animate-in font-medium text-emerald-400 text-xs duration-500">
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
