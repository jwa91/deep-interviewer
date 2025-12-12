// ═══════════════════════════════════════════════════════════════
// SHARED CONSTANTS
// Used by both frontend and backend
// ═══════════════════════════════════════════════════════════════

/**
 * The welcome message shown to users and stored in LangGraph state.
 * Keep this in sync - it's shown on frontend AND stored as AIMessage on backend.
 */
export const WELCOME_MESSAGE = `Hoi! 👋 Leuk dat je meedoet!

Ik ben de AI-assistent van JW en verzamel feedback over de AI-training. We hebben een kort gesprek van ~5 minuten over je ervaringen.

Twee dingen vooraf:
- Voel je vrij om mij feedback te geven. Zit je op hete kolen en moet ik meer vaart maken? Vertel het me! Trek ik juist te snel conclusies, laat dat ook weten.
- Als ik iets noteer dat niet klopt, corrigeer me gerust - dan pas ik het direct aan.

Laten we direct beginnen: allereerst ben ik wel benieuwd hoe ervaren je al was met AI voor je deze training in ging.

Kun je me daar iets over vertellen?`;

/**
 * Display titles for each question/topic.
 */
export const QUESTION_TITLES: Record<string, string> = {
  ai_background: "AI Achtergrond",
  overall_impression: "Algemene Waarde",
  difficulty: "Tempo & Moeilijkheid",
  content_quality: "Inhoud & Relevantie",
  presentation: "Uitleg & Presentatie",
  suggestions: "Verbeterpunten",
};
