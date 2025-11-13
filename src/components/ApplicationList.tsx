import React from "react";
import { ApplicationTable } from "./ApplicationTable";
import { EmptyState } from "./EmptyState";
import { Loader2 } from "lucide-react";
import type { ApplicationStatus } from "../types";
import type { ApplicationViewModel } from "../types";

interface ApplicationListProps {
  applications: ApplicationViewModel[];
  loading: boolean;
  error?: string;
  currentFilter: ApplicationStatus | "all";
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
  onAddClick: () => void;
  refetch: () => void;
}

/**
 * Conditional renderer that shows EmptyState, loading state, error state, or ApplicationTable
 * Manages display logic based on data availability and UI states
 */
export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  loading,
  error,
  currentFilter,
  onStatusChange,
  onRowClick,
  onAddClick,
  refetch,
}) => {
  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded">
        <p className="text-red-700">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <EmptyState
        isFiltered={currentFilter !== "all"}
        onAddClick={onAddClick}
      />
    );
  }

  // Show application table
  return (
    <ApplicationTable
      applications={applications}
      onRowClick={onRowClick}
      onStatusChange={(id, status) => onStatusChange(id, status)}
    />
  );
};
