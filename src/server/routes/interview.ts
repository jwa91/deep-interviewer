import { createInterviewAgent, createInterviewInput } from "@/agents/interviewer";
import { HumanMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
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
  const participantId = body.participantId as string | undefined;

  const session = createSession(participantId);

  return c.json({
    id: session.id,
    createdAt: session.createdAt,
    message: "Interview session created. Send a message to /chat to begin.",
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

    return c.json({
      session,
      state: state.values,
      progress: {
        questionsCompleted: state.values?.questionsCompleted ?? {},
        isComplete: state.values?.isComplete ?? false,
      },
    });
  } catch {
    // No state yet (interview not started)
    return c.json({
      session,
      state: null,
      progress: {
        questionsCompleted: {},
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

  // Prepare input
  let input: { messages: HumanMessage[] } | ReturnType<typeof createInterviewInput>;
  if (currentState?.values) {
    // Subsequent message - just add the human message
    input = { messages: [new HumanMessage(message)] };
  } else {
    // First message - create initial state
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

      for await (const event of eventStream) {
        // Handle different event types
        if (event.event === "on_chat_model_stream") {
          // Token streaming
          const chunk = event.data.chunk;
          if (chunk?.content) {
            const content =
              typeof chunk.content === "string" ? chunk.content : (chunk.content[0]?.text ?? "");

            if (content) {
              fullResponse += content;
              await stream.writeSSE({
                event: "token",
                data: JSON.stringify({ content }),
              });
            }
          }
        } else if (event.event === "on_tool_start") {
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
        }
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
