// ═══════════════════════════════════════════════════════════════
// SHARED CONSTANTS
// Used by both frontend and backend
// ═══════════════════════════════════════════════════════════════

/**
 * The welcome message shown to users and stored in LangGraph state.
 * Keep this in sync - it's shown on frontend AND stored as AIMessage on backend.
 */
export const WELCOME_MESSAGE = `Welkom, fijn dat je meedoet.

Ik ben de AI-assistent van JW en verzamel feedback over de AI-training. We hebben een **kort gesprek van ongeveer 5 minuten** over je ervaringen.

Twee dingen vooraf: geef gerust aan als ik te snel of te langzaam ga. En als ik iets noteer dat niet klopt, corrigeer me — dan pas ik het direct aan.

Laten we beginnen: **hoeveel ervaring had je al met AI voordat je aan deze training begon?**`;

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
