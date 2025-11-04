import React from "react";
import { StatusFilter } from "./StatusFilter";
import { ApplicationList } from "./ApplicationList";
import { AddApplicationButton } from "./AddApplicationButton";
import { useApplications } from "../hooks/useApplications";
import { useStatusOptions } from "../hooks/useStatusOptions";
import type { ApplicationStatus } from "../types";

export const DashboardView: React.FC = () => {
  const { data, refetch, updateStatus } = useApplications();
  const statusOptions = useStatusOptions();

  const handleFilterChange = (filter: ApplicationStatus | "all") => {
    // For now, just refetch - in real implementation would pass filter to API
    // TODO: Use filter parameter to query API with status filter
    console.log("Filter change requested:", filter);
    refetch();
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    await updateStatus(id, status);
  };

  const handleRowClick = (id: string) => {
    // Navigate to application details - for now just log
    console.log("Navigate to application details:", id);
    // In a real implementation:
    // window.location.href = `/applications/${id}`;
  };

  const handleAddClick = () => {
    // Navigate to add application form - for now just log
    console.log("Navigate to add application form");
    // In a real implementation:
    // window.location.href = '/applications/new';
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje aplikacje</h1>
          <p className="text-gray-600">Zarządzaj swoimi aplikacjami o pracę</p>
        </div>

        <div className="flex items-center gap-4">
          <StatusFilter
            filter={data.currentFilter}
            onFilterChange={handleFilterChange}
            options={statusOptions}
          />
          <AddApplicationButton onClick={handleAddClick} />
        </div>
      </div>

      {/* Application List/Table */}
      <ApplicationList
        applications={data.applications}
        loading={data.loading}
        error={data.error}
        onStatusChange={handleStatusChange}
        onRowClick={handleRowClick}
        onAddClick={handleAddClick}
        statusOptions={statusOptions}
      />
    </div>
  );
};
