import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import type { QuestionId } from "../../shared/schema/index.js";

// ═══════════════════════════════════════════════════════════════
// TOOL FACTORY
// Generic utility for creating LangChain tools from question configs.
// Tool-specific configuration (name, description, schema) lives in tools.ts
// ═══════════════════════════════════════════════════════════════

export interface QuestionToolConfig<T extends z.ZodType> {
	/** Question identifier */
	questionId: QuestionId;
	/** Tool name (e.g., "record_ai_background") */
	name: string;
	/** Description shown to the LLM */
	description: string;
	/** Zod schema for tool input */
	schema: T;
}

export type ToolCallback<T> = (
	questionId: QuestionId,
	data: T,
) => Promise<void>;

/**
 * Creates a LangChain tool from a question configuration.
 * The tool will call the provided callback with the question ID and validated data.
 */
export function createQuestionTool<T extends z.ZodType>(
	config: QuestionToolConfig<T>,
	onRecord: ToolCallback<z.infer<T>>,
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
		},
	);
}
