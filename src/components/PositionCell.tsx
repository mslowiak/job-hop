import React from "react";

interface PositionCellProps {
  positionName: string;
}

/**
 * Display component for position name in application table
 * Shows position title with proper styling and accessibility
 */
export const PositionCell: React.FC<PositionCellProps> = ({ positionName }) => {
  return (
    <div className="text-gray-700" title={positionName}>
      {positionName}
    </div>
  );
};
