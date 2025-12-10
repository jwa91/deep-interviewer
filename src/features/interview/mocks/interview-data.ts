import { WELCOME_MESSAGE } from "@/shared/constants";
import type { Message, ProgressState } from "../types";

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

export const MOCK_MESSAGES: Message[] = [
  {
    id: "msg_1",
    role: "assistant",
    content: WELCOME_MESSAGE,
    timestamp: new Date(Date.now() - 1000000),
  },
  {
    id: "msg_2",
    role: "user",
    content:
      "Hoi, is goed. Ik had er nog niet zoveel ervaring mee, alleen wat gespeeld met ChatGPT.",
    timestamp: new Date(Date.now() - 900000),
  },
  {
    id: "msg_3",
    role: "assistant",
    content: "Helder. En waar gebruikte je ChatGPT dan voornamelijk voor?",
    toolCalls: [
      {
        name: "record_ai_background",
        args: {
          userType: "novice",
          experienceLevel: 2,
          toolsUsed: ["ChatGPT"],
          useCaseSubjects: ["brainstorming"],
          summary: "Deelnemer heeft beperkte ervaring, voornamelijk ChatGPT.",
          quotes: ["Alleen wat gespeeld met ChatGPT"],
        },
        id: "call_1",
      },
    ],
    timestamp: new Date(Date.now() - 800000),
  },
  {
    id: "msg_4",
    role: "user",
    content: "Vooral voor het brainstormen over nieuwe ideeën voor marketing teksten.",
    timestamp: new Date(Date.now() - 700000),
  },
  {
    id: "msg_5",
    role: "assistant",
    content: "Duidelijk! Wat was je algemene indruk van de training vandaag?",
    toolCalls: [
      {
        name: "record_overall_impression",
        args: {
          overallRating: 4,
          sentiment: "positive",
          summary: "Positieve indruk",
          quotes: [],
        },
        id: "call_2",
      },
    ],
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "msg_6",
    role: "user",
    content: "Ik vond het erg leerzaam en leuk gebracht.",
    timestamp: new Date(Date.now() - 500000),
  },
];

export const MOCK_PROGRESS: ProgressState = {
  questionsCompleted: {
    ai_background: true,
    overall_impression: true,
    perceived_content: true,
    difficulty: true,
    content_quality: true,
    presentation: true,
    clarity: true,
    suggestions: true,
    course_parts: true,
  },
  completedCount: 9,
  totalQuestions: 9,
  isComplete: true,
};
