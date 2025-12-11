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
export function createQuestionTools(
	onRecord: ToolCallback<unknown>,
): StructuredToolInterface[] {
	return [
		// Question 1: AI Background
		createQuestionTool(
			{
				questionId: "ai_background",
				name: "record_ai_background",
				description: `Leg de context van de deelnemer vast (AI-achtergrond + doel/verwachting).
Roep deze tool aan zodra je genoeg weet over:
- Welke AI tools de deelnemer al gebruikte (ChatGPT, Copilot, etc.)
- Waarvoor ze AI gebruikten (productiviteit, creatief, coding, etc.)
- Hun algemene ervaringsniveau met AI
- Hoe duidelijk hun doel was en wat ze hoopten uit de workshop te halen`,
				schema: RecordAiBackgroundSchema,
			},
			onRecord,
		),

		// Question 2: Overall Value
		createQuestionTool(
			{
				questionId: "overall_impression",
				name: "record_overall_impression",
				description: `Leg de overall waarde van de workshop vast (north-star).
Roep deze tool aan zodra je weet:
- Hoe waardevol het was (score)
- Of ze het zouden aanraden
- Of hun vertrouwen om dit toe te passen is toegenomen
Vraag door als het antwoord vaag is ("het was goed" -> "waardoor precies?")`,
				schema: RecordOverallImpressionSchema,
			},
			onRecord,
		),

		// Question 3: Pace & Difficulty
		createQuestionTool(
			{
				questionId: "difficulty",
				name: "record_difficulty",
				description: `Leg feedback over tempo, moeilijkheid en cognitieve belasting vast.
Roep aan zodra je weet:
- Of het niveau goed was (te makkelijk, goed, te moeilijk)
- Of het tempo goed was (te langzaam, goed, te snel)
- Of het als \"veel tegelijk\" voelde en waar dat zat`,
				schema: RecordDifficultySchema,
			},
			onRecord,
		),

		// Question 4: Content & Relevance
		createQuestionTool(
			{
				questionId: "content_quality",
				name: "record_content_quality",
				description: `Leg feedback over inhoud, relevantie en diepgang vast.
Vraag naar:
- Algemene kwaliteit van de inhoud
- Relevantie voor het werk van de deelnemer
- Of de diepgang goed was
- Welke onderdelen het meest bruikbaar waren en wat ze misten`,
				schema: RecordContentQualitySchema,
			},
			onRecord,
		),

		// Question 5: Delivery (Presentation + Clarity)
		createQuestionTool(
			{
				questionId: "presentation",
				name: "record_presentation",
				description: `Leg feedback over uitleg en presentatie vast.
Vraag naar:
- Kwaliteit van de presentatie
- Of het boeiend was
- Of de structuur duidelijk was
- Of de uitleg helder was en welke onderwerpen onduidelijk waren
- Wat juist hielp om het helder te maken`,
				schema: RecordPresentationSchema,
			},
			onRecord,
		),

		// Question 6: Improvements
		createQuestionTool(
			{
				questionId: "suggestions",
				name: "record_suggestions",
				description: `Leg verbeterpunten en suggesties vast.
Vraag wat beter zou kunnen (liefst 1-2 grootste winstpunten).
Leg ook vast hoe belangrijk het is en wat voor soort verbetering de voorkeur heeft (meer oefening, betere voorbeelden, rustiger tempo, etc.).`,
				schema: RecordSuggestionsSchema,
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
