import { describe, expect, it } from "vitest";
import {
  InterviewProgressSchema,
  InterviewResponsesDTOSchema,
  QuestionCompletionSchema,
  ResponseSourceSchema,
  TopicResponseSchema,
  countCompletedQuestions,
  createEmptyProgress,
  getCompletedQuestions,
  getRemainingQuestions,
  isInterviewComplete,
} from "./progress";
import { TOTAL_QUESTIONS } from "./questions";

describe("QuestionCompletionSchema", () => {
  it("defaults all questions to false", () => {
    const completion = QuestionCompletionSchema.parse({});
    expect(completion.ai_background).toBe(false);
    expect(completion.overall_impression).toBe(false);
    expect(completion.difficulty).toBe(false);
    expect(completion.content_quality).toBe(false);
    expect(completion.presentation).toBe(false);
    expect(completion.suggestions).toBe(false);
  });

  it("accepts partial completion", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      difficulty: true,
    });
    expect(completion.ai_background).toBe(true);
    expect(completion.difficulty).toBe(true);
    expect(completion.overall_impression).toBe(false);
  });
});

describe("InterviewProgressSchema", () => {
  it("accepts valid progress", () => {
    const progress = InterviewProgressSchema.parse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      startedAt: "2024-01-15T10:00:00.000Z",
      questionsCompleted: {},
      responses: {},
    });
    expect(progress.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(progress.completedAt).toBeUndefined();
  });

  it("accepts progress with completedAt", () => {
    const progress = InterviewProgressSchema.parse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      startedAt: "2024-01-15T10:00:00.000Z",
      completedAt: "2024-01-15T10:30:00.000Z",
      questionsCompleted: {},
      responses: {},
    });
    expect(progress.completedAt).toBe("2024-01-15T10:30:00.000Z");
  });
});

describe("createEmptyProgress", () => {
  it("creates progress with given session ID", () => {
    const progress = createEmptyProgress("550e8400-e29b-41d4-a716-446655440000");
    expect(progress.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("initializes all questions as not completed", () => {
    const progress = createEmptyProgress("550e8400-e29b-41d4-a716-446655440000");
    expect(countCompletedQuestions(progress.questionsCompleted)).toBe(0);
  });

  it("sets startedAt to current time", () => {
    const before = new Date().toISOString();
    const progress = createEmptyProgress("550e8400-e29b-41d4-a716-446655440000");
    const after = new Date().toISOString();
    expect(progress.startedAt >= before).toBe(true);
    expect(progress.startedAt <= after).toBe(true);
  });
});

describe("countCompletedQuestions", () => {
  it("returns 0 for no completions", () => {
    const completion = QuestionCompletionSchema.parse({});
    expect(countCompletedQuestions(completion)).toBe(0);
  });

  it("counts completed questions correctly", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      difficulty: true,
      presentation: true,
    });
    expect(countCompletedQuestions(completion)).toBe(3);
  });

  it("returns total for all completed", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      overall_impression: true,
      difficulty: true,
      content_quality: true,
      presentation: true,
      suggestions: true,
    });
    expect(countCompletedQuestions(completion)).toBe(TOTAL_QUESTIONS);
  });
});

describe("isInterviewComplete", () => {
  it("returns false for incomplete interview", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
    });
    expect(isInterviewComplete(completion)).toBe(false);
  });

  it("returns true when all questions completed", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      overall_impression: true,
      difficulty: true,
      content_quality: true,
      presentation: true,
      suggestions: true,
    });
    expect(isInterviewComplete(completion)).toBe(true);
  });
});

describe("getRemainingQuestions", () => {
  it("returns all questions when none completed", () => {
    const completion = QuestionCompletionSchema.parse({});
    const remaining = getRemainingQuestions(completion);
    expect(remaining).toHaveLength(TOTAL_QUESTIONS);
  });

  it("returns only uncompleted questions", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      difficulty: true,
    });
    const remaining = getRemainingQuestions(completion);
    expect(remaining).toHaveLength(TOTAL_QUESTIONS - 2);
    expect(remaining).not.toContain("ai_background");
    expect(remaining).not.toContain("difficulty");
    expect(remaining).toContain("overall_impression");
  });
});

describe("getCompletedQuestions", () => {
  it("returns empty array when none completed", () => {
    const completion = QuestionCompletionSchema.parse({});
    const completed = getCompletedQuestions(completion);
    expect(completed).toHaveLength(0);
  });

  it("returns only completed questions", () => {
    const completion = QuestionCompletionSchema.parse({
      ai_background: true,
      difficulty: true,
    });
    const completed = getCompletedQuestions(completion);
    expect(completed).toHaveLength(2);
    expect(completed).toContain("ai_background");
    expect(completed).toContain("difficulty");
  });
});

// ═══════════════════════════════════════════════════════════════
// RESPONSE API SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════

describe("ResponseSourceSchema", () => {
  it("accepts 'agent' as valid source", () => {
    const result = ResponseSourceSchema.parse("agent");
    expect(result).toBe("agent");
  });

  it("accepts 'user_edit' as valid source", () => {
    const result = ResponseSourceSchema.parse("user_edit");
    expect(result).toBe("user_edit");
  });

  it("rejects invalid source values", () => {
    expect(() => ResponseSourceSchema.parse("invalid")).toThrow();
    expect(() => ResponseSourceSchema.parse("system")).toThrow();
    expect(() => ResponseSourceSchema.parse("")).toThrow();
  });
});

describe("TopicResponseSchema", () => {
  it("accepts valid topic response", () => {
    const response = TopicResponseSchema.parse({
      topic: "ai_background",
      data: { experienceLevel: 3, summary: "test" },
      timestamp: "2024-01-15T10:00:00.000Z",
      source: "agent",
    });
    expect(response.topic).toBe("ai_background");
    expect(response.source).toBe("agent");
  });

  it("accepts all valid topic IDs", () => {
    const validTopics = [
      "ai_background",
      "overall_impression",
      "difficulty",
      "content_quality",
      "presentation",
      "suggestions",
    ];

    for (const topic of validTopics) {
      const response = TopicResponseSchema.parse({
        topic,
        data: {},
        timestamp: "2024-01-15T10:00:00.000Z",
        source: "agent",
      });
      expect(response.topic).toBe(topic);
    }
  });

  it("rejects invalid topic ID", () => {
    expect(() =>
      TopicResponseSchema.parse({
        topic: "invalid_topic",
        data: {},
        timestamp: "2024-01-15T10:00:00.000Z",
        source: "agent",
      })
    ).toThrow();
  });

  it("accepts user_edit source", () => {
    const response = TopicResponseSchema.parse({
      topic: "difficulty",
      data: { difficultyRating: 4 },
      timestamp: "2024-01-15T10:00:00.000Z",
      source: "user_edit",
    });
    expect(response.source).toBe("user_edit");
  });
});

describe("InterviewResponsesDTOSchema", () => {
  it("accepts valid responses DTO", () => {
    const dto = InterviewResponsesDTOSchema.parse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      responses: {
        ai_background: {
          topic: "ai_background",
          data: { experienceLevel: 3 },
          timestamp: "2024-01-15T10:00:00.000Z",
          source: "agent",
        },
      },
      completedTopics: ["ai_background"],
      totalTopics: 6,
    });
    expect(dto.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(dto.totalTopics).toBe(6);
  });

  it("accepts empty responses", () => {
    const dto = InterviewResponsesDTOSchema.parse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      responses: {},
      completedTopics: [],
      totalTopics: 6,
    });
    expect(Object.keys(dto.responses)).toHaveLength(0);
    expect(dto.completedTopics).toHaveLength(0);
  });

  it("accepts multiple responses", () => {
    const dto = InterviewResponsesDTOSchema.parse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      responses: {
        ai_background: {
          topic: "ai_background",
          data: { experienceLevel: 3 },
          timestamp: "2024-01-15T10:00:00.000Z",
          source: "agent",
        },
        difficulty: {
          topic: "difficulty",
          data: { difficultyRating: 2 },
          timestamp: "2024-01-15T10:05:00.000Z",
          source: "user_edit",
        },
      },
      completedTopics: ["ai_background", "difficulty"],
      totalTopics: 6,
    });
    expect(Object.keys(dto.responses)).toHaveLength(2);
    expect(dto.completedTopics).toHaveLength(2);
  });

  it("requires totalTopics to be exactly 6", () => {
    expect(() =>
      InterviewResponsesDTOSchema.parse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        responses: {},
        completedTopics: [],
        totalTopics: 10,
      })
    ).toThrow();
  });

  it("validates completedTopics are valid question IDs", () => {
    expect(() =>
      InterviewResponsesDTOSchema.parse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        responses: {},
        completedTopics: ["invalid_topic"],
        totalTopics: 6,
      })
    ).toThrow();
  });
});
