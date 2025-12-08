import { z } from "zod";
import {
  CoursePartPreferenceSchema,
  DifficultyLevelSchema,
  QualitativeCaptureSchema,
  RatingSchema,
  SentimentSchema,
  UseCaseSubjectSchema,
  UserTypeSchema,
} from "./base";

// ═══════════════════════════════════════════════════════════════
// QUESTION 1: AI Achtergrond
// "Vertel kort iets over je AI gebruik voor je de training in ging"
// ═══════════════════════════════════════════════════════════════

export const RecordAiBackgroundSchema = z
  .object({
    userType: UserTypeSchema.describe("Geschatte gebruikerstype op basis van gesprek"),
    experienceLevel: RatingSchema.describe("1=geen ervaring, 5=zeer ervaren"),
    toolsUsed: z
      .array(z.string())
      .describe("Welke AI tools gebruikte deelnemer al? (ChatGPT, Copilot, etc)"),
    useCaseSubjects: z
      .array(UseCaseSubjectSchema)
      .describe("Voor welke doeleinden gebruikte deelnemer AI?"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordAiBackground = z.infer<typeof RecordAiBackgroundSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 2: Algemene Indruk
// "Korte samenvatting wat je van de training vond"
// ═══════════════════════════════════════════════════════════════

export const RecordOverallImpressionSchema = z
  .object({
    overallRating: RatingSchema.describe("1=zeer negatief, 5=zeer positief"),
    sentiment: SentimentSchema.describe("Algemene toon van de feedback"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordOverallImpression = z.infer<typeof RecordOverallImpressionSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 3: Waarover ging de training?
// "Korte samenvatting waar de training volgens jou met name over ging"
// ═══════════════════════════════════════════════════════════════

export const RecordPerceivedContentSchema = z
  .object({
    mainTopicsIdentified: z.array(z.string()).describe("Hoofdonderwerpen die deelnemer noemt"),
    alignsWithIntent: z.boolean().describe("Komt overeen met bedoelde leerdoelen?"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordPerceivedContent = z.infer<typeof RecordPerceivedContentSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 4: Moeilijkheidsgraad
// ═══════════════════════════════════════════════════════════════

export const RecordDifficultySchema = z
  .object({
    difficultyRating: RatingSchema.describe(
      "1=veel te makkelijk, 3=precies goed, 5=veel te moeilijk"
    ),
    difficultyLevel: DifficultyLevelSchema.describe("Categorisatie moeilijkheidsgraad"),
    paceRating: RatingSchema.describe("1=veel te langzaam, 3=precies goed, 5=veel te snel"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordDifficulty = z.infer<typeof RecordDifficultySchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 5: Inhoudelijke Kwaliteit
// ═══════════════════════════════════════════════════════════════

export const RecordContentQualitySchema = z
  .object({
    qualityRating: RatingSchema.describe("1=zeer slecht, 5=uitstekend"),
    relevanceRating: RatingSchema.describe("1=niet relevant, 5=zeer relevant voor mijn werk"),
    depthRating: RatingSchema.describe("1=te oppervlakkig, 3=precies goed, 5=te diepgaand"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordContentQuality = z.infer<typeof RecordContentQualitySchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 6: Presentatie
// ═══════════════════════════════════════════════════════════════

export const RecordPresentationSchema = z
  .object({
    presentationRating: RatingSchema.describe("1=zeer slecht, 5=uitstekend"),
    engagementRating: RatingSchema.describe("1=saai, 5=zeer boeiend"),
    structureRating: RatingSchema.describe("1=rommelig, 5=zeer gestructureerd"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordPresentation = z.infer<typeof RecordPresentationSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 7: Duidelijkheid
// ═══════════════════════════════════════════════════════════════

export const RecordClaritySchema = z
  .object({
    clarityRating: RatingSchema.describe("1=zeer onduidelijk, 5=glashelder"),
    unclearTopics: z
      .array(z.string())
      .optional()
      .describe("Specifieke onderwerpen die onduidelijk waren"),
    needsExplanation: z.boolean().describe("Wil deelnemer dat iets opnieuw wordt uitgelegd?"),
    explanationTopic: z.string().optional().describe("Welk onderwerp moet uitgelegd worden?"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordClarity = z.infer<typeof RecordClaritySchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 8: Suggesties
// ═══════════════════════════════════════════════════════════════

export const RecordSuggestionsSchema = z
  .object({
    suggestions: z.array(z.string()).describe("Alle genoemde suggesties"),
    topSuggestion: z.string().optional().describe("Belangrijkste suggestie volgens deelnemer"),
    wouldRecommend: z.boolean().describe("Zou deelnemer de training aanraden?"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordSuggestions = z.infer<typeof RecordSuggestionsSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 9: Twee Onderdelen Vergelijking
// "De cursus bestond uit 2 onderdelen: hoe LLMs werken + gebruik ervan"
// ═══════════════════════════════════════════════════════════════

export const RecordCoursePartsSchema = z
  .object({
    preferredPart: CoursePartPreferenceSchema.describe("Welk deel vond deelnemer leuker/nuttiger?"),
    theoryPartRating: RatingSchema.describe("1=niet nuttig, 5=zeer nuttig - het theoretische deel"),
    practicalPartRating: RatingSchema.describe(
      "1=niet nuttig, 5=zeer nuttig - het praktische deel"
    ),
    balanceOpinion: z.string().optional().describe("Mening over de balans tussen beide delen"),
  })
  .merge(QualitativeCaptureSchema);

export type RecordCourseParts = z.infer<typeof RecordCoursePartsSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION IDENTIFIERS - Used for tracking completion
// ═══════════════════════════════════════════════════════════════

export const QuestionId = z.enum([
  "ai_background",
  "overall_impression",
  "perceived_content",
  "difficulty",
  "content_quality",
  "presentation",
  "clarity",
  "suggestions",
  "course_parts",
]);

export type QuestionId = z.infer<typeof QuestionId>;

export const QUESTION_IDS = QuestionId.options;
export const TOTAL_QUESTIONS = QUESTION_IDS.length;
