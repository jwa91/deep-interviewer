import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTION_TITLES } from "@/shared/constants";
import { QuoteIcon } from "lucide-react";
import { useEffect } from "react";
import { useResponses } from "../hooks/use-responses";
import type { TopicResponse as TopicResponseType } from "../types";
import { FIELD_LABELS, FieldRenderer } from "./field-renderer";

interface SummaryModalProps {
  readonly sessionId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

interface TopicResponseItemProps {
  readonly topicId: string;
  readonly response: TopicResponseType;
}

function TopicResponseItem({ topicId, response }: TopicResponseItemProps) {
  if (!response) {
    return null;
  }

  const title = QUESTION_TITLES[topicId] || topicId;
  const summary = "summary" in response.data ? (response.data.summary as string) : null;
  const quotes = "quotes" in response.data ? (response.data.quotes as string[]) : null;

  const otherFields = response.data
    ? Object.entries(response.data).filter(([key]) => key !== "summary" && key !== "quotes")
    : [];

  return (
    <div className="space-y-3">
      <h3 className="font-bold font-mono text-primary text-sm uppercase tracking-wider">{title}</h3>
      <div className="brutal-shadow rounded-lg border-2 border-border bg-card p-4 text-card-foreground text-sm leading-relaxed">
        <div className="space-y-6">
          {/* Summary section */}
          {summary && (
            <div>
              <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wide">
                Samenvatting
              </h4>
              <p className="font-mono text-card-foreground text-sm leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Dynamic Fields Section */}
          {otherFields.length > 0 && (
            <div className="space-y-3 rounded-md border-2 border-border bg-background p-3">
              {otherFields.map(([key, value]) => (
                <FieldRenderer key={key} label={FIELD_LABELS[key] || key} value={value} />
              ))}
            </div>
          )}

          {/* Quotes section */}
          {quotes && quotes.length > 0 && (
            <div>
              <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wide">
                Citaten
              </h4>
              <ul className="space-y-2">
                {quotes.map((quote, index) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: quotes are static strings without unique IDs
                    key={`${topicId}-quote-${index}`}
                    className="flex gap-2 font-mono text-card-foreground text-sm"
                  >
                    <QuoteIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="italic">&ldquo;{quote}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
      <DialogContent className="brutal-shadow max-h-[85vh] w-[90vw] max-w-2xl overflow-hidden border-2 border-border bg-background p-0 text-foreground">
        <DialogHeader className="border-border border-b-2 px-6 py-4">
          <DialogTitle className="font-black font-heading text-primary text-xl">
            Jouw Antwoorden
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="space-y-8 px-6 py-6 pb-6">
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-muted" />
                    <Skeleton className="h-20 w-full bg-muted/50" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="brutal-shadow rounded-md border-2 border-destructive bg-destructive/10 p-4 font-bold text-destructive text-sm">
                Er is iets misgegaan bij het laden van je antwoorden: {error}
              </div>
            )}

            {data &&
              (data.completedTopics.length === 0 ? (
                <div className="py-8 text-center font-mono text-muted-foreground">
                  Nog geen antwoorden beschikbaar.
                </div>
              ) : (
                data.completedTopics.map((topicId) => {
                  const response = data.responses[topicId];
                  if (!response) {
                    return null;
                  }
                  return <TopicResponseItem key={topicId} topicId={topicId} response={response} />;
                })
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
