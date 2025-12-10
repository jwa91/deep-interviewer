import { useCallback, useState } from "react";
import type { QuestionId, TopicResponseDTO } from "../types";

interface UseTopicResponseOptions {
  sessionId: string;
  topic: QuestionId;
}

interface UseTopicResponseReturn {
  data: TopicResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fetching a single topic response from the API.
 * Designed for lazy loading - call `fetch()` when you need the data.
 *
 * Can be adapted for eager loading by calling fetch() in useEffect
 * when a trigger condition changes (e.g., when card state becomes 'completed').
 */
export function useTopicResponse({
  sessionId,
  topic,
}: UseTopicResponseOptions): UseTopicResponseReturn {
  const [data, setData] = useState<TopicResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Skip if already loading or already have data
    if (isLoading || data) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/interviews/${sessionId}/responses/${topic}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Notities niet gevonden");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = (await response.json()) as TopicResponseDTO;
      setData(responseData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Er is iets misgegaan";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, topic, isLoading, data]);

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
