/**
 * Test Factory Functions
 *
 * Provides reusable builders for test data. Each factory has a `build` method
 * that accepts optional overrides to customize the generated data.
 *
 * Usage:
 *   const session = sessionFactory.build();
 *   const completedSession = sessionFactory.build({ isComplete: true });
 */

import type {
  Message,
  ProgressState,
  QuestionCompletion,
  QuestionId,
} from "@/features/interview/types";
import type { Invite } from "@/server/invites";
import type { InterviewSession } from "@/server/persistence";

// ═══════════════════════════════════════════════════════════════
// SESSION FACTORY
// ═══════════════════════════════════════════════════════════════

export const sessionFactory = {
  build: (overrides: Partial<InterviewSession> = {}): InterviewSession => ({
    id: `session-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    isComplete: false,
    ...overrides,
  }),

  /** Build a session with a specific ID */
  withId: (id: string, overrides: Partial<InterviewSession> = {}) =>
    sessionFactory.build({ id, ...overrides }),

  /** Build a completed session */
  completed: (overrides: Partial<InterviewSession> = {}) =>
    sessionFactory.build({ isComplete: true, ...overrides }),
};

// ═══════════════════════════════════════════════════════════════
// INVITE FACTORY
// ═══════════════════════════════════════════════════════════════

export const inviteFactory = {
  build: (overrides: Partial<Invite> = {}): Invite => ({
    code: `INV${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    createdAt: "2024-01-15T10:00:00.000Z",
    ...overrides,
  }),

  /** Build an invite with a specific code */
  withCode: (code: string, overrides: Partial<Invite> = {}) =>
    inviteFactory.build({ code, ...overrides }),

  /** Build an invite linked to a session */
  linked: (sessionId: string, overrides: Partial<Invite> = {}) =>
    inviteFactory.build({ sessionId, ...overrides }),
};

// ═══════════════════════════════════════════════════════════════
// MESSAGE FACTORY
// ═══════════════════════════════════════════════════════════════

export const messageFactory = {
  build: (overrides: Partial<Message> = {}): Message => ({
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    role: "user",
    content: "Test message content",
    timestamp: new Date("2024-01-15T10:00:00.000Z"),
    ...overrides,
  }),

  /** Build a user message */
  user: (content: string, overrides: Partial<Message> = {}) =>
    messageFactory.build({ role: "user", content, ...overrides }),

  /** Build an assistant message */
  assistant: (content: string, overrides: Partial<Message> = {}) =>
    messageFactory.build({ role: "assistant", content, ...overrides }),

  /** Build a streaming assistant message */
  streaming: (content: string, overrides: Partial<Message> = {}) =>
    messageFactory.build({
      role: "assistant",
      content,
      isStreaming: true,
      ...overrides,
    }),
};

// ═══════════════════════════════════════════════════════════════
// QUESTIONS COMPLETED FACTORY
// ═══════════════════════════════════════════════════════════════

const DEFAULT_QUESTIONS_COMPLETED: QuestionCompletion = {
  ai_background: false,
  overall_impression: false,
  perceived_content: false,
  difficulty: false,
  content_quality: false,
  presentation: false,
  clarity: false,
  suggestions: false,
  course_parts: false,
};

export const questionsCompletedFactory = {
  build: (overrides: Partial<QuestionCompletion> = {}): QuestionCompletion => ({
    ...DEFAULT_QUESTIONS_COMPLETED,
    ...overrides,
  }),

  /** Build with all questions completed */
  allCompleted: (): QuestionCompletion => ({
    ai_background: true,
    overall_impression: true,
    perceived_content: true,
    difficulty: true,
    content_quality: true,
    presentation: true,
    clarity: true,
    suggestions: true,
    course_parts: true,
  }),

  /** Build with specific questions completed */
  withCompleted: (...questionIds: QuestionId[]): QuestionCompletion => {
    const completed = { ...DEFAULT_QUESTIONS_COMPLETED };
    for (const id of questionIds) {
      completed[id] = true;
    }
    return completed;
  },
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS STATE FACTORY
// ═══════════════════════════════════════════════════════════════

export const progressFactory = {
  build: (overrides: Partial<ProgressState> = {}): ProgressState => {
    const questionsCompleted = overrides.questionsCompleted ?? questionsCompletedFactory.build();
    const completedCount =
      overrides.completedCount ?? Object.values(questionsCompleted).filter(Boolean).length;

    return {
      questionsCompleted,
      completedCount,
      totalQuestions: 9,
      isComplete: completedCount >= 9,
      ...overrides,
    };
  },

  /** Build an empty progress state */
  empty: (): ProgressState =>
    progressFactory.build({
      questionsCompleted: questionsCompletedFactory.build(),
      completedCount: 0,
      isComplete: false,
    }),

  /** Build a completed progress state */
  completed: (): ProgressState =>
    progressFactory.build({
      questionsCompleted: questionsCompletedFactory.allCompleted(),
      completedCount: 9,
      isComplete: true,
    }),

  /** Build progress with specific questions completed */
  withCompleted: (...questionIds: QuestionId[]): ProgressState => {
    const questionsCompleted = questionsCompletedFactory.withCompleted(...questionIds);
    return progressFactory.build({
      questionsCompleted,
      completedCount: questionIds.length,
      isComplete: questionIds.length >= 9,
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// AGENT STATE FACTORY (for mocking agent.getState() responses)
// ═══════════════════════════════════════════════════════════════

export interface AgentStateValues {
  sessionId: string;
  startedAt: string;
  questionsCompleted: QuestionCompletion;
  responses: Record<string, Record<string, unknown>>;
  messages: unknown[];
  isComplete: boolean;
}

export interface AgentState {
  values: AgentStateValues;
}

export const agentStateFactory = {
  build: (overrides: Partial<AgentStateValues> = {}): AgentState => ({
    values: {
      sessionId: `session-${crypto.randomUUID().slice(0, 8)}`,
      startedAt: "2024-01-15T10:00:00.000Z",
      questionsCompleted: questionsCompletedFactory.build(),
      responses: {},
      messages: [],
      isComplete: false,
      ...overrides,
    },
  }),

  /** Build state with specific responses */
  withResponses: (
    responses: Record<string, Record<string, unknown>>,
    overrides: Partial<AgentStateValues> = {}
  ): AgentState => {
    const questionIds = Object.keys(responses) as QuestionId[];
    return agentStateFactory.build({
      responses,
      questionsCompleted: questionsCompletedFactory.withCompleted(...questionIds),
      ...overrides,
    });
  },

  /** Build state with messages */
  withMessages: (messages: unknown[], overrides: Partial<AgentStateValues> = {}): AgentState =>
    agentStateFactory.build({
      messages,
      ...overrides,
    }),
};
