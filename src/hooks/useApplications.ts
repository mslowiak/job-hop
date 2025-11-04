import { useState, useEffect, useCallback } from "react";
import type {
  ApplicationDto,
  ApplicationStatus,
  ApplicationListResponseDto,
  isValidApplicationStatus,
} from "../types";
import type { FilteredApplicationsViewModel } from "../types/view.types";

/**
 * Hook for managing application data fetching, filtering, and status updates
 * Provides optimistic UI updates and proper error handling
 */
export const useApplications = () => {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [currentFilter, setCurrentFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches applications from the API with optional status filtering
   */
  const fetchApplications = useCallback(
    async (filter: ApplicationStatus | "all" = "all") => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filter !== "all") {
          params.append("status", filter);
        }
        params.append("page", "1");
        params.append("limit", "20");

        const response = await fetch(`/api/applications?${params}`, {
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

        const data: ApplicationListResponseDto = await response.json();

        setApplications(data.applications);
        setCurrentFilter(filter);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load applications";
        setError(errorMessage);
        console.error("useApplications fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Refetches applications with current filter
   */
  const refetch = useCallback(() => {
    fetchApplications(currentFilter);
  }, [fetchApplications, currentFilter]);

  /**
   * Updates application status with optimistic UI
   * Reverts on error and shows user feedback
   */
  const updateStatus = useCallback(
    async (id: string, newStatus: ApplicationStatus): Promise<void> => {
      // Validate status
      if (!isValidApplicationStatus(newStatus)) {
        setError("Invalid status selected");
        return;
      }

      // Find current application for optimistic update
      const currentApp = applications.find((app) => app.id === id);
      if (!currentApp) {
        setError("Application not found");
        return;
      }

      // Store original status for potential revert
      const originalStatus = currentApp.status;

      // Optimistic update - immediately update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app,
        ),
      );

      try {
        // TODO: Implement PATCH /api/applications/{id} when available
        // For now, just simulate a successful update after a brief delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In a real implementation, this would be:
        // const response = await fetch(`/api/applications/${id}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: newStatus }),
        // });
        // if (!response.ok) throw new Error('Failed to update status');
      } catch (err) {
        // Revert optimistic update on error
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: originalStatus } : app,
          ),
        );

        const errorMessage =
          err instanceof Error ? err.message : "Failed to update status";
        setError(errorMessage);
        console.error("useApplications updateStatus error:", err);
      }
    },
    [applications],
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Prepare view model data
  const data: FilteredApplicationsViewModel = {
    applications,
    filteredApplications: applications, // For now, no client-side filtering beyond API
    currentFilter,
    pagination: {
      total: applications.length, // Simplified - would come from API in real implementation
      page: 1,
      limit: 20,
    },
    loading,
    error: error || undefined,
  };

  return {
    data,
    refetch,
    updateStatus,
  };
};
