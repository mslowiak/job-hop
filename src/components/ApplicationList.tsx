import React from "react";
import { ApplicationTable } from "./ApplicationTable";
import { EmptyState } from "./EmptyState";
import { Loader2 } from "lucide-react";
import type { ApplicationDto, ApplicationStatus } from "../types";
import type { StatusOption } from "../types/view.types";

interface ApplicationListProps {
  applications: ApplicationDto[];
  loading: boolean;
  error?: string;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
  onAddClick: () => void;
  statusOptions: StatusOption[];
}

/**
 * Conditional renderer that shows EmptyState, loading state, error state, or ApplicationTable
 * Manages display logic based on data availability and UI states
 */
export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  loading,
  error,
  onStatusChange,
  onRowClick,
  onAddClick,
  statusOptions,
}) => {
  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Ładowanie aplikacji...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Błąd ładowania
        </h3>

        <p className="text-gray-600 mb-4 max-w-md">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // Show empty state if no applications
  if (applications.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  // Show application table
  return (
    <ApplicationTable
      applications={applications}
      onStatusChange={onStatusChange}
      onRowClick={onRowClick}
      statusOptions={statusOptions}
    />
  );
};
