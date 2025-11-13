import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type {
  ApplicationDto,
  ApplicationStatus,
  ApplicationListResponseDto,
  ApplicationViewModel,
} from "../types";
import { statusLabels, isValidApplicationStatus } from "../types";
import type { FilteredApplicationsViewModel } from "../types/view.types";

/**
 * Hook for managing application data fetching, filtering, and status updates
 * Provides optimistic UI updates and proper error handling
 */
export const useApplications = (filter: ApplicationStatus | "all" = "all") => {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [currentFilter, setCurrentFilter] = useState<ApplicationStatus | "all">(
    filter,
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches applications from the API with optional status filtering
   */
  const fetchApplications = useCallback(
    async (filterParam: ApplicationStatus | "all" = "all") => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filterParam !== "all") {
          params.append("status", filterParam);
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
        setPagination(data.pagination);
        setCurrentFilter(filterParam);
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
        // Call PATCH API to update status
        const response = await fetch(`/api/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update status");
        }

        // Show success toast
        toast.success("Status zaktualizowany pomyślnie");
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

        // Show error toast
        toast.error(`Błąd aktualizacji statusu: ${errorMessage}`);
      }
    },
    [applications],
  );

  // Fetch when filter changes
  useEffect(() => {
    fetchApplications(filter);
  }, [fetchApplications, filter]);

  // Transform ApplicationDto[] to ApplicationViewModel[]
  const applicationsViewModel: ApplicationViewModel[] = useMemo(
    () =>
      applications.map((app) => ({
        ...app,
        formattedDate: new Intl.DateTimeFormat("pl-PL", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(app.application_date)),
        statusLabel: statusLabels[app.status],
      })),
    [applications],
  );

  // Prepare view model data
  const data: FilteredApplicationsViewModel = {
    applications: applicationsViewModel,
    filteredApplications: applicationsViewModel,
    currentFilter,
    pagination,
    loading,
    error: error || undefined,
  };

  return {
    data,
    refetch,
    updateStatus,
  };
};
