import { type StructuredToolInterface, tool } from "@langchain/core/tools";
import { z } from "zod";
import {
	QUESTION_IDS,
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
} from "../../shared/schema/index.js";
import { type ToolCallback, createQuestionTool } from "./tool-factory.js";

// ═══════════════════════════════════════════════════════════════
// QUESTION TOOLS
// Each tool corresponds to one interview question
// All tool configuration (name, description, schema) is defined here.
// ═══════════════════════════════════════════════════════════════

/**
 * Creates all 9 question tools with the given callback.
 * The callback is called whenever a tool records data.
 */
export function createQuestionTools(
	onRecord: ToolCallback<unknown>,
): StructuredToolInterface[] {
	return [
		// Question 1: AI Background
		createQuestionTool(
			{
				questionId: "ai_background",
				name: "record_ai_background",
				description: `Leg de AI-achtergrond van de deelnemer vast.
Roep deze tool aan zodra je genoeg weet over:
- Welke AI tools de deelnemer al gebruikte (ChatGPT, Copilot, etc.)
- Waarvoor ze AI gebruikten (productiviteit, creatief, coding, etc.)
- Hun algemene ervaringsniveau met AI`,
				schema: RecordAiBackgroundSchema,
			},
			onRecord,
		),

		// Question 2: Overall Impression
		createQuestionTool(
			{
				questionId: "overall_impression",
				name: "record_overall_impression",
				description: `Leg de algemene indruk van de training vast.
Roep deze tool aan zodra de deelnemer heeft aangegeven wat ze van de training vonden.
Vraag door als het antwoord vaag is ("het was goed" -> "wat maakte het goed?")`,
				schema: RecordOverallImpressionSchema,
			},
			onRecord,
		),

		// Question 3: Perceived Content
		createQuestionTool(
			{
				questionId: "perceived_content",
				name: "record_perceived_content",
				description: `Leg vast wat de deelnemer denkt dat de training inhield.
Dit helpt te begrijpen of de leerdoelen duidelijk waren.
Vraag: "Waar ging de training volgens jou met name over?"`,
				schema: RecordPerceivedContentSchema,
			},
			onRecord,
		),

		// Question 4: Difficulty
		createQuestionTool(
			{
				questionId: "difficulty",
				name: "record_difficulty",
				description: `Leg feedback over moeilijkheidsgraad en tempo vast.
Roep aan zodra je weet:
- Of het niveau goed was (te makkelijk, goed, te moeilijk)
- Of het tempo goed was (te langzaam, goed, te snel)`,
				schema: RecordDifficultySchema,
			},
			onRecord,
		),

		// Question 5: Content Quality
		createQuestionTool(
			{
				questionId: "content_quality",
				name: "record_content_quality",
				description: `Leg feedback over inhoudelijke kwaliteit vast.
Vraag naar:
- Algemene kwaliteit van de inhoud
- Relevantie voor het werk van de deelnemer
- Of de diepgang goed was`,
				schema: RecordContentQualitySchema,
			},
			onRecord,
		),

		// Question 6: Presentation
		createQuestionTool(
			{
				questionId: "presentation",
				name: "record_presentation",
				description: `Leg feedback over de presentatie vast.
Vraag naar:
- Kwaliteit van de presentatie
- Of het boeiend was
- Of de structuur duidelijk was`,
				schema: RecordPresentationSchema,
			},
			onRecord,
		),

		// Question 7: Clarity
		createQuestionTool(
			{
				questionId: "clarity",
				name: "record_clarity",
				description: `Leg feedback over duidelijkheid vast.
Vraag of alles duidelijk was uitgelegd.
Als iets onduidelijk was, noteer welke onderwerpen.
Vraag of de deelnemer wil dat iets opnieuw wordt uitgelegd.`,
				schema: RecordClaritySchema,
			},
			onRecord,
		),

		// Question 8: Suggestions
		createQuestionTool(
			{
				questionId: "suggestions",
				name: "record_suggestions",
				description: `Leg verbeterpunten en suggesties vast.
Vraag wat beter zou kunnen.
Vraag ook of de deelnemer de training zou aanraden aan anderen.`,
				schema: RecordSuggestionsSchema,
			},
			onRecord,
		),

		// Question 9: Course Parts
		createQuestionTool(
			{
				questionId: "course_parts",
				name: "record_course_parts",
				description: `Leg feedback over de twee delen van de cursus vast.
De cursus had twee delen:
1. Theorie: hoe LLMs werken
2. Praktijk: hoe je LLMs gebruikt
Vraag welk deel de deelnemer nuttiger/leuker vond en waarom.`,
				schema: RecordCoursePartsSchema,
			},
			onRecord,
		),

		// Workshop Slides Tool
		tool(
			() => {
				return "Slides link provided to user. You can now continue with the interview.";
			},
			{
				name: "provide_workshop_slides",
				description:
					"Provide the link to the workshop slides when the user asks for them.",
				schema: z.object({
					confirm: z
						.boolean()
						.describe("Confirm that you want to provide the slides"),
				}),
			},
		),
	];
}

// ═══════════════════════════════════════════════════════════════
// TOOL NAMES - Derived from QUESTION_IDS (single source of truth)
// ═══════════════════════════════════════════════════════════════

export const QUESTION_TOOL_NAMES = QUESTION_IDS.map(
	(id) => `record_${id}` as const,
);

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
