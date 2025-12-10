import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// ═══════════════════════════════════════════════════════════════
// MODEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export type ModelProvider = "anthropic" | "openai" | "groq";

export interface ModelConfig {
  provider: ModelProvider;
  modelName?: string;
  temperature?: number;
}

const DEFAULT_CONFIG: ModelConfig = {
  provider: "anthropic",
  modelName: "claude-haiku-4-5",
  temperature: 0.3,
};

// ═══════════════════════════════════════════════════════════════
// MODEL FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a chat model instance based on configuration.
 * Defaults to Anthropic Claude if no config provided.
 */
export function createModel(config: Partial<ModelConfig> = {}): BaseChatModel {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  switch (mergedConfig.provider) {
    case "anthropic":
      return createAnthropicModel(mergedConfig);
    case "openai":
      throw new Error("OpenAI model not yet implemented");
    case "groq":
      throw new Error("Groq model not yet implemented");
    default:
      throw new Error(`Unknown model provider: ${mergedConfig.provider}`);
  }
}

function createAnthropicModel(config: ModelConfig): ChatAnthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  return new ChatAnthropic({
    anthropicApiKey: apiKey,
    model: config.modelName ?? "claude-sonnet-4-20250514",
    temperature: config.temperature ?? 0.7,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENVIRONMENT HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Gets model configuration from environment variables.
 * Allows overriding defaults via env.
 */
export function getModelConfigFromEnv(): ModelConfig {
  const provider = (process.env.MODEL_PROVIDER as ModelProvider) || DEFAULT_CONFIG.provider;
  const modelName = process.env.MODEL_NAME || DEFAULT_CONFIG.modelName;
  const temperature = process.env.MODEL_TEMPERATURE
    ? Number.parseFloat(process.env.MODEL_TEMPERATURE)
    : DEFAULT_CONFIG.temperature;

  return {
    provider,
    modelName,
    temperature,
  };
}

/**
 * Creates a model using environment configuration.
 */
export function createModelFromEnv(): BaseChatModel {
  return createModel(getModelConfigFromEnv());
}
