import { describe, expect, it } from "vitest";
import {
  DifficultyLevelSchema,
  FormatPreferenceSchema,
  QualitativeCaptureSchema,
  RatingSchema,
  SentimentSchema,
  UseCaseSubjectSchema,
  UserTypeSchema,
} from "./base";

describe("RatingSchema", () => {
  it("accepts valid ratings 1-5", () => {
    expect(RatingSchema.parse(1)).toBe(1);
    expect(RatingSchema.parse(3)).toBe(3);
    expect(RatingSchema.parse(5)).toBe(5);
  });

  it("rejects ratings outside 1-5", () => {
    expect(() => RatingSchema.parse(0)).toThrow();
    expect(() => RatingSchema.parse(6)).toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => RatingSchema.parse(3.5)).toThrow();
  });
});

describe("QualitativeCaptureSchema", () => {
  it("accepts valid capture with summary only", () => {
    const result = QualitativeCaptureSchema.parse({
      summary: "Test summary",
    });
    expect(result.summary).toBe("Test summary");
    expect(result.quotes).toBeUndefined();
  });

  it("accepts valid capture with summary and quotes", () => {
    const result = QualitativeCaptureSchema.parse({
      summary: "Test summary",
      quotes: ["Quote 1", "Quote 2"],
    });
    expect(result.summary).toBe("Test summary");
    expect(result.quotes).toEqual(["Quote 1", "Quote 2"]);
  });

  it("rejects missing summary", () => {
    expect(() => QualitativeCaptureSchema.parse({})).toThrow();
  });
});

describe("SentimentSchema", () => {
  it("accepts valid sentiments", () => {
    expect(SentimentSchema.parse("positive")).toBe("positive");
    expect(SentimentSchema.parse("neutral")).toBe("neutral");
    expect(SentimentSchema.parse("negative")).toBe("negative");
    expect(SentimentSchema.parse("mixed")).toBe("mixed");
  });

  it("rejects invalid sentiments", () => {
    expect(() => SentimentSchema.parse("happy")).toThrow();
  });
});

describe("UserTypeSchema", () => {
  it("accepts all valid user types", () => {
    const types = ["beginner", "casual", "regular", "power_user", "professional"];
    for (const type of types) {
      expect(UserTypeSchema.parse(type)).toBe(type);
    }
  });
});

describe("UseCaseSubjectSchema", () => {
  it("accepts all valid use case subjects", () => {
    const subjects = [
      "productivity",
      "creative",
      "coding",
      "research",
      "education",
      "business",
      "other",
    ];
    for (const subject of subjects) {
      expect(UseCaseSubjectSchema.parse(subject)).toBe(subject);
    }
  });
});

describe("DifficultyLevelSchema", () => {
  it("accepts all valid difficulty levels", () => {
    const levels = [
      "too_easy",
      "slightly_easy",
      "just_right",
      "slightly_difficult",
      "too_difficult",
    ];
    for (const level of levels) {
      expect(DifficultyLevelSchema.parse(level)).toBe(level);
    }
  });
});

describe("FormatPreferenceSchema", () => {
  it("accepts all valid preferences", () => {
    const prefs = [
      "more_practice",
      "more_theory",
      "better_examples",
      "slower_pace",
      "more_time_for_questions",
      "other",
    ];
    for (const pref of prefs) {
      expect(FormatPreferenceSchema.parse(pref)).toBe(pref);
    }
  });
});
