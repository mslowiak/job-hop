import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ApplicationStatus } from "../types";
import type { StatusOption } from "../types/view.types";

interface StatusFilterProps {
  filter: ApplicationStatus | "all";
  onFilterChange: (status: ApplicationStatus | "all") => void;
  options: StatusOption[];
}

/**
 * Dropdown filter component for filtering applications by status
 * Uses Shadcn Select with Polish labels and proper validation
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  filter,
  onFilterChange,
  options,
}) => {
  const handleValueChange = (value: string) => {
    // Validate the selected value
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      onFilterChange(selectedOption.value);
    } else {
      // Reset to 'all' if invalid value selected
      onFilterChange("all");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="status-filter"
        className="text-sm font-medium text-gray-700"
      >
        Filtruj po statusie:
      </label>
      <Select value={filter} onValueChange={handleValueChange}>
        <SelectTrigger
          id="status-filter"
          className="w-48"
          aria-label="Filter applications by status"
        >
          <SelectValue placeholder="Wybierz status" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};


