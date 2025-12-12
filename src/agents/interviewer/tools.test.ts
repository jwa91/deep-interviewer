import { describe, expect, it, vi } from "vitest";
import {
  QUESTION_TOOL_NAMES,
  createQuestionTools,
  questionIdToToolName,
  toolNameToQuestionId,
} from "./tools";

describe("createQuestionTools", () => {
  it("creates 7 tools (6 question tools + 1 utility tool)", () => {
    const callback = vi.fn();
    const tools = createQuestionTools(callback);
    expect(tools).toHaveLength(7);
  });

  it("creates tools with correct names", () => {
    const callback = vi.fn();
    const tools = createQuestionTools(callback);
    const names = tools.map((t) => t.name);

    // 9 question tools
    expect(names).toContain("record_ai_background");
    expect(names).toContain("record_overall_impression");
    expect(names).toContain("record_difficulty");
    expect(names).toContain("record_content_quality");
    expect(names).toContain("record_presentation");
    expect(names).toContain("record_suggestions");
    // 1 utility tool
    expect(names).toContain("provide_workshop_slides");
  });

  it("all tools have descriptions", () => {
    const callback = vi.fn();
    const tools = createQuestionTools(callback);

    for (const tool of tools) {
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });
});

describe("QUESTION_TOOL_NAMES", () => {
  it("has 6 tool names", () => {
    expect(QUESTION_TOOL_NAMES).toHaveLength(6);
  });

  it("all start with record_", () => {
    for (const name of QUESTION_TOOL_NAMES) {
      expect(name.startsWith("record_")).toBe(true);
    }
  });
});

describe("toolNameToQuestionId", () => {
  it("converts tool name to question ID", () => {
    expect(toolNameToQuestionId("record_ai_background")).toBe("ai_background");
    expect(toolNameToQuestionId("record_difficulty")).toBe("difficulty");
    expect(toolNameToQuestionId("record_suggestions")).toBe("suggestions");
  });
});

describe("questionIdToToolName", () => {
  it("converts question ID to tool name", () => {
    expect(questionIdToToolName("ai_background")).toBe("record_ai_background");
    expect(questionIdToToolName("difficulty")).toBe("record_difficulty");
    expect(questionIdToToolName("suggestions")).toBe("record_suggestions");
  });
});
