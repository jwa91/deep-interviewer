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
      userType: "novice",
      experienceLevel: 2,
      toolsUsed: ["ChatGPT"],
      useCaseSubjects: ["brainstorming"],
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
      sentiment: "positive",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  perceived_content: {
    topic: "perceived_content",
    data: {
      summary: "Deelnemer zag focus op prompting technieken en ethische aspecten.",
      quotes: ["Ging vooral over hoe je vragen stelt", "Ook de risico's kwamen aan bod"],
      mainTopicsIdentified: ["prompting", "ethics", "models"],
      alignsWithIntent: true,
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
      difficultyLevel: "balanced",
      paceRating: 4,
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
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  clarity: {
    topic: "clarity",
    data: {
      summary: "Over het algemeen duidelijk, RAG-concept bleef wat vaag.",
      quotes: ["Dat stuk over RAG snapte ik niet helemaal"],
      clarityRating: 4,
      unclearTopics: ["RAG"],
      needsExplanation: true,
      explanationTopic: "Retrieval Augmented Generation",
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
      wouldRecommend: true,
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
  course_parts: {
    topic: "course_parts",
    data: {
      summary: "Voorkeur voor het praktische gedeelte.",
      quotes: ["Theorie was nuttig maar praktijk leuker"],
      preferredPart: "practical",
      theoryPartRating: 3,
      practicalPartRating: 5,
      balanceOpinion: "Mag meer praktijk in",
    },
    timestamp: new Date().toISOString(),
    source: "agent" as const,
  },
};
