import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createModel, getModelConfigFromEnv } from "./config";

describe("getModelConfigFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns default config when no env vars set", () => {
    process.env.MODEL_PROVIDER = undefined;
    process.env.MODEL_NAME = undefined;
    process.env.MODEL_TEMPERATURE = undefined;

    const config = getModelConfigFromEnv();
    expect(config.provider).toBe("anthropic");
    expect(config.modelName).toBe("claude-sonnet-4-20250514");
    expect(config.temperature).toBe(0.7);
  });

  it("uses env vars when set", () => {
    process.env.MODEL_PROVIDER = "anthropic";
    process.env.MODEL_NAME = "claude-3-haiku-20240307";
    process.env.MODEL_TEMPERATURE = "0.5";

    const config = getModelConfigFromEnv();
    expect(config.provider).toBe("anthropic");
    expect(config.modelName).toBe("claude-3-haiku-20240307");
    expect(config.temperature).toBe(0.5);
  });
});

describe("createModel", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when ANTHROPIC_API_KEY is not set", () => {
    process.env.ANTHROPIC_API_KEY = undefined;

    expect(() => createModel({ provider: "anthropic" })).toThrow(
      "ANTHROPIC_API_KEY environment variable is not set"
    );
  });

  it("creates Anthropic model when API key is set", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const model = createModel({ provider: "anthropic" });
    expect(model).toBeDefined();
  });

  it("throws for unimplemented providers", () => {
    expect(() => createModel({ provider: "openai" })).toThrow("OpenAI model not yet implemented");
    expect(() => createModel({ provider: "groq" })).toThrow("Groq model not yet implemented");
  });

  it("uses default provider (anthropic) when none specified", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const model = createModel();
    expect(model).toBeDefined();
  });
});
