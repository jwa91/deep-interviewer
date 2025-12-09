import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, FileTextIcon, Loader2Icon, QuoteIcon } from "lucide-react";
import { useState } from "react";
import { useTopicResponse } from "../hooks/use-topic-response";
import type { QuestionId, ToolCardData } from "../types";

interface AgentNoteCardProps {
  readonly questionId: QuestionId;
  readonly state: ToolCardData["state"];
  readonly sessionId: string;
}

const QUESTION_LABELS: Record<QuestionId, string> = {
  ai_background: "AI Ervaring",
  overall_impression: "Algemene Indruk",
  perceived_content: "Inhoudservaring",
  difficulty: "Moeilijkheidsgraad",
  content_quality: "Inhoudskwaliteit",
  presentation: "Presentatie",
  clarity: "Duidelijkheid",
  suggestions: "Suggesties",
  course_parts: "Cursusonderdelen",
};

function getQuestionLabel(questionId: QuestionId): string {
  return QUESTION_LABELS[questionId] ?? "Notitie";
}

interface FieldRendererProps {
  readonly label: string;
  readonly value: unknown;
}

function FieldRenderer({ label, value }: FieldRendererProps) {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle arrays (e.g. toolsUsed, useCaseSubjects)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    return (
      <div className="space-y-1">
        <h4 className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</h4>
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: items are strings without unique IDs
              key={`${label}-${i}`}
              className="inline-flex rounded-md bg-emerald-500/10 px-2 py-1 font-medium text-emerald-300 text-xs ring-1 ring-emerald-500/20 ring-inset"
            >
              {String(item)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</span>
        <span className={`font-medium text-sm ${value ? "text-emerald-400" : "text-slate-400"}`}>
          {value ? "Ja" : "Nee"}
        </span>
      </div>
    );
  }

  // Handle ratings (numbers 1-5 typically)
  // We assume simple numbers are ratings if the label contains 'Rating' or 'Level' or 'Score'
  // But generic number handling is safer if we don't rely on naming conventions strictly
  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-emerald-300 text-sm">{value}</span>
          {/* Simple visual indicator for 1-5 ratings */}
          {value >= 1 && value <= 5 && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`h-1.5 w-1.5 rounded-full ${
                    star <= value ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle strings and other types
  return (
    <div className="space-y-1">
      <h4 className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</h4>
      <p className="text-slate-200 text-sm leading-relaxed">{String(value)}</p>
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  // Common
  userType: "Gebruikerstype",
  experienceLevel: "Ervaringsniveau",
  toolsUsed: "Gebruikte Tools",
  useCaseSubjects: "Gebruiksdoelen",
  overallRating: "Algemene Beoordeling",
  sentiment: "Sentiment",
  mainTopicsIdentified: "Identificeerde Onderwerpen",
  alignsWithIntent: "Komt overeen met doel",
  difficultyRating: "Moeilijkheidsgraad",
  difficultyLevel: "Niveau",
  paceRating: "Tempo",
  qualityRating: "Kwaliteit",
  relevanceRating: "Relevantie",
  depthRating: "Diepgang",
  presentationRating: "Presentatie",
  engagementRating: "Betrokkenheid",
  structureRating: "Structuur",
  clarityRating: "Duidelijkheid",
  unclearTopics: "Onduidelijke Onderwerpen",
  needsExplanation: "Uitleg Nodig",
  explanationTopic: "Te Verklaren Onderwerp",
  suggestions: "Suggesties",
  topSuggestion: "Top Suggestie",
  wouldRecommend: "Zou Aanraden",
  preferredPart: "Voorkeur Onderdeel",
  theoryPartRating: "Theorie Score",
  practicalPartRating: "Praktijk Score",
  balanceOpinion: "Balans Mening",
};

export function AgentNoteCard({ questionId, state, sessionId }: AgentNoteCardProps) {
  const [hasExpanded, setHasExpanded] = useState(false);
  const { data, isLoading, error, fetch } = useTopicResponse({
    sessionId,
    topic: questionId,
  });

  const handleAccordionChange = (value: string) => {
    // Trigger fetch when opening for the first time
    if (value === questionId && !hasExpanded && !data) {
      setHasExpanded(true);
      fetch();
    }
  };

  // Active state - show skeleton
  if (state === "active") {
    return (
      <div className="fade-in slide-in-from-bottom-2 animate-in py-2 duration-300">
        <div className="mx-auto max-w-md rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
              <Loader2Icon className="h-4 w-4 animate-spin text-amber-400" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-amber-500/20" />
              <Skeleton className="h-3 w-48 bg-amber-500/10" />
            </div>
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
          </div>
        </div>
      </div>
    );
  }

  // Completed state - show expandable card
  const summary = data?.data && "summary" in data.data ? (data.data.summary as string) : null;
  const quotes = data?.data && "quotes" in data.data ? (data.data.quotes as string[]) : null;

  // Get other fields to display
  const otherFields = data?.data
    ? Object.entries(data.data).filter(([key]) => key !== "summary" && key !== "quotes")
    : [];

  return (
    <div className="fade-in slide-in-from-bottom-2 animate-in py-2 duration-300">
      <Accordion
        type="single"
        collapsible
        onValueChange={handleAccordionChange}
        className="mx-auto max-w-md overflow-hidden"
      >
        <AccordionItem
          value={questionId}
          className="overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/5"
        >
          <AccordionTrigger className="px-3 py-3 hover:no-underline [&[data-state=open]]:border-emerald-500/30 [&[data-state=open]]:border-b">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                <FileTextIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex flex-1 flex-col items-start gap-0.5">
                <span className="font-medium text-emerald-300 text-sm">Agent notities</span>
                <span className="text-emerald-400/70 text-xs">{getQuestionLabel(questionId)}</span>
              </div>
              {/* Checkmark indicator */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 text-slate-300">
            {isLoading && (
              <div className="space-y-2 py-2">
                <Skeleton className="h-4 w-full bg-emerald-500/10" />
                <Skeleton className="h-4 w-3/4 bg-emerald-500/10" />
                <Skeleton className="h-4 w-1/2 bg-emerald-500/10" />
              </div>
            )}

            {error && (
              <div className="py-2 text-red-400 text-sm">
                <p>{error}</p>
              </div>
            )}

            {data && !isLoading && (
              <div className="space-y-6 py-3">
                {/* Summary section */}
                {summary && (
                  <div>
                    <h4 className="mb-1.5 font-medium text-slate-400 text-xs uppercase tracking-wide">
                      Samenvatting
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed">{summary}</p>
                  </div>
                )}

                {/* Dynamic Fields Section */}
                {otherFields.length > 0 && (
                  <div className="space-y-3 rounded-md border border-slate-800 bg-slate-900/50 p-3">
                    {otherFields.map(([key, value]) => (
                      <FieldRenderer key={key} label={FIELD_LABELS[key] || key} value={value} />
                    ))}
                  </div>
                )}

                {/* Quotes section */}
                {quotes && quotes.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 font-medium text-slate-400 text-xs uppercase tracking-wide">
                      Citaten
                    </h4>
                    <ul className="space-y-2">
                      {quotes.map((quote, index) => (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: quotes are static strings without unique IDs
                          key={`${questionId}-quote-${index}`}
                          className="flex gap-2 text-slate-300 text-sm"
                        >
                          <QuoteIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/50" />
                          <span className="italic">&ldquo;{quote}&rdquo;</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fallback if no data */}
                {!summary && otherFields.length === 0 && (!quotes || quotes.length === 0) && (
                  <p className="text-slate-400 text-sm italic">Geen notities beschikbaar.</p>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
