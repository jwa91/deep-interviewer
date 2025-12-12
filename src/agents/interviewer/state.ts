import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { z } from "zod";
import {
  CollectedResponsesSchema,
  QUESTION_IDS,
  QuestionCompletionSchema,
} from "../../shared/schema/index.js";

// ═══════════════════════════════════════════════════════════════
// INTERVIEW AGENT STATE
// Combines LangGraph messages with interview progress tracking
// ═══════════════════════════════════════════════════════════════

/**
 * The full state schema for the interview agent.
 * Messages use LangGraph's MessagesZodMeta for proper reducer behavior
 * (appends new messages rather than replacing).
 */
export const InterviewStateSchema = z.object({
  // Core LangGraph message history with proper reducer
  // biome-ignore lint/suspicious/noExplicitAny: LangGraph MessagesZodMeta type mismatch with Zod v4
  messages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta as any),

  // Interview session ID (thread_id equivalent)
  sessionId: z.string().uuid(),

  // Interview timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),

  // Question tracking - which questions are answered
  questionsCompleted: QuestionCompletionSchema,

  // Collected response data from question tools
  responses: CollectedResponsesSchema,

  // Whether the interview is complete (all questions answered)
  isComplete: z.boolean().default(false),
});

export type InterviewState = z.infer<typeof InterviewStateSchema>;

// ═══════════════════════════════════════════════════════════════
// STATE FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Creates initial state for a new interview session
 */
export function createInitialState(sessionId: string): InterviewState {
  return {
    messages: [],
    sessionId,
    startedAt: new Date().toISOString(),
    questionsCompleted: Object.fromEntries(
      QUESTION_IDS.map((id) => [id, false])
    ) as InterviewState["questionsCompleted"],
    responses: {},
    isComplete: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// STATE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Counts completed questions from state
 */
export function getCompletedCount(state: InterviewState): number {
  return Object.values(state.questionsCompleted).filter(Boolean).length;
}

/**
 * Checks if interview should be marked complete
 */
export function shouldMarkComplete(state: InterviewState): boolean {
  const completedCount = getCompletedCount(state);
  return completedCount === QUESTION_IDS.length;
}

/**
 * Gets remaining questions
 */
export function getRemainingQuestionIds(
  state: InterviewState
): (keyof InterviewState["questionsCompleted"])[] {
  return (
    Object.entries(state.questionsCompleted) as [
      keyof InterviewState["questionsCompleted"],
      boolean,
    ][]
  )
    .filter(([, completed]) => !completed)
    .map(([id]) => id);
}
