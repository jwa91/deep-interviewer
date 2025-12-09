import { useCallback, useState } from "react";
import type { GetAllResponsesResponse } from "../types";

const API_BASE = "http://localhost:3001";

interface UseResponsesOptions {
  sessionId: string;
}

interface UseResponsesReturn {
  data: GetAllResponsesResponse | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch all responses for a session.
 * Used for the summary view.
 */
export function useResponses({ sessionId }: UseResponsesOptions): UseResponsesReturn {
  const [data, setData] = useState<GetAllResponsesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/interviews/${sessionId}/responses`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = (await response.json()) as GetAllResponsesResponse;
      setData(responseData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Er is iets misgegaan";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetch: fetchData,
    reset,
  };
}

