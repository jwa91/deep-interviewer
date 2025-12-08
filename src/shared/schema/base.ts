import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// RATING SCALE - Standard 1-5 rating used across questions
// ═══════════════════════════════════════════════════════════════

export const RatingSchema = z.number().int().min(1).max(5);
export type Rating = z.infer<typeof RatingSchema>;

// ═══════════════════════════════════════════════════════════════
// QUALITATIVE CAPTURE - Summary and quotes for every question
// ═══════════════════════════════════════════════════════════════

export const QualitativeCaptureSchema = z.object({
  summary: z.string().describe("Korte samenvatting van wat de deelnemer zei"),
  quotes: z.array(z.string()).optional().describe("Opvallende citaten van de deelnemer"),
});
export type QualitativeCapture = z.infer<typeof QualitativeCaptureSchema>;

// ═══════════════════════════════════════════════════════════════
// SENTIMENT - General sentiment classification
// ═══════════════════════════════════════════════════════════════

export const SentimentSchema = z.enum(["positive", "neutral", "negative", "mixed"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

// ═══════════════════════════════════════════════════════════════
// USER TYPE - Classification of participant's AI experience level
// ═══════════════════════════════════════════════════════════════

export const UserTypeSchema = z.enum([
  "beginner", // Nauwelijks/geen AI ervaring
  "casual", // Af en toe ChatGPT oid
  "regular", // Regelmatig gebruik, meerdere tools
  "power_user", // Dagelijks, diverse usecases
  "professional", // Bouwt met AI / integreert in werk
]);
export type UserType = z.infer<typeof UserTypeSchema>;

// ═══════════════════════════════════════════════════════════════
// USE CASE SUBJECTS - What participants use AI for
// ═══════════════════════════════════════════════════════════════

export const UseCaseSubjectSchema = z.enum([
  "productivity", // Emails, samenvattingen, tekst
  "creative", // Afbeeldingen, content creatie
  "coding", // Programmeren, debugging
  "research", // Onderzoek, informatie zoeken
  "education", // Leren, uitleg krijgen
  "business", // Rapportages, analyses
  "other",
]);
export type UseCaseSubject = z.infer<typeof UseCaseSubjectSchema>;

// ═══════════════════════════════════════════════════════════════
// DIFFICULTY LEVEL - How participants perceived difficulty
// ═══════════════════════════════════════════════════════════════

export const DifficultyLevelSchema = z.enum([
  "too_easy",
  "slightly_easy",
  "just_right",
  "slightly_difficult",
  "too_difficult",
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

// ═══════════════════════════════════════════════════════════════
// COURSE PART PREFERENCE - Which part of course was preferred
// ═══════════════════════════════════════════════════════════════

export const CoursePartPreferenceSchema = z.enum([
  "theory", // Hoe LLMs werken
  "practical", // Gebruik van LLMs
  "both_equal", // Geen voorkeur
]);
export type CoursePartPreference = z.infer<typeof CoursePartPreferenceSchema>;
