import { END, START, StateGraph } from "@langchain/langgraph";
import { SystemMessage, HumanMessage, isAIMessage } from "@langchain/core/messages";
import type { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import type { RunnableConfig } from "@langchain/core/runnables";
import {
	InterviewStateSchema,
	type InterviewState,
	createInitialState,
	shouldMarkComplete,
	getRemainingQuestionIds,
} from "./state";
import { createModel, type ModelConfig } from "./config";
import { createQuestionTools, toolNameToQuestionId } from "./tools";
import { getSystemPrompt } from "./prompts";
import type { QuestionId, CollectedResponses } from "@/shared/schema";

// ═══════════════════════════════════════════════════════════════
// AGENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface InterviewAgentConfig {
	/** Model configuration (defaults to Anthropic) */
	modelConfig?: Partial<ModelConfig>;
	/** Checkpointer for persistence */
	checkpointer?: BaseCheckpointSaver;
}

// ═══════════════════════════════════════════════════════════════
// AGENT FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a compiled interview agent graph.
 */
export function createInterviewAgent(config: InterviewAgentConfig = {}) {
	const model = createModel(config.modelConfig);

	// Create the graph
	const graph = new StateGraph(InterviewStateSchema);

	// Storage for tool results (will be updated by tools)
	const pendingToolUpdates: {
		questionId: QuestionId;
		data: unknown;
	}[] = [];

	// Create tools with callback to capture data
	const tools = createQuestionTools(async (questionId, data) => {
		pendingToolUpdates.push({ questionId, data });
	});

	// Bind tools to model
	const modelWithTools = model.bindTools(tools);

	// ═══════════════════════════════════════════════════════════
	// NODE: Model Call
	// ═══════════════════════════════════════════════════════════

	async function callModel(
		state: InterviewState,
		_config?: RunnableConfig,
	): Promise<Partial<InterviewState>> {
		// Build system prompt with progress info
		const questionsCompleted = state.questionsCompleted ?? {};
		const completedIds = Object.entries(questionsCompleted)
			.filter(([_, v]) => v)
			.map(([k]) => k);
		const remainingIds = getRemainingQuestionIds({
			...state,
			questionsCompleted: questionsCompleted as InterviewState["questionsCompleted"],
		});

		const systemPrompt = getSystemPrompt(completedIds, remainingIds);

		// Call the model
		const response = await modelWithTools.invoke([
			new SystemMessage(systemPrompt),
			...state.messages,
		]);

		return {
			messages: [response],
		};
	}

	// ═══════════════════════════════════════════════════════════
	// NODE: Tool Execution
	// ═══════════════════════════════════════════════════════════

	async function executeTools(
		state: InterviewState,
		_config?: RunnableConfig,
	): Promise<Partial<InterviewState>> {
		const lastMessage = state.messages.at(-1);

		if (!lastMessage || !isAIMessage(lastMessage)) {
			return {};
		}

		const toolCalls = lastMessage.tool_calls ?? [];
		if (toolCalls.length === 0) {
			return {};
		}

		// Clear pending updates
		pendingToolUpdates.length = 0;

		// Execute each tool call
		const { ToolMessage } = await import("@langchain/core/messages");
		const toolMessages = [];

		for (const toolCall of toolCalls) {
			const tool = tools.find((t) => t.name === toolCall.name);
			if (tool) {
				try {
					const result = await tool.invoke(toolCall.args);
					toolMessages.push(
						new ToolMessage({
							content: result,
							tool_call_id: toolCall.id ?? "",
						}),
					);
				} catch (error) {
					toolMessages.push(
						new ToolMessage({
							content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
							tool_call_id: toolCall.id ?? "",
						}),
					);
				}
			}
		}

		// Process pending tool updates
		const updatedCompletion = { ...(state.questionsCompleted ?? {}) };
		const updatedResponses = { ...(state.responses ?? {}) } as CollectedResponses;

		for (const update of pendingToolUpdates) {
			const key = update.questionId as keyof typeof updatedCompletion;
			updatedCompletion[key] = true;
			(updatedResponses as Record<string, unknown>)[update.questionId] =
				update.data;
		}

		// Check if interview is complete
		const isComplete = shouldMarkComplete({
			...state,
			questionsCompleted: updatedCompletion,
		});

		return {
			messages: toolMessages,
			questionsCompleted: updatedCompletion,
			responses: updatedResponses,
			isComplete,
			...(isComplete ? { completedAt: new Date().toISOString() } : {}),
		};
	}

	// ═══════════════════════════════════════════════════════════
	// CONDITIONAL EDGE: Should Continue?
	// ═══════════════════════════════════════════════════════════

	function shouldContinue(state: InterviewState): "tools" | typeof END {
		const lastMessage = state.messages.at(-1);

		if (!lastMessage || !isAIMessage(lastMessage)) {
			return END;
		}

		// If there are tool calls, execute them
		if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
			return "tools";
		}

		// Otherwise end this turn (wait for user input)
		return END;
	}

	// ═══════════════════════════════════════════════════════════
	// BUILD GRAPH
	// ═══════════════════════════════════════════════════════════

	graph.addNode("model", callModel);
	graph.addNode("tools", executeTools);

	graph.addEdge(START, "model");
	graph.addConditionalEdges("model", shouldContinue, ["tools", END]);
	graph.addEdge("tools", "model");

	// Compile with optional checkpointer
	return graph.compile({
		checkpointer: config.checkpointer,
	});
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Create new interview session
// ═══════════════════════════════════════════════════════════════

/**
 * Creates initial input for a new interview.
 */
export function createInterviewInput(
	sessionId: string,
	initialMessage?: string,
): InterviewState {
	const state = createInitialState(sessionId);

	if (initialMessage) {
		state.messages = [new HumanMessage(initialMessage)];
	}

	return state;
}

