import { describe, expect, it } from "vitest";
import {
  QUESTION_IDS,
  RecordAiBackgroundSchema,
  RecordContentQualitySchema,
  RecordDifficultySchema,
  RecordOverallImpressionSchema,
  RecordPresentationSchema,
  RecordSuggestionsSchema,
  TOTAL_QUESTIONS,
} from "./questions";

describe("RecordAiBackgroundSchema", () => {
  it("accepts valid AI background data", () => {
    const data = {
      userType: "casual",
      experienceLevel: 2,
      goalClarity: 3,
      toolsUsed: ["ChatGPT", "Copilot"],
      useCaseSubjects: ["productivity", "coding"],
      expectations: "Meer praktische handvatten om dit toe te passen.",
      summary: "Deelnemer gebruikte vooral ChatGPT voor emails",
      quotes: ["Ik gebruik het vooral voor samenvattingen"],
    };
    const result = RecordAiBackgroundSchema.parse(data);
    expect(result.userType).toBe("casual");
    expect(result.toolsUsed).toHaveLength(2);
  });

  it("rejects invalid user type", () => {
    const data = {
      userType: "expert", // invalid
      experienceLevel: 3,
      toolsUsed: [],
      useCaseSubjects: [],
      summary: "Test",
    };
    expect(() => RecordAiBackgroundSchema.parse(data)).toThrow();
  });
});

describe("RecordOverallImpressionSchema", () => {
  it("accepts valid overall impression", () => {
    const data = {
      overallRating: 4,
      wouldRecommend: true,
      confidenceLift: 4,
      sentiment: "positive",
      whyValue: "Veel concrete voorbeelden.",
      bestPart: "De demo’s.",
      summary: "Zeer tevreden over de training",
    };
    const result = RecordOverallImpressionSchema.parse(data);
    expect(result.overallRating).toBe(4);
    expect(result.sentiment).toBe("positive");
  });
});

describe("RecordDifficultySchema", () => {
  it("accepts valid difficulty feedback", () => {
    const data = {
      difficultyRating: 3,
      difficultyLevel: "just_right",
      paceRating: 3,
      cognitiveLoad: 3,
      summary: "Tempo was prima",
    };
    const result = RecordDifficultySchema.parse(data);
    expect(result.difficultyLevel).toBe("just_right");
  });
});

describe("RecordContentQualitySchema", () => {
  it("accepts valid content quality feedback", () => {
    const data = {
      qualityRating: 5,
      relevanceRating: 4,
      depthRating: 3,
      mostUsefulTopics: ["Prompting", "Use-cases"],
      summary: "Zeer relevante inhoud",
    };
    const result = RecordContentQualitySchema.parse(data);
    expect(result.qualityRating).toBe(5);
  });
});

describe("RecordPresentationSchema", () => {
  it("accepts valid presentation feedback", () => {
    const data = {
      presentationRating: 4,
      engagementRating: 5,
      structureRating: 4,
      clarityRating: 4,
      summary: "Boeiende presentatie",
    };
    const result = RecordPresentationSchema.parse(data);
    expect(result.engagementRating).toBe(5);
  });
});

describe("RecordSuggestionsSchema", () => {
  it("accepts valid suggestions", () => {
    const data = {
      suggestions: ["Meer hands-on oefeningen", "Langere pauzes"],
      topSuggestion: "Meer hands-on oefeningen",
      improvementPriority: 5,
      formatPreference: "more_practice",
      summary: "Deelnemer zou training aanraden",
    };
    const result = RecordSuggestionsSchema.parse(data);
    expect(result.improvementPriority).toBe(5);
    expect(result.suggestions).toHaveLength(2);
  });
});

describe("Question IDs", () => {
  it("has exactly 6 questions", () => {
    expect(TOTAL_QUESTIONS).toBe(6);
  });

  it("includes all expected question IDs", () => {
    expect(QUESTION_IDS).toContain("ai_background");
    expect(QUESTION_IDS).toContain("overall_impression");
    expect(QUESTION_IDS).toContain("difficulty");
    expect(QUESTION_IDS).toContain("content_quality");
    expect(QUESTION_IDS).toContain("presentation");
    expect(QUESTION_IDS).toContain("suggestions");
  });
});
