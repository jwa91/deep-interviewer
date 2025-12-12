import { Hono } from "hono";
import { createInterviewAgent } from "../../agents/interviewer/index.js";
import { createInvite, listInvites } from "../invites.js";
import { getCheckpointer } from "../persistence.js";

export const adminRoutes = new Hono();

// Generate invite
adminRoutes.post("/invites", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const codeType = body.codeType as string | undefined;
  const code = createInvite(codeType);
  return c.json({ code, codeType });
});

// Export data
adminRoutes.get("/export", async (c) => {
  const fromDate = c.req.query("fromDate");
  const excludeTypesStr = c.req.query("excludeTypes");

  // Parse filters
  const fromDateObj = fromDate ? new Date(fromDate) : null;
  const excludedTypes = excludeTypesStr ? excludeTypesStr.split(",") : [];

  // Get invites and filter
  const allInvites = listInvites();
  const filteredInvites = allInvites.filter((invite) => {
    // Filter by date
    if (fromDateObj) {
      const inviteDate = new Date(invite.createdAt);
      if (inviteDate < fromDateObj) {
        return false;
      }
    }

    // Filter by type
    if (invite.codeType && excludedTypes.includes(invite.codeType)) {
      return false;
    }

    return true;
  });

  // Prepare agent for reading state
  const checkpointer = await getCheckpointer();
  const agent = createInterviewAgent({ checkpointer });

  const results = [];

  for (const invite of filteredInvites) {
    let sessionData = null;
    let responses = null;

    if (invite.sessionId) {
      // Get session state from LangGraph
      const config = { configurable: { thread_id: invite.sessionId } };
      try {
        const state = await agent.getState(config);
        responses = state.values?.responses;
        sessionData = {
          id: invite.sessionId,
          isComplete: state.values?.isComplete,
          completedAt: state.values?.completedAt,
          startedAt: state.values?.startedAt,
        };
      } catch {
        // Ignore errors reading state
      }
    }

    results.push({
      invite,
      session: sessionData,
      responses,
    });
  }

  return c.json({ count: results.length, data: results });
});
