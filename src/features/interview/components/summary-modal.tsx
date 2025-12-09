import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTION_TITLES } from "@/shared/constants";
import { QuoteIcon } from "lucide-react";
import { useEffect } from "react";
import { useResponses } from "../hooks/use-responses";
import { FIELD_LABELS, FieldRenderer } from "./field-renderer";

interface SummaryModalProps {
  readonly sessionId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SummaryModal({ sessionId, open, onOpenChange }: SummaryModalProps) {
  const { data, isLoading, error, fetch } = useResponses({ sessionId });

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetch();
    }
  }, [open, fetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[90vw] max-w-2xl overflow-hidden border-slate-800 bg-slate-950 p-0 text-slate-200">
        <DialogHeader className="border-b border-slate-800 px-6 py-4">
          <DialogTitle className="text-lg font-medium text-emerald-400">
            Jouw Antwoorden
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-80px)] px-6 py-6">
          <div className="space-y-8 pb-6">
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-slate-800" />
                    <Skeleton className="h-20 w-full bg-slate-800/50" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                Er is iets misgegaan bij het laden van je antwoorden: {error}
              </div>
            )}

            {data && (
              <>
                {data.completedTopics.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    Nog geen antwoorden beschikbaar.
                  </div>
                ) : (
                  data.completedTopics.map((topicId) => {
                    const response = data.responses[topicId];
                    if (!response) return null;

                    const title = QUESTION_TITLES[topicId] || topicId;
                    const summary =
                      "summary" in response.data
                        ? (response.data.summary as string)
                        : null;
                    const quotes =
                      "quotes" in response.data
                        ? (response.data.quotes as string[])
                        : null;

                    const otherFields = response.data
                      ? Object.entries(response.data).filter(
                          ([key]) => key !== "summary" && key !== "quotes"
                        )
                      : [];

                    return (
                      <div key={topicId} className="space-y-3">
                        <h3 className="font-medium text-emerald-400 text-sm uppercase tracking-wide">
                          {title}
                        </h3>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm leading-relaxed text-slate-300">
                          <div className="space-y-6">
                            {/* Summary section */}
                            {summary && (
                              <div>
                                <h4 className="mb-1.5 font-medium text-slate-400 text-xs uppercase tracking-wide">
                                  Samenvatting
                                </h4>
                                <p className="text-slate-200 text-sm leading-relaxed">
                                  {summary}
                                </p>
                              </div>
                            )}

                            {/* Dynamic Fields Section */}
                            {otherFields.length > 0 && (
                              <div className="space-y-3 rounded-md border border-slate-800 bg-slate-900/50 p-3">
                                {otherFields.map(([key, value]) => (
                                  <FieldRenderer
                                    key={key}
                                    label={FIELD_LABELS[key] || key}
                                    value={value}
                                  />
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
                                      key={`${topicId}-quote-${index}`}
                                      className="flex gap-2 text-slate-300 text-sm"
                                    >
                                      <QuoteIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/50" />
                                      <span className="italic">
                                        &ldquo;{quote}&rdquo;
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
