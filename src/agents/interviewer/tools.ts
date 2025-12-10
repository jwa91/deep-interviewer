import {
  type QuestionId,
  RecordAiBackgroundSchema,
  RecordClaritySchema,
  RecordContentQualitySchema,
  RecordCoursePartsSchema,
  RecordDifficultySchema,
  RecordOverallImpressionSchema,
  RecordPerceivedContentSchema,
  RecordPresentationSchema,
  RecordSuggestionsSchema,
} from "@/shared/schema";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";
import { TOOL_DESCRIPTIONS, type ToolCallback, createQuestionTool } from "./tool-factory";

// ═══════════════════════════════════════════════════════════════
// QUESTION TOOLS
// Each tool corresponds to one interview question
// ═══════════════════════════════════════════════════════════════

/**
 * Creates all 9 question tools with the given callback.
 * The callback is called whenever a tool records data.
 */
export function createQuestionTools(onRecord: ToolCallback<unknown>): StructuredToolInterface[] {
  return [
    // Question 1: AI Background
    createQuestionTool(
      {
        questionId: "ai_background",
        name: "record_ai_background",
        description: TOOL_DESCRIPTIONS.ai_background,
        schema: RecordAiBackgroundSchema,
      },
      onRecord
    ),

    // Question 2: Overall Impression
    createQuestionTool(
      {
        questionId: "overall_impression",
        name: "record_overall_impression",
        description: TOOL_DESCRIPTIONS.overall_impression,
        schema: RecordOverallImpressionSchema,
      },
      onRecord
    ),

    // Question 3: Perceived Content
    createQuestionTool(
      {
        questionId: "perceived_content",
        name: "record_perceived_content",
        description: TOOL_DESCRIPTIONS.perceived_content,
        schema: RecordPerceivedContentSchema,
      },
      onRecord
    ),

    // Question 4: Difficulty
    createQuestionTool(
      {
        questionId: "difficulty",
        name: "record_difficulty",
        description: TOOL_DESCRIPTIONS.difficulty,
        schema: RecordDifficultySchema,
      },
      onRecord
    ),

    // Question 5: Content Quality
    createQuestionTool(
      {
        questionId: "content_quality",
        name: "record_content_quality",
        description: TOOL_DESCRIPTIONS.content_quality,
        schema: RecordContentQualitySchema,
      },
      onRecord
    ),

    // Question 6: Presentation
    createQuestionTool(
      {
        questionId: "presentation",
        name: "record_presentation",
        description: TOOL_DESCRIPTIONS.presentation,
        schema: RecordPresentationSchema,
      },
      onRecord
    ),

    // Question 7: Clarity
    createQuestionTool(
      {
        questionId: "clarity",
        name: "record_clarity",
        description: TOOL_DESCRIPTIONS.clarity,
        schema: RecordClaritySchema,
      },
      onRecord
    ),

    // Question 8: Suggestions
    createQuestionTool(
      {
        questionId: "suggestions",
        name: "record_suggestions",
        description: TOOL_DESCRIPTIONS.suggestions,
        schema: RecordSuggestionsSchema,
      },
      onRecord
    ),

    // Question 9: Course Parts
    createQuestionTool(
      {
        questionId: "course_parts",
        name: "record_course_parts",
        description: TOOL_DESCRIPTIONS.course_parts,
        schema: RecordCoursePartsSchema,
      },
      onRecord
    ),

    // Workshop Slides Tool
    tool(
      async () => {
        return "Slides link provided to user. You can now continue with the interview.";
      },
      {
        name: "provide_workshop_slides",
        description: "Provide the link to the workshop slides when the user asks for them.",
        schema: z.object({ confirm: z.boolean().describe("Confirm that you want to provide the slides") }),
      }
    ),
  ];
}

// ═══════════════════════════════════════════════════════════════
// TOOL NAMES - For reference
// ═══════════════════════════════════════════════════════════════

export const QUESTION_TOOL_NAMES = [
  "record_ai_background",
  "record_overall_impression",
  "record_perceived_content",
  "record_difficulty",
  "record_content_quality",
  "record_presentation",
  "record_clarity",
  "record_suggestions",
  "record_course_parts",
] as const;

export type QuestionToolName = (typeof QUESTION_TOOL_NAMES)[number];

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
