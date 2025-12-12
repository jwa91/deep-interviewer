import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// APP CONFIGURATION HOOK
// ═══════════════════════════════════════════════════════════════
// Fetches runtime configuration from the server.
// This allows configuration to be set via environment variables
// without baking them into the frontend bundle.
// ═══════════════════════════════════════════════════════════════

export interface AppConfig {
  workshopSlidesUrl: string | null;
}

const DEFAULT_CONFIG: AppConfig = {
  workshopSlidesUrl: null,
};

// Cache the config to avoid refetching
let cachedConfig: AppConfig | null = null;
let fetchPromise: Promise<AppConfig> | null = null;

async function fetchConfig(): Promise<AppConfig> {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      console.error("Failed to fetch config:", response.statusText);
      return DEFAULT_CONFIG;
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch config:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Hook to access app configuration.
 * Fetches from server on first use, then caches the result.
 */
export function useAppConfig(): { config: AppConfig; isLoading: boolean } {
  const [config, setConfig] = useState<AppConfig>(cachedConfig ?? DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setIsLoading(false);
      return;
    }

    // Use shared promise to avoid duplicate fetches
    if (!fetchPromise) {
      fetchPromise = fetchConfig();
    }

    fetchPromise.then((fetchedConfig) => {
      cachedConfig = fetchedConfig;
      setConfig(fetchedConfig);
      setIsLoading(false);
    });
  }, []);

  return { config, isLoading };
}

/**
 * Get the cached config synchronously.
 * Returns null if config hasn't been fetched yet.
 */
export function getCachedConfig(): AppConfig | null {
  return cachedConfig;
}
