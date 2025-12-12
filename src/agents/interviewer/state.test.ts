import { describe, expect, it } from "vitest";
import {
  InterviewStateSchema,
  createInitialState,
  getCompletedCount,
  getRemainingQuestionIds,
  shouldMarkComplete,
} from "./state";

describe("InterviewStateSchema", () => {
  it("validates initial state", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    const result = InterviewStateSchema.parse(state);
    expect(result.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});

describe("createInitialState", () => {
  it("creates state with given session ID", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    expect(state.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("initializes with empty messages", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    expect(state.messages).toHaveLength(0);
  });

  it("initializes all questions as not completed", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    expect(getCompletedCount(state)).toBe(0);
  });

  it("sets startedAt to current time", () => {
    const before = new Date().toISOString();
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    const after = new Date().toISOString();
    expect(state.startedAt >= before).toBe(true);
    expect(state.startedAt <= after).toBe(true);
  });

  it("initializes isComplete as false", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    expect(state.isComplete).toBe(false);
  });
});

describe("getCompletedCount", () => {
  it("returns 0 for new state", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    expect(getCompletedCount(state)).toBe(0);
  });

  it("counts completed questions", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    state.questionsCompleted.ai_background = true;
    state.questionsCompleted.difficulty = true;
    expect(getCompletedCount(state)).toBe(2);
  });
});

describe("shouldMarkComplete", () => {
  it("returns false when not all questions completed", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    state.questionsCompleted.ai_background = true;
    expect(shouldMarkComplete(state)).toBe(false);
  });

  it("returns true when all 6 questions completed", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    state.questionsCompleted = {
      ai_background: true,
      overall_impression: true,
      difficulty: true,
      content_quality: true,
      presentation: true,
      suggestions: true,
    };
    expect(shouldMarkComplete(state)).toBe(true);
  });
});

describe("getRemainingQuestionIds", () => {
  it("returns all 6 question IDs for new state", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    const remaining = getRemainingQuestionIds(state);
    expect(remaining).toHaveLength(6);
  });

  it("excludes completed questions", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    state.questionsCompleted.ai_background = true;
    state.questionsCompleted.difficulty = true;

    const remaining = getRemainingQuestionIds(state);
    expect(remaining).toHaveLength(4);
    expect(remaining).not.toContain("ai_background");
    expect(remaining).not.toContain("difficulty");
    expect(remaining).toContain("overall_impression");
  });

  it("returns empty array when all completed", () => {
    const state = createInitialState("550e8400-e29b-41d4-a716-446655440000");
    state.questionsCompleted = {
      ai_background: true,
      overall_impression: true,
      difficulty: true,
      content_quality: true,
      presentation: true,
      suggestions: true,
    };
    expect(getRemainingQuestionIds(state)).toHaveLength(0);
  });
});
