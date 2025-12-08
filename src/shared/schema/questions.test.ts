import { describe, expect, it } from "vitest";
import {
  QUESTION_IDS,
  RecordAiBackgroundSchema,
  RecordClaritySchema,
  RecordContentQualitySchema,
  RecordCoursePartsSchema,
  RecordDifficultySchema,
  RecordOverallImpressionSchema,
  RecordPerceivedContentSchema,
  RecordPresentationSchema,
  RecordSuggestionsSchema,
  TOTAL_QUESTIONS,
} from "./questions";

describe("RecordAiBackgroundSchema", () => {
  it("accepts valid AI background data", () => {
    const data = {
      userType: "casual",
      experienceLevel: 2,
      toolsUsed: ["ChatGPT", "Copilot"],
      useCaseSubjects: ["productivity", "coding"],
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
      sentiment: "positive",
      summary: "Zeer tevreden over de training",
    };
    const result = RecordOverallImpressionSchema.parse(data);
    expect(result.overallRating).toBe(4);
    expect(result.sentiment).toBe("positive");
  });
});

describe("RecordPerceivedContentSchema", () => {
  it("accepts valid perceived content", () => {
    const data = {
      mainTopicsIdentified: ["LLM basics", "Prompt engineering"],
      alignsWithIntent: true,
      summary: "Goed overzicht van AI mogelijkheden",
    };
    const result = RecordPerceivedContentSchema.parse(data);
    expect(result.mainTopicsIdentified).toHaveLength(2);
    expect(result.alignsWithIntent).toBe(true);
  });
});

describe("RecordDifficultySchema", () => {
  it("accepts valid difficulty feedback", () => {
    const data = {
      difficultyRating: 3,
      difficultyLevel: "just_right",
      paceRating: 3,
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
      summary: "Boeiende presentatie",
    };
    const result = RecordPresentationSchema.parse(data);
    expect(result.engagementRating).toBe(5);
  });
});

describe("RecordClaritySchema", () => {
  it("accepts valid clarity feedback with explanation needed", () => {
    const data = {
      clarityRating: 3,
      unclearTopics: ["Fine-tuning", "RAG"],
      needsExplanation: true,
      explanationTopic: "Fine-tuning",
      summary: "Sommige onderwerpen waren complex",
    };
    const result = RecordClaritySchema.parse(data);
    expect(result.needsExplanation).toBe(true);
    expect(result.explanationTopic).toBe("Fine-tuning");
  });

  it("accepts clarity feedback without explanation needed", () => {
    const data = {
      clarityRating: 5,
      needsExplanation: false,
      summary: "Alles was duidelijk",
    };
    const result = RecordClaritySchema.parse(data);
    expect(result.needsExplanation).toBe(false);
    expect(result.unclearTopics).toBeUndefined();
  });
});

describe("RecordSuggestionsSchema", () => {
  it("accepts valid suggestions", () => {
    const data = {
      suggestions: ["Meer hands-on oefeningen", "Langere pauzes"],
      topSuggestion: "Meer hands-on oefeningen",
      wouldRecommend: true,
      summary: "Deelnemer zou training aanraden",
    };
    const result = RecordSuggestionsSchema.parse(data);
    expect(result.wouldRecommend).toBe(true);
    expect(result.suggestions).toHaveLength(2);
  });
});

describe("RecordCoursePartsSchema", () => {
  it("accepts valid course parts feedback", () => {
    const data = {
      preferredPart: "practical",
      theoryPartRating: 4,
      practicalPartRating: 5,
      balanceOpinion: "Goede mix, maar praktijk was meest waardevol",
      summary: "Praktische deel was het nuttigst",
    };
    const result = RecordCoursePartsSchema.parse(data);
    expect(result.preferredPart).toBe("practical");
  });

  it("accepts both_equal preference", () => {
    const data = {
      preferredPart: "both_equal",
      theoryPartRating: 4,
      practicalPartRating: 4,
      summary: "Beide delen waren even waardevol",
    };
    const result = RecordCoursePartsSchema.parse(data);
    expect(result.preferredPart).toBe("both_equal");
  });
});

describe("Question IDs", () => {
  it("has exactly 9 questions", () => {
    expect(TOTAL_QUESTIONS).toBe(9);
  });

  it("includes all expected question IDs", () => {
    expect(QUESTION_IDS).toContain("ai_background");
    expect(QUESTION_IDS).toContain("overall_impression");
    expect(QUESTION_IDS).toContain("perceived_content");
    expect(QUESTION_IDS).toContain("difficulty");
    expect(QUESTION_IDS).toContain("content_quality");
    expect(QUESTION_IDS).toContain("presentation");
    expect(QUESTION_IDS).toContain("clarity");
    expect(QUESTION_IDS).toContain("suggestions");
    expect(QUESTION_IDS).toContain("course_parts");
  });
});
