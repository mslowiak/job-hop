import { useState, useEffect, useCallback } from "react";
import type { ApplicationStatsDto, ApplicationStatus, StatsItem } from "../types";
import { statusLabels } from "../types";

/**
 * Hook for managing application statistics data fetching and state
 * Provides refetch capability and proper error handling
 */
export const useApplicationStats = () => {
  const [data, setData] = useState<ApplicationStatsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches application statistics from the API
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/applications/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const statsData: ApplicationStatsDto = await response.json();

      // Basic validation
      if (
        !statsData.stats ||
        typeof statsData.stats !== "object" ||
        typeof statsData.total !== "number"
      ) {
        throw new Error("Invalid data format received from API");
      }

      // Validate that all required statuses are present
      const requiredStatuses: ApplicationStatus[] = [
        "planned",
        "sent",
        "in_progress",
        "interview",
        "rejected",
        "offer",
      ];

      for (const status of requiredStatuses) {
        if (!(status in statsData.stats) || typeof statsData.stats[status] !== "number") {
          throw new Error(`Invalid stats format: missing or invalid count for ${status}`);
        }
      }

      setData(statsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load statistics";
      setError(errorMessage);
      console.error("useApplicationStats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetches statistics data
   */
  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch when window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
