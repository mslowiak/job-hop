import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { ApplicationRow } from "./ApplicationRow";
import type { ApplicationDto, ApplicationStatus } from "../types";
import type { StatusOption } from "../types/view.types";

interface ApplicationTableProps {
  applications: ApplicationDto[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onRowClick: (id: string) => void;
  statusOptions: StatusOption[];
}

/**
 * Responsive table component displaying applications using Shadcn Table
 * Shows company, position, and status columns with interactive rows
 */
export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onStatusChange,
  onRowClick,
  statusOptions,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="py-3 px-4 text-left font-semibold text-gray-900">
              Firma
            </TableHead>
            <TableHead className="py-3 px-4 text-left font-semibold text-gray-900">
              Stanowisko
            </TableHead>
            <TableHead className="py-3 px-4 text-left font-semibold text-gray-900">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onStatusChange={(status) => onStatusChange(app.id, status)}
              onRowClick={onRowClick}
              options={statusOptions}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
