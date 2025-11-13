import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useApplicationStats } from "../hooks/useApplicationStats";
import { RefreshButton } from "./RefreshButton";
import { TotalDisplay } from "./TotalDisplay";
import { StatsGrid } from "./StatsGrid";
import type { StatsItem, ApplicationStatus } from "../types";
import { statusLabels } from "../types";

/**
 * Main component for the statistics view
 * Fetches and displays application statistics with loading and error states
 */
export const StatsView: React.FC = () => {
  const { data, loading, error, refetch } = useApplicationStats();

  // Derive StatsItem[] from API data
  const statsItems: StatsItem[] = useMemo(() => {
    if (!data) return [];

    return Object.entries(data.stats).map(([status, count]) => ({
      status: status as ApplicationStatus,
      label: statusLabels[status as ApplicationStatus],
      count,
    }));
  }, [data]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600">Ładowanie statystyk...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="border border-red-200 bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Błąd ładowania statystyk</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <RefreshButton onRefresh={refetch} />
        </div>
      </div>
    );
  }

  // Show success state
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statystyki aplikacji</h1>
        <p className="text-gray-600">Przeglądaj swoje aplikacje pogrupowane według statusu</p>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <TotalDisplay total={data?.total ?? 0} />
          <RefreshButton onRefresh={refetch} disabled={loading} />
        </div>

        <StatsGrid stats={statsItems} />
      </div>
    </div>
  );
};
