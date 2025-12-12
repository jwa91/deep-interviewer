// ═══════════════════════════════════════════════════════════════
// FIELD LABELS - Dutch display labels for question schema fields
// Organized to mirror questions.ts structure
// ═══════════════════════════════════════════════════════════════

export const FIELD_LABELS: Record<string, string> = {
  // ───────────────────────────────────────────────────────────────
  // QUESTION 1: AI Achtergrond
  // ───────────────────────────────────────────────────────────────
  userType: "Gebruikerstype",
  experienceLevel: "Ervaringsniveau",
  goalClarity: "Doel Duidelijkheid",
  toolsUsed: "Gebruikte Tools",
  useCaseSubjects: "Gebruiksdoelen",
  expectations: "Verwachtingen",

  // ───────────────────────────────────────────────────────────────
  // QUESTION 2: Algemene Waarde
  // ───────────────────────────────────────────────────────────────
  overallRating: "Algemene Beoordeling",
  wouldRecommend: "Zou Aanraden",
  confidenceLift: "Zelfvertrouwen Toename",
  sentiment: "Sentiment",
  whyValue: "Waarom (uitleg)",
  bestPart: "Beste Onderdeel",

  // ───────────────────────────────────────────────────────────────
  // QUESTION 3: Tempo & Moeilijkheid
  // ───────────────────────────────────────────────────────────────
  difficultyRating: "Moeilijkheidsgraad",
  difficultyLevel: "Niveau",
  paceRating: "Tempo",
  cognitiveLoad: "Cognitieve Belasting",
  tooFastMoments: "Te Snel Momenten",

  // ───────────────────────────────────────────────────────────────
  // QUESTION 4: Inhoud & Relevantie
  // ───────────────────────────────────────────────────────────────
  qualityRating: "Kwaliteit",
  relevanceRating: "Relevantie",
  depthRating: "Diepgang",
  mostUsefulTopics: "Meest Bruikbare Onderwerpen",
  missingTopics: "Gemiste Onderwerpen",

  // ───────────────────────────────────────────────────────────────
  // QUESTION 5: Uitleg & Presentatie
  // ───────────────────────────────────────────────────────────────
  presentationRating: "Presentatie",
  engagementRating: "Betrokkenheid",
  structureRating: "Structuur",
  clarityRating: "Duidelijkheid",
  unclearTopics: "Onduidelijke Onderwerpen",
  whatHelpedClarity: "Wat Hielp Met Duidelijkheid",

  // ───────────────────────────────────────────────────────────────
  // QUESTION 6: Verbeterpunten
  // ───────────────────────────────────────────────────────────────
  suggestions: "Suggesties",
  topSuggestion: "Top Suggestie",
  improvementPriority: "Prioriteit (verbeterpunt)",
  formatPreference: "Voorkeur Type Verbetering",
};
