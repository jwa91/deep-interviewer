import type React from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { FIELD_LABELS } from "@/shared/schema";
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

function renderFieldValue(value: unknown): React.ReactNode {
	if (value === null || value === undefined) {
		return null;
	}

	// Arrays: comma-separated
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return null;
		}
		return (
			<div className="font-medium text-sm leading-relaxed">
				{value.map((item) => String(item)).join(", ")}
			</div>
		);
	}

	// Booleans: Ja/Nee
	if (typeof value === "boolean") {
		return (
			<span
				className={`font-bold font-mono text-sm ${value ? "text-primary" : "text-muted-foreground"}`}
			>
				{value ? "Ja" : "Nee"}
			</span>
		);
	}

	// Numbers 1-5: rating squares
	if (typeof value === "number") {
		if (value >= 1 && value <= 5) {
			return (
				<div className="flex gap-1.5">
					{[1, 2, 3, 4, 5].map((star) => (
						<div
							key={star}
							className={`h-3 w-3 rounded-sm border-2 border-foreground ${
								star <= value ? "bg-primary" : "bg-transparent"
							}`}
						/>
					))}
				</div>
			);
		}
		return (
			<span className="font-bold font-mono text-foreground text-sm">
				{value}
			</span>
		);
	}

	// Strings and other types
	return (
		<p className="font-mono text-foreground text-sm leading-relaxed">
			{String(value)}
		</p>
	);
}

export function AgentNoteCard({
	questionId,
	state,
	sessionId,
}: AgentNoteCardProps) {
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

	// Active state - show skeleton in bubble style
	if (state === "active") {
		return (
			<div className="fade-in slide-in-from-bottom-2 animate-in py-2 duration-300">
				<div className="flex w-full justify-start gap-3">
					{/* Avatar */}
					<div className="brutal-shadow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary">
						<Loader2Icon className="h-5 w-5 animate-spin text-secondary-foreground" />
					</div>

					{/* Bubble */}
					<div className="brutal-shadow max-w-[80%] rounded-lg border-2 border-border bg-card p-3">
						<div className="flex items-center gap-3">
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32 bg-muted" />
								<Skeleton className="h-3 w-48 bg-muted/50" />
							</div>
							<div className="flex gap-0.5">
								<div
									className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
									style={{ animationDelay: "0ms" }}
								/>
								<div
									className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
									style={{ animationDelay: "200ms" }}
								/>
								<div
									className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
									style={{ animationDelay: "400ms" }}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Completed state - show expandable card
	const summary =
		data?.data && "summary" in data.data ? (data.data.summary as string) : null;
	const quotes =
		data?.data && "quotes" in data.data ? (data.data.quotes as string[]) : null;

	// Get other fields to display
	const otherFields = data?.data
		? Object.entries(data.data).filter(
				([key]) => key !== "summary" && key !== "quotes",
			)
		: [];

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in py-2 duration-300">
			<div className="flex w-full justify-start gap-3">
				{/* Avatar */}
				<div className="brutal-shadow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary">
					<FileTextIcon className="h-5 w-5 text-secondary-foreground" />
				</div>

				{/* Bubble container for Accordion */}
				<div className="brutal-shadow w-full max-w-[80%] overflow-hidden rounded-lg border-2 border-border bg-card">
					<Accordion
						type="single"
						collapsible
						onValueChange={handleAccordionChange}
						className="w-full"
					>
						<AccordionItem value={questionId} className="border-0">
							<AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-border [&[data-state=open]]:border-b-2">
								<div className="flex flex-1 items-center gap-3">
									<div className="flex flex-1 flex-col items-start gap-0.5">
										<span className="font-bold font-mono text-card-foreground text-sm uppercase">
											Agent notities
										</span>
										<span className="font-mono text-muted-foreground text-xs">
											{getQuestionLabel(questionId)}
										</span>
									</div>
									{/* Checkmark indicator */}
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary text-primary-foreground">
										<CheckIcon className="h-3.5 w-3.5" />
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pt-2 pb-3 text-card-foreground">
								{isLoading && (
									<div className="space-y-2 py-2">
										<Skeleton className="h-4 w-full bg-muted" />
										<Skeleton className="h-4 w-3/4 bg-muted" />
										<Skeleton className="h-4 w-1/2 bg-muted" />
									</div>
								)}

								{error && (
									<div className="py-2 font-bold text-destructive text-sm">
										<p>{error}</p>
									</div>
								)}

								{data && !isLoading && (
									<div className="space-y-6">
										{/* Summary section */}
										{summary && (
											<div>
												<h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wide">
													Samenvatting
												</h4>
												<p className="font-mono text-card-foreground text-sm leading-relaxed">
													{summary}
												</p>
											</div>
										)}

										{/* Dynamic Fields Section */}
										{otherFields.length > 0 && (
											<div className="space-y-3 rounded-md border-2 border-border bg-background p-3">
												{otherFields.map(([key, value]) => {
													const rendered = renderFieldValue(value);
													if (!rendered) {
														return null;
													}
													return (
														<div key={key} className="space-y-1">
															<h4 className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">
																{FIELD_LABELS[key] || key}
															</h4>
															{rendered}
														</div>
													);
												})}
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
															key={`${questionId}-quote-${index}`}
															className="flex gap-2 font-mono text-card-foreground text-sm"
														>
															<QuoteIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
															<span className="italic">
																&ldquo;{quote}&rdquo;
															</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{/* Fallback if no data */}
										{!summary &&
											otherFields.length === 0 &&
											(!quotes || quotes.length === 0) && (
												<p className="font-mono text-muted-foreground text-sm italic">
													Geen notities beschikbaar.
												</p>
											)}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
		</div>
	);
}
