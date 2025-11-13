import React from "react";
import { StatusCard } from "./StatusCard";
import type { StatsItem } from "../types";

interface StatsGridProps {
  stats: StatsItem[];
}

/**
 * Responsive grid component that displays status cards
 */
export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  // Validate that we have exactly 6 status items
  if (!Array.isArray(stats) || stats.length !== 6) {
    console.warn(
      "StatsGrid: Expected exactly 6 status items, received:",
      stats.length,
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="grid"
      aria-label="Statistics by application status"
    >
      {stats.map((stat) => (
        <StatusCard
          key={stat.status}
          status={stat.status}
          label={stat.label}
          count={stat.count}
        />
      ))}
    </div>
  );
};
