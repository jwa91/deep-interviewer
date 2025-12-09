import { createInterviewAgent, createInterviewInput } from "@/agents/interviewer";
import { HumanMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { getInvite, linkSessionToInvite } from "../invites";
import {
  createSession,
  getCheckpointer,
  getSession,
  listSessions,
  updateSession,
} from "../persistence";

// ═══════════════════════════════════════════════════════════════
// INTERVIEW ROUTES
// ═══════════════════════════════════════════════════════════════

export const interviewRoutes = new Hono();

// Cached agent instance
let agentInstance: Awaited<ReturnType<typeof createInterviewAgent>> | null = null;

async function getAgent() {
  if (!agentInstance) {
    const checkpointer = await getCheckpointer();
    agentInstance = createInterviewAgent({ checkpointer });
  }
  return agentInstance;
}

// ═══════════════════════════════════════════════════════════════
// POST /api/interviews - Create new interview
// ═══════════════════════════════════════════════════════════════

interviewRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const code = body.code as string | undefined;

  // Validate invite code
  if (!code) {
    return c.json({ error: "Invite code is required" }, 400);
  }

  const invite = getInvite(code);
  if (!invite) {
    return c.json({ error: "Invalid invite code" }, 403);
  }

  // Check if session already exists for this code
  if (invite.sessionId) {
    const existingSession = getSession(invite.sessionId);
    if (existingSession) {
      return c.json({
        id: existingSession.id,
        createdAt: existingSession.createdAt,
        message: "Resuming existing interview session.",
        isResumed: true,
      });
    }
  }

  // Create new session
  const participantId = body.participantId as string | undefined;
  const session = createSession(participantId);

  // Link session to invite code
  linkSessionToInvite(code, session.id);

  return c.json({
    id: session.id,
    createdAt: session.createdAt,
    message: "Interview session created. Send a message to /chat to begin.",
    isResumed: false,
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews - List all interviews
// ═══════════════════════════════════════════════════════════════

interviewRoutes.get("/", (c) => {
  const sessions = listSessions();
  return c.json({ sessions });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews/:id - Get interview state
// ═══════════════════════════════════════════════════════════════

interviewRoutes.get("/:id", async (c) => {
  const { id } = c.req.param();

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  // Get full state from checkpointer
  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  try {
    const state = await agent.getState(config);

    // Serialize LangChain messages to simple { role, content } format
    // Filter out tool messages and system messages, only keep human and AI
    type LangChainMessage = {
      // biome-ignore lint/style/useNamingConvention: _getType is a LangChain internal method
      _getType?: () => string;
      content: unknown;
      tool_calls?: Array<{ name: string; args: unknown; id: string }>;
    };
    const messages = (state.values?.messages ?? [])
      .filter((msg: LangChainMessage) => {
        const type = msg._getType?.();
        return type === "human" || type === "ai";
      })
      .map((msg: LangChainMessage) => {
        // Handle content that might be string or array of content blocks
        let content = "";
        if (typeof msg.content === "string") {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          // Content blocks array - extract text from each block
          content = msg.content
            .filter((block: { type?: string }) => block.type === "text")
            .map((block: { text?: string }) => block.text ?? "")
            .join("");
        }

        return {
          role: msg._getType?.() === "human" ? "user" : "assistant",
          content,
          toolCalls: msg.tool_calls,
        };
      })
      .filter((msg: { content: string; toolCalls?: unknown[] }) => {
        // Keep messages that have content OR have tool calls
        return msg.content.length > 0 || (msg.toolCalls && msg.toolCalls.length > 0);
      });

    const questionsCompleted = state.values?.questionsCompleted ?? {};
    const completedCount = Object.values(questionsCompleted).filter(Boolean).length;

    return c.json({
      id: session.id,
      createdAt: session.createdAt,
      messages,
      progress: {
        questionsCompleted,
        completedCount,
        totalQuestions: 9,
        isComplete: state.values?.isComplete ?? false,
      },
    });
  } catch {
    // No state yet (interview not started)
    return c.json({
      id: session.id,
      createdAt: session.createdAt,
      messages: [],
      progress: {
        questionsCompleted: {},
        completedCount: 0,
        totalQuestions: 9,
        isComplete: false,
      },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/interviews/:id/chat - Send message (with streaming)
// ═══════════════════════════════════════════════════════════════

interviewRoutes.post("/:id/chat", async (c) => {
  const { id } = c.req.param();

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  const body = await c.req.json();
  const message = body.message as string;

  if (!message || typeof message !== "string") {
    return c.json({ error: "Message is required" }, 400);
  }

  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  // Check if this is the first message
  let currentState: Awaited<ReturnType<typeof agent.getState>> | null;
  try {
    currentState = await agent.getState(config);
  } catch {
    currentState = null;
  }

  // Prepare input - check if conversation has actually started (has messages)
  let input: { messages: HumanMessage[] } | ReturnType<typeof createInterviewInput>;
  const existingMessages = currentState?.values?.messages ?? [];

  if (existingMessages.length > 0) {
    // Subsequent message - just add the human message
    input = { messages: [new HumanMessage(message)] };
  } else {
    // First message - create initial state with welcome AIMessage
    input = createInterviewInput(id, message);
  }

  // Stream the response
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: SSE streaming requires sequential event handling
  return streamSSE(c, async (stream) => {
    try {
      // Use streaming mode
      const eventStream = agent.streamEvents(input, {
        ...config,
        version: "v2",
      });

      let fullResponse = "";
      const toolCalls: Array<{ name: string; args: unknown }> = [];

      // Track message boundaries for proper frontend rendering
      let currentMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      let currentMessageContent = "";
      let needsNewMessage = false;

      // Send initial message_start
      await stream.writeSSE({
        event: "message_start",
        data: JSON.stringify({ messageId: currentMessageId }),
      });

      for await (const event of eventStream) {
        // Handle different event types
        if (event.event === "on_chat_model_stream") {
          // Check if we need to start a new message (after tool call)
          if (needsNewMessage) {
            currentMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            currentMessageContent = "";
            needsNewMessage = false;
            await stream.writeSSE({
              event: "message_start",
              data: JSON.stringify({ messageId: currentMessageId }),
            });
          }

          // Token streaming
          const chunk = event.data.chunk;
          if (chunk?.content) {
            const content =
              typeof chunk.content === "string" ? chunk.content : (chunk.content[0]?.text ?? "");

            if (content) {
              fullResponse += content;
              currentMessageContent += content;
              await stream.writeSSE({
                event: "token",
                data: JSON.stringify({ content, messageId: currentMessageId }),
              });
            }
          }
        } else if (event.event === "on_tool_start") {
          // End current message before tool call (if it has content)
          if (currentMessageContent.trim()) {
            await stream.writeSSE({
              event: "message_end",
              data: JSON.stringify({ messageId: currentMessageId }),
            });
          }

          // Tool execution starting
          await stream.writeSSE({
            event: "tool_start",
            data: JSON.stringify({
              name: event.name,
              input: event.data.input,
            }),
          });
        } else if (event.event === "on_tool_end") {
          // Tool execution completed
          toolCalls.push({
            name: event.name,
            args: event.data.input,
          });

          await stream.writeSSE({
            event: "tool_end",
            data: JSON.stringify({
              name: event.name,
              output: event.data.output,
            }),
          });

          // Flag that next tokens should go into a new message
          needsNewMessage = true;
        }
      }

      // End final message if it has content
      if (currentMessageContent.trim()) {
        await stream.writeSSE({
          event: "message_end",
          data: JSON.stringify({ messageId: currentMessageId }),
        });
      }

      // Get final state
      const finalState = await agent.getState(config);
      const progress = {
        questionsCompleted: finalState.values?.questionsCompleted ?? {},
        isComplete: finalState.values?.isComplete ?? false,
        completedCount: Object.values(finalState.values?.questionsCompleted ?? {}).filter(Boolean)
          .length,
        totalQuestions: 9,
      };

      // Update session if complete
      if (progress.isComplete && !session.isComplete) {
        updateSession(id, { isComplete: true });
      }

      // Send progress update
      await stream.writeSSE({
        event: "progress",
        data: JSON.stringify(progress),
      });

      // Send done event
      await stream.writeSSE({
        event: "done",
        data: JSON.stringify({
          fullResponse,
          toolCalls,
          progress,
        }),
      });
    } catch (error) {
      console.error("Stream error:", error);
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews/:id/results - Get interview results
// ═══════════════════════════════════════════════════════════════

interviewRoutes.get("/:id/results", async (c) => {
  const { id } = c.req.param();

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  try {
    const state = await agent.getState(config);

    if (!state.values?.isComplete) {
      return c.json(
        {
          error: "Interview not complete",
          progress: {
            completedCount: Object.values(state.values?.questionsCompleted ?? {}).filter(Boolean)
              .length,
            totalQuestions: 9,
          },
        },
        400
      );
    }

    return c.json({
      session,
      responses: state.values.responses,
      completedAt: state.values.completedAt,
    });
  } catch {
    return c.json({ error: "No interview data found" }, 404);
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews/:id/responses - Get all recorded responses
// ═══════════════════════════════════════════════════════════════

interviewRoutes.get("/:id/responses", async (c) => {
  const { id } = c.req.param();

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  try {
    const state = await agent.getState(config);

    const responses = state.values?.responses ?? {};
    const questionsCompleted = state.values?.questionsCompleted ?? {};

    // Get list of completed topic IDs
    const completedTopics = Object.entries(questionsCompleted)
      .filter(([, completed]) => completed)
      .map(([topic]) => topic);

    // Transform responses to include metadata
    const responsesWithMetadata: Record<
      string,
      {
        topic: string;
        data: unknown;
        timestamp: string;
        source: "agent" | "user_edit";
      }
    > = {};

    for (const [topic, data] of Object.entries(responses)) {
      if (data) {
        responsesWithMetadata[topic] = {
          topic,
          data,
          // Use completedAt if available, otherwise use startedAt as fallback
          timestamp:
            state.values?.completedAt ?? state.values?.startedAt ?? new Date().toISOString(),
          // Check if data has a source field, otherwise default to "agent"
          source: (data as { source?: "agent" | "user_edit" }).source ?? "agent",
        };
      }
    }

    return c.json({
      sessionId: id,
      responses: responsesWithMetadata,
      completedTopics,
      totalTopics: 9,
    });
  } catch {
    // No state yet (interview not started)
    return c.json({
      sessionId: id,
      responses: {},
      completedTopics: [],
      totalTopics: 9,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/interviews/:id/responses/:topic - Get single topic response
// ═══════════════════════════════════════════════════════════════

interviewRoutes.get("/:id/responses/:topic", async (c) => {
  const { id, topic } = c.req.param();

  // Validate topic is a valid question ID
  const validTopics = [
    "ai_background",
    "overall_impression",
    "perceived_content",
    "difficulty",
    "content_quality",
    "presentation",
    "clarity",
    "suggestions",
    "course_parts",
  ];

  if (!validTopics.includes(topic)) {
    return c.json({ error: `Invalid topic: ${topic}` }, 400);
  }

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  try {
    const state = await agent.getState(config);

    const responses = state.values?.responses ?? {};
    const data = responses[topic as keyof typeof responses];

    if (!data) {
      return c.json({ error: `No response recorded for topic: ${topic}` }, 404);
    }

    return c.json({
      topic,
      data,
      timestamp: state.values?.completedAt ?? state.values?.startedAt ?? new Date().toISOString(),
      source: (data as { source?: "agent" | "user_edit" }).source ?? "agent",
    });
  } catch {
    return c.json({ error: "No interview data found" }, 404);
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/interviews/:id/responses/:topic - Update/correct a response
// ═══════════════════════════════════════════════════════════════

interviewRoutes.put("/:id/responses/:topic", async (c) => {
  const { id, topic } = c.req.param();

  // Validate topic is a valid question ID
  const validTopics = [
    "ai_background",
    "overall_impression",
    "perceived_content",
    "difficulty",
    "content_quality",
    "presentation",
    "clarity",
    "suggestions",
    "course_parts",
  ];

  if (!validTopics.includes(topic)) {
    return c.json({ error: `Invalid topic: ${topic}` }, 400);
  }

  const session = getSession(id);
  if (!session) {
    return c.json({ error: "Interview not found" }, 404);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Request body must be a valid JSON object" }, 400);
  }

  const agent = await getAgent();
  const config = { configurable: { thread_id: id } };

  try {
    const state = await agent.getState(config);

    if (!state.values) {
      return c.json({ error: "Interview has no state yet" }, 400);
    }

    // Get current responses and update the specific topic
    const currentResponses = state.values.responses ?? {};

    // Add source metadata to track user edits
    const updatedData = {
      ...body,
      source: "user_edit" as const,
    };

    const updatedResponses = {
      ...currentResponses,
      [topic]: updatedData,
    };

    // Also mark the question as completed if it wasn't already
    const updatedQuestionsCompleted = {
      ...state.values.questionsCompleted,
      [topic]: true,
    };

    // Update the state using updateState
    await agent.updateState(config, {
      responses: updatedResponses,
      questionsCompleted: updatedQuestionsCompleted,
    });

    return c.json({
      topic,
      data: updatedData,
      timestamp: new Date().toISOString(),
      source: "user_edit",
    });
  } catch (error) {
    console.error("Error updating response:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to update response" },
      500
    );
  }
});
