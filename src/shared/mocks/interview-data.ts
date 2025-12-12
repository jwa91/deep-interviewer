// ═══════════════════════════════════════════════════════════════
// MOCK INTERVIEW DATA
// Used by backend mock service for testing/demo mode
// ═══════════════════════════════════════════════════════════════

export const MOCK_RESPONSES = {
  ai_background: {
    topic: "ai_background",
    data: {
      summary:
        "De deelnemer heeft beperkte ervaring met AI, voornamelijk via ChatGPT voor brainstormen.",
      quotes: ["Ik gebruik het soms om ideeën op te doen", "Nog niet zakelijk ingezet"],
      userType: "casual",
      experienceLevel: 2,
      goalClarity: 3,
      toolsUsed: ["ChatGPT"],
      useCaseSubjects: ["productivity", "creative"],
      expectations: "Praktische handvatten om LLMs slimmer te gebruiken in mijn werk.",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  overall_impression: {
    topic: "overall_impression",
    data: {
      summary: "Positieve indruk, vooral de praktische voorbeelden werden gewaardeerd.",
      quotes: ["Leuk om te zien wat er mogelijk is", "Smaakt naar meer"],
      overallRating: 4,
      wouldRecommend: true,
      confidenceLift: 4,
      sentiment: "positive",
      whyValue: "Praktische voorbeelden maakten het direct toepasbaar.",
      bestPart: "De demo’s en concrete voorbeelden.",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  difficulty: {
    topic: "difficulty",
    data: {
      summary: "Niveau was goed te volgen, tempo soms wat hoog.",
      quotes: ["Kon het goed bijbenen", "Soms ging het wel snel door de slides"],
      difficultyRating: 3,
      difficultyLevel: "just_right",
      paceRating: 4,
      cognitiveLoad: 4,
      tooFastMoments: ["Door de slides met veel nieuwe termen"],
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  content_quality: {
    topic: "content_quality",
    data: {
      summary: "Inhoudelijk sterk, miste wel wat diepgang op technische aspecten.",
      quotes: ["Goede basis", "Had wel meer de diepte in gemogen over hoe het werkt"],
      qualityRating: 4,
      relevanceRating: 5,
      depthRating: 2,
      mostUsefulTopics: ["Prompting basics", "Praktische use-cases"],
      missingTopics: ["Meer technische uitleg over RAG / embeddings"],
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  presentation: {
    topic: "presentation",
    data: {
      summary: "Enthousiaste presentatie, duidelijke structuur.",
      quotes: ["Fijne energie", "Duidelijk verhaal"],
      presentationRating: 5,
      engagementRating: 5,
      structureRating: 5,
      clarityRating: 4,
      unclearTopics: ["RAG"],
      whatHelpedClarity: "Veel concrete voorbeelden en een duidelijke opbouw.",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  suggestions: {
    topic: "suggestions",
    data: {
      summary: "Meer hands-on oefeningen toevoegen.",
      quotes: ["Zou fijn zijn om zelf mee te klikken"],
      suggestions: ["Meer oefentijd", "Handout vooraf"],
      topSuggestion: "Meer interactie",
      improvementPriority: 5,
      formatPreference: "more_practice",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
};
