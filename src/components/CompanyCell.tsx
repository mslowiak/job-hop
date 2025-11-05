import React from "react";

interface CompanyCellProps {
  companyName: string;
}

/**
 * Display component for company name in application table
 * Shows company name with proper styling and accessibility
 */
export const CompanyCell: React.FC<CompanyCellProps> = ({ companyName }) => {
  return (
    <div className="font-medium text-gray-900" title={companyName}>
      {companyName}
    </div>
  );
};


