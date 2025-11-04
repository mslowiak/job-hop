import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "../types";
import type { StatusOption } from "../types/view.types";
import { getStatusLabel } from "../hooks/useStatusOptions";

interface StatusDropdownProps {
  currentStatus: ApplicationStatus;
  onSelect: (status: ApplicationStatus) => void;
  options: StatusOption[];
}

/**
 * Per-row dropdown for quick status updates in application table
 * Uses Shadcn DropdownMenu with Polish labels and proper ARIA attributes
 */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onSelect,
  options,
}) => {
  // Filter out 'all' option since it's only for filtering, not status selection
  const statusOptions = options.filter((option) => option.value !== "all");

  const handleSelect = (status: ApplicationStatus) => {
    if (status !== currentStatus) {
      onSelect(status);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label={`Change status from ${getStatusLabel(currentStatus)}`}
      >
        <span className="text-gray-700">{getStatusLabel(currentStatus)}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value as ApplicationStatus)}
            className={`cursor-pointer ${
              option.value === currentStatus
                ? "bg-blue-50 text-blue-700 font-medium"
                : "hover:bg-gray-50"
            }`}
            aria-current={option.value === currentStatus ? "true" : undefined}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
