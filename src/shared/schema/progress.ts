import { z } from "zod";
import {
  QUESTION_IDS,
  type QuestionId,
  type RecordAiBackground,
  type RecordClarity,
  type RecordContentQuality,
  type RecordCourseParts,
  type RecordDifficulty,
  type RecordOverallImpression,
  type RecordPerceivedContent,
  type RecordPresentation,
  type RecordSuggestions,
} from "./questions";

// ═══════════════════════════════════════════════════════════════
// QUESTION COMPLETION STATUS
// ═══════════════════════════════════════════════════════════════

export const QuestionCompletionSchema = z.object({
  ai_background: z.boolean().default(false),
  overall_impression: z.boolean().default(false),
  perceived_content: z.boolean().default(false),
  difficulty: z.boolean().default(false),
  content_quality: z.boolean().default(false),
  presentation: z.boolean().default(false),
  clarity: z.boolean().default(false),
  suggestions: z.boolean().default(false),
  course_parts: z.boolean().default(false),
});

export type QuestionCompletion = z.infer<typeof QuestionCompletionSchema>;

// ═══════════════════════════════════════════════════════════════
// COLLECTED RESPONSES - All question data once filled
// ═══════════════════════════════════════════════════════════════

export const CollectedResponsesSchema = z.object({
  ai_background: z.custom<RecordAiBackground>().optional(),
  overall_impression: z.custom<RecordOverallImpression>().optional(),
  perceived_content: z.custom<RecordPerceivedContent>().optional(),
  difficulty: z.custom<RecordDifficulty>().optional(),
  content_quality: z.custom<RecordContentQuality>().optional(),
  presentation: z.custom<RecordPresentation>().optional(),
  clarity: z.custom<RecordClarity>().optional(),
  suggestions: z.custom<RecordSuggestions>().optional(),
  course_parts: z.custom<RecordCourseParts>().optional(),
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
  topic: z.enum([
    "ai_background",
    "overall_impression",
    "perceived_content",
    "difficulty",
    "content_quality",
    "presentation",
    "clarity",
    "suggestions",
    "course_parts",
  ]),
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
  completedTopics: z.array(
    z.enum([
      "ai_background",
      "overall_impression",
      "perceived_content",
      "difficulty",
      "content_quality",
      "presentation",
      "clarity",
      "suggestions",
      "course_parts",
    ])
  ),
  totalTopics: z.literal(9),
});

export type InterviewResponsesDTO = z.infer<typeof InterviewResponsesDTOSchema>;

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a new empty interview progress object
 */
export function createEmptyProgress(sessionId: string): InterviewProgress {
  return {
    sessionId,
    startedAt: new Date().toISOString(),
    questionsCompleted: {
      ai_background: false,
      overall_impression: false,
      perceived_content: false,
      difficulty: false,
      content_quality: false,
      presentation: false,
      clarity: false,
      suggestions: false,
      course_parts: false,
    },
    responses: {},
  };
}

/**
 * Counts how many questions are completed
 */
export function countCompletedQuestions(completion: QuestionCompletion): number {
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
export function getRemainingQuestions(completion: QuestionCompletion): QuestionId[] {
  return QUESTION_IDS.filter((id) => !completion[id as keyof QuestionCompletion]) as QuestionId[];
}

/**
 * Gets list of completed questions
 */
export function getCompletedQuestions(completion: QuestionCompletion): QuestionId[] {
  return QUESTION_IDS.filter((id) => completion[id as keyof QuestionCompletion]) as QuestionId[];
}
