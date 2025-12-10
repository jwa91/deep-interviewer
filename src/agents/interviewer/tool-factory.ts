import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import type { QuestionId } from "../../shared/schema/index.js";

// ═══════════════════════════════════════════════════════════════
// TOOL FACTORY TYPES
// ═══════════════════════════════════════════════════════════════

export interface QuestionToolConfig<T extends z.ZodType> {
  /** Question identifier */
  questionId: QuestionId;
  /** Tool name (will be prefixed with record_) */
  name: string;
  /** Description shown to the LLM */
  description: string;
  /** Zod schema for tool input */
  schema: T;
}

export type ToolCallback<T> = (questionId: QuestionId, data: T) => Promise<void>;

// ═══════════════════════════════════════════════════════════════
// TOOL FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a LangChain tool from a question configuration.
 * The tool will call the provided callback with the question ID and validated data.
 */
export function createQuestionTool<T extends z.ZodType>(
  config: QuestionToolConfig<T>,
  onRecord: ToolCallback<z.infer<T>>
) {
  return tool(
    async (input: z.infer<T>) => {
      // Call the storage callback
      await onRecord(config.questionId, input);

      // Return confirmation message
      return `✓ Feedback voor "${config.questionId}" vastgelegd.`;
    },
    {
      name: config.name,
      description: config.description,
      schema: config.schema,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// TOOL DESCRIPTIONS (Dutch)
// ═══════════════════════════════════════════════════════════════

export const TOOL_DESCRIPTIONS = {
  ai_background: `Leg de AI-achtergrond van de deelnemer vast.
Roep deze tool aan zodra je genoeg weet over:
- Welke AI tools de deelnemer al gebruikte (ChatGPT, Copilot, etc.)
- Waarvoor ze AI gebruikten (productiviteit, creatief, coding, etc.)
- Hun algemene ervaringsniveau met AI`,

  overall_impression: `Leg de algemene indruk van de training vast.
Roep deze tool aan zodra de deelnemer heeft aangegeven wat ze van de training vonden.
Vraag door als het antwoord vaag is ("het was goed" -> "wat maakte het goed?")`,

  perceived_content: `Leg vast wat de deelnemer denkt dat de training inhield.
Dit helpt te begrijpen of de leerdoelen duidelijk waren.
Vraag: "Waar ging de training volgens jou met name over?"`,

  difficulty: `Leg feedback over moeilijkheidsgraad en tempo vast.
Roep aan zodra je weet:
- Of het niveau goed was (te makkelijk, goed, te moeilijk)
- Of het tempo goed was (te langzaam, goed, te snel)`,

  content_quality: `Leg feedback over inhoudelijke kwaliteit vast.
Vraag naar:
- Algemene kwaliteit van de inhoud
- Relevantie voor het werk van de deelnemer
- Of de diepgang goed was`,

  presentation: `Leg feedback over de presentatie vast.
Vraag naar:
- Kwaliteit van de presentatie
- Of het boeiend was
- Of de structuur duidelijk was`,

  clarity: `Leg feedback over duidelijkheid vast.
Vraag of alles duidelijk was uitgelegd.
Als iets onduidelijk was, noteer welke onderwerpen.
Vraag of de deelnemer wil dat iets opnieuw wordt uitgelegd.`,

  suggestions: `Leg verbeterpunten en suggesties vast.
Vraag wat beter zou kunnen.
Vraag ook of de deelnemer de training zou aanraden aan anderen.`,

  course_parts: `Leg feedback over de twee delen van de cursus vast.
De cursus had twee delen:
1. Theorie: hoe LLMs werken
2. Praktijk: hoe je LLMs gebruikt
Vraag welk deel de deelnemer nuttiger/leuker vond en waarom.`,
} as const;
