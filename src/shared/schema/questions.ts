import { z } from "zod";
import {
  DifficultyLevelSchema,
  FormatPreferenceSchema,
  QualitativeCaptureSchema,
  RatingSchema,
  SentimentSchema,
  UseCaseSubjectSchema,
  UserTypeSchema,
} from "./base.js";

// ═══════════════════════════════════════════════════════════════
// QUESTION 1: AI Achtergrond
// "Vertel kort iets over je AI gebruik voor je de training in ging"
// ═══════════════════════════════════════════════════════════════

export const RecordAiBackgroundSchema = QualitativeCaptureSchema.extend({
  userType: UserTypeSchema.describe("Geschatte gebruikerstype op basis van gesprek"),
  experienceLevel: RatingSchema.describe("1=geen ervaring, 5=zeer ervaren"),
  goalClarity: RatingSchema.describe(
    "1=geen duidelijk doel, 5=heel duidelijk wat ik eruit wilde halen"
  ),
  toolsUsed: z
    .array(z.string())
    .describe("Welke AI tools gebruikte deelnemer al? (ChatGPT, Copilot, etc)"),
  useCaseSubjects: z
    .array(UseCaseSubjectSchema)
    .describe("Voor welke doeleinden gebruikte deelnemer AI?"),
  expectations: z.string().describe("Wat hoopte de deelnemer uit de workshop te halen?"),
});

export type RecordAiBackground = z.infer<typeof RecordAiBackgroundSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 2: Overall Value (Algemene Waarde)
// North-star metric: waarde + aanbeveling + confidence lift
// ═══════════════════════════════════════════════════════════════

export const RecordOverallImpressionSchema = QualitativeCaptureSchema.extend({
  overallRating: RatingSchema.describe("1=lage waarde, 5=zeer waardevol"),
  wouldRecommend: z.boolean().describe("Zou deelnemer de workshop aanraden?"),
  confidenceLift: RatingSchema.describe(
    "1=geen verschil, 5=veel meer vertrouwen om dit toe te passen"
  ),
  sentiment: SentimentSchema.describe("Algemene toon van de feedback"),
  whyValue: z.string().describe("Waarom deze score?"),
  bestPart: z.string().describe("Wat was het beste/meest waardevolle onderdeel?"),
});

export type RecordOverallImpression = z.infer<typeof RecordOverallImpressionSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 3: Pace & Difficulty (Tempo + moeilijkheid + cognitive load)
// ═══════════════════════════════════════════════════════════════

export const RecordDifficultySchema = QualitativeCaptureSchema.extend({
  difficultyRating: RatingSchema.describe(
    "1=veel te makkelijk, 3=precies goed, 5=veel te moeilijk"
  ),
  difficultyLevel: DifficultyLevelSchema.describe("Categorisatie moeilijkheidsgraad"),
  paceRating: RatingSchema.describe("1=veel te langzaam, 3=precies goed, 5=veel te snel"),
  cognitiveLoad: RatingSchema.describe(
    "1=heel ontspannen, 5=heel intens/veel tegelijk (cognitieve belasting)"
  ),
  tooFastMoments: z
    .array(z.string())
    .optional()
    .describe("Momenten/onderdelen waar het tempo te hoog voelde"),
});

export type RecordDifficulty = z.infer<typeof RecordDifficultySchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 4: Content & Relevance (inhoud + relevantie + diepgang)
// ═══════════════════════════════════════════════════════════════

export const RecordContentQualitySchema = QualitativeCaptureSchema.extend({
  qualityRating: RatingSchema.describe("1=zeer slecht, 5=uitstekend"),
  relevanceRating: RatingSchema.describe("1=niet relevant, 5=zeer relevant voor mijn werk"),
  depthRating: RatingSchema.describe("1=te oppervlakkig, 3=precies goed, 5=te diepgaand"),
  mostUsefulTopics: z
    .array(z.string())
    .describe("Welke onderwerpen/onderdelen waren het meest bruikbaar?"),
  missingTopics: z.array(z.string()).optional().describe("Welke onderwerpen miste de deelnemer?"),
});

export type RecordContentQuality = z.infer<typeof RecordContentQualitySchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 5: Delivery (presentation + clarity combined)
// ═══════════════════════════════════════════════════════════════

export const RecordPresentationSchema = QualitativeCaptureSchema.extend({
  presentationRating: RatingSchema.describe("1=zeer slecht, 5=uitstekend"),
  engagementRating: RatingSchema.describe("1=saai, 5=zeer boeiend"),
  structureRating: RatingSchema.describe("1=rommelig, 5=zeer gestructureerd"),
  clarityRating: RatingSchema.describe("1=zeer onduidelijk, 5=glashelder"),
  unclearTopics: z
    .array(z.string())
    .optional()
    .describe("Specifieke onderwerpen die onduidelijk waren"),
  whatHelpedClarity: z
    .string()
    .optional()
    .describe("Wat hielp juist om het helder te maken? (voorbeelden, structuur, etc.)"),
});

export type RecordPresentation = z.infer<typeof RecordPresentationSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION 6: Improvements (actionable improvements)
// ═══════════════════════════════════════════════════════════════

export const RecordSuggestionsSchema = QualitativeCaptureSchema.extend({
  suggestions: z.array(z.string()).describe("Alle genoemde suggesties"),
  topSuggestion: z.string().optional().describe("Belangrijkste suggestie volgens deelnemer"),
  improvementPriority: RatingSchema.describe(
    "1=kleine nice-to-have, 5=heel belangrijk / grootste winst"
  ),
  formatPreference: FormatPreferenceSchema.describe("Welke soort verbetering heeft de voorkeur?"),
});

export type RecordSuggestions = z.infer<typeof RecordSuggestionsSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTION IDENTIFIERS - Used for tracking completion
// ═══════════════════════════════════════════════════════════════

export const QuestionId = z.enum([
  "ai_background",
  "overall_impression",
  "difficulty",
  "content_quality",
  "presentation",
  "suggestions",
]);

export type QuestionId = z.infer<typeof QuestionId>;

export const QUESTION_IDS = QuestionId.options;
export const TOTAL_QUESTIONS = QUESTION_IDS.length;
