import { Progress } from "@/components/ui/progress";
import type { ProgressState } from "../types";

interface ProgressBarProps {
  progress: ProgressState;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = (progress.completedCount / progress.totalQuestions) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Voortgang</span>
        <span className="font-medium text-slate-300">
          {progress.completedCount} / {progress.totalQuestions} vragen beantwoord
        </span>
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
  );
}
