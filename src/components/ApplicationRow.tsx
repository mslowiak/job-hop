import React, { memo } from "react";
import { TableRow, TableCell } from "./ui/table";
import { StatusDropdown } from "./StatusDropdown";
import { CompanyCell } from "./CompanyCell";
import { PositionCell } from "./PositionCell";
import type { ApplicationStatus } from "../types";
import type { ApplicationViewModel } from "../types";

interface ApplicationRowProps {
  application: ApplicationViewModel;
  onClick: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

/**
 * Single table row component for displaying an application
 * Clickable row for navigation to details, with status dropdown for quick updates
 * Memoized to prevent unnecessary re-renders
 */
const ApplicationRow: React.FC<ApplicationRowProps> = ({ application, onClick, onStatusChange }) => {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(application.id)}
      role="row"
      data-testid={`application-row-${application.id}`}
    >
      <TableCell>
        <CompanyCell companyName={application.company_name} />
      </TableCell>
      <TableCell>
        <PositionCell positionName={application.position_name} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <StatusDropdown
          value={application.status}
          onChange={(s) => onStatusChange(application.id, s)}
          applicationId={application.id}
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(ApplicationRow);
