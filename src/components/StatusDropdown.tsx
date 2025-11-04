import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ApplicationStatus } from "../types";
import { statusLabels } from "../types";

interface StatusDropdownProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  applicationId: string;
  disabled?: boolean;
}

/**
 * Per-row dropdown for quick status updates in application table
 * Uses Shadcn Select with Polish labels and proper ARIA attributes
 */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const statusOptions: ApplicationStatus[] = [
    "planned",
    "sent",
    "in_progress",
    "interview",
    "rejected",
    "offer",
  ];

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue !== value) {
          onChange(newValue as ApplicationStatus);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={`Current status: ${statusLabels[value]}`}
        className="w-48"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
