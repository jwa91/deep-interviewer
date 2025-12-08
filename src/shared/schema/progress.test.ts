import { describe, expect, it } from "vitest";
import {
	QuestionCompletionSchema,
	InterviewProgressSchema,
	createEmptyProgress,
	countCompletedQuestions,
	isInterviewComplete,
	getRemainingQuestions,
	getCompletedQuestions,
} from "./progress";
import { TOTAL_QUESTIONS } from "./questions";

describe("QuestionCompletionSchema", () => {
	it("defaults all questions to false", () => {
		const completion = QuestionCompletionSchema.parse({});
		expect(completion.ai_background).toBe(false);
		expect(completion.overall_impression).toBe(false);
		expect(completion.perceived_content).toBe(false);
		expect(completion.difficulty).toBe(false);
		expect(completion.content_quality).toBe(false);
		expect(completion.presentation).toBe(false);
		expect(completion.clarity).toBe(false);
		expect(completion.suggestions).toBe(false);
		expect(completion.course_parts).toBe(false);
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
		const progress = createEmptyProgress(
			"550e8400-e29b-41d4-a716-446655440000",
		);
		expect(progress.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
	});

	it("initializes all questions as not completed", () => {
		const progress = createEmptyProgress(
			"550e8400-e29b-41d4-a716-446655440000",
		);
		expect(countCompletedQuestions(progress.questionsCompleted)).toBe(0);
	});

	it("sets startedAt to current time", () => {
		const before = new Date().toISOString();
		const progress = createEmptyProgress(
			"550e8400-e29b-41d4-a716-446655440000",
		);
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
			clarity: true,
		});
		expect(countCompletedQuestions(completion)).toBe(3);
	});

	it("returns total for all completed", () => {
		const completion = QuestionCompletionSchema.parse({
			ai_background: true,
			overall_impression: true,
			perceived_content: true,
			difficulty: true,
			content_quality: true,
			presentation: true,
			clarity: true,
			suggestions: true,
			course_parts: true,
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
			perceived_content: true,
			difficulty: true,
			content_quality: true,
			presentation: true,
			clarity: true,
			suggestions: true,
			course_parts: true,
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

