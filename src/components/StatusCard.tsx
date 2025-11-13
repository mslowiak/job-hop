import React from "react";
import type { ApplicationStatus } from "../types";
import { isValidApplicationStatus } from "../types";

interface StatusCardProps {
  status: ApplicationStatus;
  label: string;
  count: number;
}

/**
 * Card component displaying a single status count
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  label,
  count,
}) => {
  // Validate inputs
  if (!isValidApplicationStatus(status)) {
    return null;
  }

  if (typeof count !== "number" || count < 0) {
    return null;
  }

  if (!label || typeof label !== "string") {
    return null;
  }

  return (
    <div
      className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-200"
      role="gridcell"
      aria-label={`${label}: ${count} ${count === 1 ? "aplikacja" : count < 5 ? "aplikacje" : "aplikacji"}`}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-3">{label}</h3>
      <p className="text-3xl font-bold text-blue-600">{count}</p>
    </div>
  );
};
