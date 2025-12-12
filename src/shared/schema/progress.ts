import { z } from "zod";
import {
	QUESTION_IDS,
	QuestionId,
	type QuestionId as QuestionIdType,
	type RecordAiBackground,
	type RecordContentQuality,
	type RecordDifficulty,
	type RecordOverallImpression,
	type RecordPresentation,
	type RecordSuggestions,
} from "./questions.js";

// ═══════════════════════════════════════════════════════════════
// QUESTION COMPLETION STATUS
// ═══════════════════════════════════════════════════════════════

export const QuestionCompletionSchema = z.object({
	ai_background: z.boolean().default(false),
	overall_impression: z.boolean().default(false),
	difficulty: z.boolean().default(false),
	content_quality: z.boolean().default(false),
	presentation: z.boolean().default(false),
	suggestions: z.boolean().default(false),
});

export type QuestionCompletion = z.infer<typeof QuestionCompletionSchema>;

// ═══════════════════════════════════════════════════════════════
// PROGRESS STATE - API/UI progress representation
// ═══════════════════════════════════════════════════════════════

export const ProgressStateSchema = z.object({
	questionsCompleted: QuestionCompletionSchema,
	completedCount: z.number().int().min(0).max(6),
	totalQuestions: z.literal(6),
	isComplete: z.boolean(),
});

export type ProgressState = z.infer<typeof ProgressStateSchema>;

// ═══════════════════════════════════════════════════════════════
// COLLECTED RESPONSES - All question data once filled
// ═══════════════════════════════════════════════════════════════

export const CollectedResponsesSchema = z.object({
	ai_background: z.custom<RecordAiBackground>().optional(),
	overall_impression: z.custom<RecordOverallImpression>().optional(),
	difficulty: z.custom<RecordDifficulty>().optional(),
	content_quality: z.custom<RecordContentQuality>().optional(),
	presentation: z.custom<RecordPresentation>().optional(),
	suggestions: z.custom<RecordSuggestions>().optional(),
});

export type CollectedResponses = z.infer<typeof CollectedResponsesSchema>;

// ═══════════════════════════════════════════════════════════════
// INTERVIEW PROGRESS - Full progress state
// ═══════════════════════════════════════════════════════════════

export const InterviewProgressSchema = z.object({
	sessionId: z.string().uuid(),
	startedAt: z.string().datetime(),
	completedAt: z.string().datetime().optional(),
	questionsCompleted: QuestionCompletionSchema,
	responses: CollectedResponsesSchema,
});

export type InterviewProgress = z.infer<typeof InterviewProgressSchema>;

// ═══════════════════════════════════════════════════════════════
// RESPONSE API TYPES - For viewing/editing recorded responses
// ═══════════════════════════════════════════════════════════════

export const ResponseSourceSchema = z.enum(["agent", "user_edit"]);
export type ResponseSource = z.infer<typeof ResponseSourceSchema>;

/**
 * Single topic response with metadata for the API
 */
export const TopicResponseSchema = z.object({
	topic: QuestionId,
	data: z.record(z.string(), z.unknown()),
	timestamp: z.string().datetime(),
	source: ResponseSourceSchema,
});

export type TopicResponse = z.infer<typeof TopicResponseSchema>;

/**
 * Full interview responses DTO for the API
 */
export const InterviewResponsesDTOSchema = z.object({
	sessionId: z.string().uuid(),
	responses: z.record(z.string(), TopicResponseSchema),
	completedTopics: z.array(QuestionId),
	totalTopics: z.literal(6),
});

export type InterviewResponsesDTO = z.infer<typeof InterviewResponsesDTOSchema>;

// ═══════════════════════════════════════════════════════════════
// TOOL HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Converts a tool name (e.g., "record_ai_background") to QuestionId (e.g., "ai_background")
 */
export function toolNameToQuestionId(toolName: string): QuestionIdType | null {
	const prefix = "record_";
	if (!toolName.startsWith(prefix)) {
		return null;
	}
	const questionId = toolName.slice(prefix.length);
	if (QUESTION_IDS.includes(questionId as QuestionIdType)) {
		return questionId as QuestionIdType;
	}
	return null;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates an empty QuestionCompletion object with all questions set to false.
 * Derived from QUESTION_IDS to ensure consistency.
 */
export function createEmptyQuestionCompletion(): QuestionCompletion {
	return Object.fromEntries(
		QUESTION_IDS.map((id) => [id, false]),
	) as QuestionCompletion;
}

/**
 * Creates a new empty interview progress object
 */
export function createEmptyProgress(sessionId: string): InterviewProgress {
	return {
		sessionId,
		startedAt: new Date().toISOString(),
		questionsCompleted: createEmptyQuestionCompletion(),
		responses: {},
	};
}

/**
 * Counts how many questions are completed
 */
export function countCompletedQuestions(
	completion: QuestionCompletion,
): number {
	return Object.values(completion).filter(Boolean).length;
}

/**
 * Checks if all questions are completed
 */
export function isInterviewComplete(completion: QuestionCompletion): boolean {
	return countCompletedQuestions(completion) === QUESTION_IDS.length;
}

/**
 * Gets list of remaining questions
 */
export function getRemainingQuestions(
	completion: QuestionCompletion,
): QuestionIdType[] {
	return QUESTION_IDS.filter(
		(id) => !completion[id as keyof QuestionCompletion],
	) as QuestionIdType[];
}

/**
 * Gets list of completed questions
 */
export function getCompletedQuestions(
	completion: QuestionCompletion,
): QuestionIdType[] {
	return QUESTION_IDS.filter(
		(id) => completion[id as keyof QuestionCompletion],
	) as QuestionIdType[];
}
