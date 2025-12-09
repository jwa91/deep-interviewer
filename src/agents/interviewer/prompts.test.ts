import { describe, expect, it } from "vitest";
import { INTERVIEWER_SYSTEM_PROMPT, generateProgressReminder, getSystemPrompt } from "./prompts";

describe("INTERVIEWER_SYSTEM_PROMPT", () => {
  it("is in Dutch", () => {
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("Nederlands");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("deelnemer");
  });

  it("mentions all 9 question tools", () => {
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_ai_background");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_overall_impression");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_perceived_content");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_difficulty");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_content_quality");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_presentation");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_clarity");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_suggestions");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("record_course_parts");
  });

  it("emphasizes natural conversation flow for tool calling", () => {
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("Onthoud alles");
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("Natuurlijke overgangen");
    // "Volg de flow" was removed in favor of being more directive/efficient
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("Snelheid in het begin");
  });

  it("mentions JW as the instructor", () => {
    expect(INTERVIEWER_SYSTEM_PROMPT).toContain("JW");
  });
});

describe("generateProgressReminder", () => {
  it("returns empty string when no questions completed", () => {
    const reminder = generateProgressReminder([], []);
    expect(reminder).toBe("");
  });

  it("includes completed questions", () => {
    const reminder = generateProgressReminder(
      ["ai_background", "difficulty"],
      ["overall_impression"]
    );
    expect(reminder).toContain("ai_background");
    expect(reminder).toContain("difficulty");
  });

  it("includes remaining questions", () => {
    const reminder = generateProgressReminder(
      ["ai_background"],
      ["overall_impression", "difficulty"]
    );
    expect(reminder).toContain("overall_impression");
    expect(reminder).toContain("difficulty");
  });
});

describe("getSystemPrompt", () => {
  it("returns base prompt when no progress", () => {
    const prompt = getSystemPrompt();
    expect(prompt).toBe(INTERVIEWER_SYSTEM_PROMPT);
  });

  it("appends progress reminder when questions completed", () => {
    const prompt = getSystemPrompt(["ai_background"], ["overall_impression"]);
    expect(prompt).toContain(INTERVIEWER_SYSTEM_PROMPT);
    expect(prompt).toContain("Huidige Voortgang");
  });
});
