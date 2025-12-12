import { type StructuredToolInterface, tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  QUESTION_IDS,
  type QuestionId,
  RecordAiBackgroundSchema,
  RecordContentQualitySchema,
  RecordDifficultySchema,
  RecordOverallImpressionSchema,
  RecordPresentationSchema,
  RecordSuggestionsSchema,
} from "../../shared/schema/index.js";
import { type ToolCallback, createQuestionTool } from "./tool-factory.js";

// ═══════════════════════════════════════════════════════════════
// QUESTION TOOLS
// Each tool corresponds to one interview question
// All tool configuration (name, description, schema) is defined here.
// ═══════════════════════════════════════════════════════════════

/**
 * Creates all 6 question tools with the given callback.
 * The callback is called whenever a tool records data.
 */
export function createQuestionTools(onRecord: ToolCallback<unknown>): StructuredToolInterface[] {
  return [
    // Question 1: AI Background
    createQuestionTool(
      {
        questionId: "ai_background",
        name: "record_ai_background",
        description: `Leg AI-achtergrond + verwachting vast. Ervaring/tools mag je infereren (bv. "programmer" → professional). Maar vraag WEL naar verwachtingen/doel als dat niet gezegd is.`,
        schema: RecordAiBackgroundSchema,
      },
      onRecord
    ),

    // Question 2: Overall Value
    createQuestionTool(
      {
        questionId: "overall_impression",
        name: "record_overall_impression",
        description: `Leg algemene waarde vast. "Super interessant" of "zou ik aanraden" is genoeg. Infereer ratings uit toon.`,
        schema: RecordOverallImpressionSchema,
      },
      onRecord
    ),

    // Question 3: Pace & Difficulty
    createQuestionTool(
      {
        questionId: "difficulty",
        name: "record_difficulty",
        description: `Leg tempo/moeilijkheid vast. "Ging snel" of "was pittig" is genoeg om te infereren.`,
        schema: RecordDifficultySchema,
      },
      onRecord
    ),

    // Question 4: Content & Relevance
    createQuestionTool(
      {
        questionId: "content_quality",
        name: "record_content_quality",
        description: `Leg inhoud/relevantie vast. "Inhoud was top" of "sloot goed aan" is genoeg.`,
        schema: RecordContentQualitySchema,
      },
      onRecord
    ),

    // Question 5: Delivery (Presentation + Clarity)
    createQuestionTool(
      {
        questionId: "presentation",
        name: "record_presentation",
        description: `Leg presentatie/uitleg vast. "Enthousiast maar geen geboren presentator" is genoeg.`,
        schema: RecordPresentationSchema,
      },
      onRecord
    ),

    // Question 6: Improvements
    createQuestionTool(
      {
        questionId: "suggestions",
        name: "record_suggestions",
        description: "Leg verbeterpunten vast. Eén concreet punt is genoeg.",
        schema: RecordSuggestionsSchema,
      },
      onRecord
    ),

    // Workshop Slides Tool
    tool(
      () => {
        return "Slides link provided to user. You can now continue with the interview.";
      },
      {
        name: "provide_workshop_slides",
        description: "Provide the link to the workshop slides when the user asks for them.",
        schema: z.object({
          confirm: z.boolean().describe("Confirm that you want to provide the slides"),
        }),
      }
    ),
  ];
}

// ═══════════════════════════════════════════════════════════════
// TOOL NAMES - Derived from QUESTION_IDS (single source of truth)
// ═══════════════════════════════════════════════════════════════

export const QUESTION_TOOL_NAMES = QUESTION_IDS.map((id) => `record_${id}` as const);

export type QuestionToolName = `record_${QuestionId}`;

/**
 * Maps tool name to question ID
 */
export function toolNameToQuestionId(toolName: QuestionToolName): QuestionId {
  return toolName.replace("record_", "") as QuestionId;
}

/**
 * Maps question ID to tool name
 */
export function questionIdToToolName(questionId: QuestionId): QuestionToolName {
  return `record_${questionId}` as QuestionToolName;
}
