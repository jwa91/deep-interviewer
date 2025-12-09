import type { ToolActivity as ToolActivityType } from "../types";

interface ToolActivityProps {
  activity: ToolActivityType;
}

const TOOL_LABELS: Record<string, string> = {
  record_ai_background: "AI ervaring vastleggen",
  record_overall_impression: "Algemene indruk vastleggen",
  record_perceived_content: "Inhoudservaring vastleggen",
  record_difficulty: "Moeilijkheidsgraad vastleggen",
  record_content_quality: "Inhoudskwaliteit vastleggen",
  record_presentation: "Presentatie vastleggen",
  record_clarity: "Duidelijkheid vastleggen",
  record_suggestions: "Suggesties vastleggen",
  record_course_parts: "Cursusonderdelen vastleggen",
};

function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] || "Notitie maken";
}

export function ToolActivity({ activity }: ToolActivityProps) {
  return (
    <div className="fade-in slide-in-from-bottom-2 flex animate-in items-center justify-center py-2 duration-300">
      <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-400 text-sm">
        <span className="text-base">💭</span>
        <span>{getToolLabel(activity.name)}...</span>
        {activity.isActive && (
          <div className="flex gap-0.5">
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"
              style={{ animationDelay: "400ms" }}
            />
          </div>
        )}
        {!activity.isActive && (
          <svg
            className="h-4 w-4 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
