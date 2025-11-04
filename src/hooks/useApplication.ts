import { useState, useEffect, useCallback } from "react";
import type {
  ApplicationResponse,
  ApiErrorResponse,
  ApplicationViewModel,
} from "../types";
import { statusLabels } from "../types";

/**
 * Hook for managing single application data fetching and operations
 * Provides loading states, error handling, and data transformation
 */
export const useApplication = (id: string) => {
  const [application, setApplication] = useState<ApplicationResponse | null>(
    null,
  );
  const [viewModel, setViewModel] = useState<ApplicationViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transforms ApplicationResponse to ApplicationViewModel with formatted display fields
   */
  const transformToViewModel = useCallback(
    (data: ApplicationResponse): ApplicationViewModel => {
      const date = new Date(data.application_date);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return {
        ...data,
        formattedDate,
        statusLabel: statusLabels[data.status],
      };
    },
    [],
  );

  /**
   * Fetches application data from the API
   */
  const fetchApplication = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data: ApplicationResponse = await response.json();
      setApplication(data);
      setViewModel(transformToViewModel(data));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load application";
      setError(errorMessage);
      console.error("useApplication fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, transformToViewModel]);

  /**
   * Refetches the application data
   */
  const refetch = useCallback(() => {
    fetchApplication();
  }, [fetchApplication]);

  // Fetch data on mount and when id changes
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    data: application,
    viewModel,
    loading,
    error,
    refetch,
  };
};
