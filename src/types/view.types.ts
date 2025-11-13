import type { ApplicationDto, ApplicationStatus } from "./types";

// =============================================================================
// View Model Types - Used for React component props and state management
// =============================================================================

// Status option for dropdowns and filters
// Bridges English data enums to user-facing Polish labels
export interface StatusOption {
  value: ApplicationStatus | "all";
  label: string;
}

// View model for filtered applications state
// Manages API data alongside UI state for filtering, loading, and errors
// Enables optimistic updates by mutating filteredApplications temporarily
export interface FilteredApplicationsViewModel {
  applications: ApplicationDto[]; // Full fetched list from API
  filteredApplications: ApplicationDto[]; // Current view after filter applied
  currentFilter: ApplicationStatus | "all";
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  loading: boolean;
  error?: string;
}

// Props interface for ApplicationRow component
// Ensures handlers are passed correctly and data is subset of ApplicationDto for performance
export interface ApplicationRowViewModel {
  id: string;
  companyName: string;
  positionName: string;
  status: ApplicationStatus;
  onStatusChange: (newStatus: ApplicationStatus) => Promise<void>;
  onRowClick: (id: string) => void;
}
