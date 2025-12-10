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
    <div className="group">
      <div className="flex items-baseline gap-3 mb-4">
        {/* Brutalist marker: solid square with border */}
        <div className="h-4 w-4 border-2 border-foreground bg-primary mt-1 shrink-0" />
        <h3 className="font-heading font-black text-xl text-foreground">{title}</h3>
      </div>

      <div className="pl-6 ml-2 space-y-6 pb-2">
        {/* Summary section */}
        {summary && (
          <div className="prose prose-sm max-w-none text-foreground font-medium leading-relaxed">
            <p>{summary}</p>
          </div>
        )}

        {/* Dynamic Fields Section */}
        {otherFields.length > 0 && (
          <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2 pt-2">
            {otherFields.map(([key, value]) => (
              <FieldRenderer key={key} label={FIELD_LABELS[key] || key} value={value} />
            ))}
          </div>
        )}

        {/* Quotes section */}
        {quotes && quotes.length > 0 && (
          <div className="relative pt-4">
            <h4 className="mb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2">
              <QuoteIcon className="h-3 w-3" />
              Opmerkelijke citaten
            </h4>
            <ul className="space-y-3">
              {quotes.map((quote, index) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: quotes are static strings without unique IDs
                  key={`${topicId}-quote-${index}`}
                  className="flex gap-3 text-sm text-foreground italic pl-3 border-l-4 border-primary"
                >
                  <span>&ldquo;{quote}&rdquo;</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
      <DialogContent className="brutal-shadow max-h-[85vh] w-[90vw] max-w-4xl overflow-hidden border-2 border-border bg-background p-0 text-foreground">
        <DialogHeader className="border-border border-b-2 px-8 py-6">
          <DialogTitle className="font-heading font-black text-2xl text-primary">
            Jouw Antwoorden
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-90px)]">
          <div className="space-y-10 px-8 py-8 pb-8">
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
                <div className="space-y-12">
                  {data.completedTopics.map((topicId, index) => {
                    const response = data.responses[topicId];
                    if (!response) {
                      return null;
                    }
                    return (
                      <div key={topicId}>
                        <TopicResponseItem topicId={topicId} response={response} />
                        {index < data.completedTopics.length - 1 && (
                          <div className="my-8 h-0.5 w-full bg-border" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
