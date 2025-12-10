import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTION_TITLES } from "@/shared/constants";
import { FIELD_LABELS } from "@/shared/schema";
import { QuoteIcon } from "lucide-react";
import { useEffect } from "react";
import { useResponses } from "../hooks/use-responses";
import type { TopicResponseDTO as TopicResponseType } from "../types";

interface SummaryModalProps {
	readonly sessionId: string;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
}

interface TopicResponseItemProps {
	readonly topicId: string;
	readonly response: TopicResponseType;
}

function renderFieldValue(value: unknown): React.ReactNode {
	if (value === null || value === undefined) {
		return null;
	}

	// Arrays: comma-separated
	if (Array.isArray(value)) {
		if (value.length === 0) return null;
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

function TopicResponseItem({ topicId, response }: TopicResponseItemProps) {
	if (!response) {
		return null;
	}

	const title = QUESTION_TITLES[topicId] || topicId;
	const summary =
		"summary" in response.data ? (response.data.summary as string) : null;
	const quotes =
		"quotes" in response.data ? (response.data.quotes as string[]) : null;

	const otherFields = response.data
		? Object.entries(response.data).filter(
				([key]) => key !== "summary" && key !== "quotes",
			)
		: [];

	return (
		<div className="group">
			<div className="mb-4 flex items-baseline gap-3">
				{/* Brutalist marker: solid square with border */}
				<div className="mt-1 h-4 w-4 shrink-0 border-2 border-foreground bg-primary" />
				<h3 className="font-black font-heading text-foreground text-xl">
					{title}
				</h3>
			</div>

			<div className="ml-2 space-y-6 pb-2 pl-6">
				{/* Summary section */}
				{summary && (
					<div className="prose prose-sm max-w-none font-medium text-foreground leading-relaxed">
						<p>{summary}</p>
					</div>
				)}

				{/* Dynamic Fields Section */}
				{otherFields.length > 0 && (
					<div className="grid gap-x-12 gap-y-4 pt-2 sm:grid-cols-2">
						{otherFields.map(([key, value]) => {
							const rendered = renderFieldValue(value);
							if (!rendered) return null;
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
					<div className="relative pt-4">
						<h4 className="mb-3 flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-wide">
							<QuoteIcon className="h-3 w-3" />
							Opmerkelijke citaten
						</h4>
						<ul className="space-y-3">
							{quotes.map((quote, index) => (
								<li
									// biome-ignore lint/suspicious/noArrayIndexKey: quotes are static strings without unique IDs
									key={`${topicId}-quote-${index}`}
									className="flex gap-3 border-primary border-l-4 pl-3 text-foreground text-sm italic"
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

export function SummaryModal({
	sessionId,
	open,
	onOpenChange,
}: SummaryModalProps) {
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
					<DialogTitle className="font-black font-heading text-2xl text-primary">
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
												<TopicResponseItem
													topicId={topicId}
													response={response}
												/>
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
