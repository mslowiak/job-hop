import React, { useState } from "react";
import { StatusFilter } from "./StatusFilter";
import { ApplicationList } from "./ApplicationList";
import { AddApplicationButton } from "./AddApplicationButton";
import { MotivationalMessage } from "./MotivationalMessage";
import { useApplications } from "../hooks/useApplications";
import { useStatusOptions } from "../hooks/useStatusOptions";
import type { ApplicationStatus } from "../types";

export const DashboardView: React.FC = () => {
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const { data, refetch, updateStatus } = useApplications(filter);
  const statusOptions = useStatusOptions();

  const handleFilterChange = (newFilter: ApplicationStatus | "all") => {
    setFilter(newFilter);
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    await updateStatus(id, status);
  };

  const handleRowClick = (id: string) => {
    // Navigate to application details page
    window.location.href = `/applications/${id}`;
  };

  const handleAddClick = () => {
    // Navigate to add application form
    window.location.href = "/applications/new";
  };

  const handleAddButtonClick = () => {
    handleAddClick();
  };

  return (
    <main role="main" aria-label="Dashboard" className="space-y-6" data-testid="dashboard-main">
      <MotivationalMessage />

      {/* Header with Add Button and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-bold text-gray-900">
            Moje aplikacje
          </h1>
          <p className="text-gray-600">Zarządzaj swoimi aplikacjami o pracę</p>
        </div>

        <div className="flex items-center gap-4">
          <StatusFilter filter={filter} onFilterChange={handleFilterChange} options={statusOptions} />
          <AddApplicationButton onClick={handleAddButtonClick} />
        </div>
      </div>

      {/* Application List/Table */}
      <ApplicationList
        applications={data.applications}
        loading={data.loading}
        error={data.error}
        currentFilter={filter}
        onStatusChange={handleStatusChange}
        onRowClick={handleRowClick}
        onAddClick={handleAddClick}
        statusOptions={statusOptions}
        refetch={refetch}
      />
    </main>
  );
};
