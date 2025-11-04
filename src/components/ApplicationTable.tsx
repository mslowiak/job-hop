import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ApplicationRow from "./ApplicationRow";
import type { ApplicationStatus } from "../types";
import type { ApplicationViewModel } from "../types";

interface ApplicationTableProps {
  applications: ApplicationViewModel[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
}

/**
 * Responsive table component displaying applications using Shadcn Table
 * Shows company, position, and status columns with interactive rows
 */
export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onStatusChange,
  onRowClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table role="table" aria-label="Applications list">
        <TableHeader>
          <TableRow>
            <TableHead>Firma</TableHead>
            <TableHead>Stanowisko</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              onClick={onRowClick}
              onStatusChange={(id, status) => onStatusChange(id, status)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
