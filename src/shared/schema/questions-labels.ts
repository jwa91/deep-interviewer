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
	toolsUsed: "Gebruikte Tools",
	useCaseSubjects: "Gebruiksdoelen",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 2: Algemene Indruk
	// ───────────────────────────────────────────────────────────────
	overallRating: "Algemene Beoordeling",
	sentiment: "Sentiment",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 3: Waarover ging de training?
	// ───────────────────────────────────────────────────────────────
	mainTopicsIdentified: "Identificeerde Onderwerpen",
	alignsWithIntent: "Komt overeen met doel",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 4: Moeilijkheidsgraad
	// ───────────────────────────────────────────────────────────────
	difficultyRating: "Moeilijkheidsgraad",
	difficultyLevel: "Niveau",
	paceRating: "Tempo",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 5: Inhoudelijke Kwaliteit
	// ───────────────────────────────────────────────────────────────
	qualityRating: "Kwaliteit",
	relevanceRating: "Relevantie",
	depthRating: "Diepgang",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 6: Presentatie
	// ───────────────────────────────────────────────────────────────
	presentationRating: "Presentatie",
	engagementRating: "Betrokkenheid",
	structureRating: "Structuur",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 7: Duidelijkheid
	// ───────────────────────────────────────────────────────────────
	clarityRating: "Duidelijkheid",
	unclearTopics: "Onduidelijke Onderwerpen",
	needsExplanation: "Uitleg Nodig",
	explanationTopic: "Te Verklaren Onderwerp",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 8: Suggesties
	// ───────────────────────────────────────────────────────────────
	suggestions: "Suggesties",
	topSuggestion: "Top Suggestie",
	wouldRecommend: "Zou Aanraden",

	// ───────────────────────────────────────────────────────────────
	// QUESTION 9: Twee Onderdelen Vergelijking
	// ───────────────────────────────────────────────────────────────
	preferredPart: "Voorkeur Onderdeel",
	theoryPartRating: "Theorie Score",
	practicalPartRating: "Praktijk Score",
	balanceOpinion: "Balans Mening",
};
