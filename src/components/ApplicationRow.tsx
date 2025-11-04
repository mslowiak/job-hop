import React from "react";
import { TableRow, TableCell } from "./ui/table";
import { CompanyCell } from "./CompanyCell";
import { PositionCell } from "./PositionCell";
import { StatusDropdown } from "./StatusDropdown";
import type { ApplicationDto, ApplicationStatus } from "../types";
import type { StatusOption } from "../types/view.types";

interface ApplicationRowProps {
  app: ApplicationDto;
  onStatusChange: (status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
  options: StatusOption[];
}

/**
 * Single table row component for displaying an application
 * Clickable row for navigation to details, with status dropdown for quick updates
 */
export const ApplicationRow: React.FC<ApplicationRowProps> = ({
  app,
  onStatusChange,
  onRowClick,
  options,
}) => {
  const handleRowClick = () => {
    onRowClick(app.id);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    onStatusChange(newStatus);
  };

  return (
    <TableRow
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleRowClick}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      aria-label={`Application for ${app.position_name} at ${app.company_name}`}
    >
      <TableCell className="py-4">
        <CompanyCell companyName={app.company_name} />
      </TableCell>
      <TableCell className="py-4">
        <PositionCell positionName={app.position_name} />
      </TableCell>
      <TableCell className="py-4">
        <StatusDropdown
          currentStatus={app.status}
          onSelect={handleStatusChange}
          options={options}
        />
      </TableCell>
    </TableRow>
  );
};
