// ═══════════════════════════════════════════════════════════════
// SHARED CONSTANTS
// Used by both frontend and backend
// ═══════════════════════════════════════════════════════════════

/**
 * The welcome message shown to users and stored in LangGraph state.
 * Keep this in sync - it's shown on frontend AND stored as AIMessage on backend.
 */
export const WELCOME_MESSAGE = `Hoi! 👋 Leuk dat je meedoet!

Ik ben de AI-assistent van JW en ik help hem feedback te verzamelen over de AI-training die je hebt gevolgd.

**Hoe werkt dit interview?**
- We hebben een informeel gesprek over je ervaringen
- Ik stel vragen over verschillende onderdelen van de training
- Voordat ik iets vastleg, check ik even of ik het goed begrepen heb
- Je kunt op elk moment pauzeren en later verder gaan

Het gesprek duurt ongeveer 10-15 minuten, afhankelijk van hoeveel je wilt delen.

Laten we beginnen! Kun je me eerst vertellen: had je al ervaring met AI-tools zoals ChatGPT vóórdat je deze training volgde?`;

/**
 * Display titles for each question/topic.
 */
export const QUESTION_TITLES: Record<string, string> = {
  ai_background: "AI Achtergrond",
  overall_impression: "Algemene Indruk",
  perceived_content: "Waarover ging de training?",
  difficulty: "Moeilijkheidsgraad",
  content_quality: "Inhoudelijke Kwaliteit",
  presentation: "Presentatie",
  clarity: "Duidelijkheid",
  suggestions: "Suggesties",
  course_parts: "Cursus Onderdelen",
};

/**
 * URL for the workshop slides.
 */
export const WORKSHOP_SLIDES_URL = "https://link.excalidraw.com/p/readonly/dKWLQmAK049howtnYdZ0";
